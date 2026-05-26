package com.prepmate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Google Gemini API client with response caching and key rotation on quota errors.
 */
@Service
public class GenAiService {

    public static final String ERROR_PREFIX = "AI_ERROR:";

    private static final String GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final Pattern RETRY_IN_MESSAGE = Pattern.compile("retry in ([0-9.]+)s", Pattern.CASE_INSENSITIVE);

    private final String modelId;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final List<String> apiKeys = new ArrayList<>();
    private final ResponseCache cache;

    public GenAiService(
            @Value("${gemini.api.key:}") String primaryKey,
            @Value("${gemini.api.key2:}") String key2,
            @Value("${gemini.api.key3:}") String key3,
            @Value("${gemini.model:gemini-2.5-flash}") String modelId,
            ObjectMapper objectMapper,
            ResponseCache cache) {

        this.objectMapper = objectMapper;
        this.cache = cache;
        this.modelId = modelId;

        addKeyIfPresent(primaryKey);
        addKeyIfPresent(key2);
        addKeyIfPresent(key3);
    }

    @PostConstruct
    void logStartupConfig() {
        System.out.println("[AI] Provider: Gemini | Model: " + modelId
                + " | Keys loaded: " + apiKeys.size());
        if (apiKeys.isEmpty()) {
            System.err.println("[AI] WARNING: No Gemini API key configured. "
                    + "Set gemini.api.key in application.properties or GEMINI_API_KEY env var.");
        }
    }

    private void addKeyIfPresent(String key) {
        if (key != null && !key.isBlank() && !key.contains("YOUR_GEMINI")) {
            apiKeys.add(key.trim());
        }
    }

    public String ask(String prompt) {
        if (apiKeys.isEmpty()) {
            return error("No Gemini API key configured. Add gemini.api.key in application.properties.");
        }

        String cachedResponse = cache.get(prompt);
        if (cachedResponse != null) {
            return cachedResponse;
        }

        String lastError = "AI request failed.";
        for (int keyIndex = 0; keyIndex < apiKeys.size(); keyIndex++) {
            String apiKey = apiKeys.get(keyIndex);
            String result = callGeminiWithRetries(prompt, apiKey, 2);

            if (!result.startsWith(ERROR_PREFIX)) {
                cache.put(prompt, result);
                return result;
            }

            lastError = result.substring(ERROR_PREFIX.length());
            boolean quotaExhausted = lastError.toLowerCase().contains("quota")
                    || lastError.toLowerCase().contains("rate limit")
                    || lastError.toLowerCase().contains("resource_exhausted");

            if (!quotaExhausted || keyIndex == apiKeys.size() - 1) {
                return result;
            }

            System.err.println("[AI] Key " + (keyIndex + 1) + " quota issue, trying next key...");
        }

        return error(lastError);
    }

    private String callGeminiWithRetries(String prompt, String apiKey, int maxAttempts) {
        String lastError = "AI request failed.";

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            HttpResult httpResult = sendGeminiRequest(prompt, apiKey);

            if (httpResult.success) {
                System.out.println("[AI/Gemini] Success (model=" + modelId + ", attempt=" + attempt + ")");
                return httpResult.text;
            }

            lastError = httpResult.errorMessage;

            if (httpResult.retryable && attempt < maxAttempts) {
                long waitMs = Math.min(httpResult.retryAfterSeconds * 1000L, 10_000L);
                System.err.println("[AI] Retryable error, waiting " + waitMs + "ms (attempt "
                        + attempt + "/" + maxAttempts + "): " + lastError);
                sleep(waitMs);
                continue;
            }

            break;
        }

        return error(lastError);
    }

    private HttpResult sendGeminiRequest(String prompt, String apiKey) {
        try {
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", prompt);
            ObjectNode contentItem = objectMapper.createObjectNode();
            contentItem.set("parts", objectMapper.createArrayNode().add(part));
            ObjectNode body = objectMapper.createObjectNode();
            body.set("contents", objectMapper.createArrayNode().add(contentItem));
            String requestBody = objectMapper.writeValueAsString(body);

            String url = GEMINI_BASE + modelId + ":generateContent?key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofMinutes(2))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 429) {
                long retryAfter = parseRetryDelay(response.body());
                String msg = extractApiErrorMessage(response.body());
                return HttpResult.retryable(msg, retryAfter);
            }

            if (response.statusCode() == 503) {
                String msg = extractApiErrorMessage(response.body());
                return HttpResult.retryable(
                        msg.isBlank() ? "Gemini service temporarily unavailable." : msg, 3);
            }

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String msg = extractApiErrorMessage(response.body());
                if (msg.isBlank()) {
                    msg = "Gemini API error (HTTP " + response.statusCode() + ").";
                }
                System.err.println("[AI/Gemini ERROR] Status: " + response.statusCode()
                        + " | Body: " + response.body());
                return HttpResult.failure(msg);
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates")
                    .path(0).path("content").path("parts").path(0).path("text");

            if (textNode.isMissingNode() || !textNode.isTextual()) {
                System.err.println("[AI/Gemini] Unexpected response: " + response.body());
                return HttpResult.failure("Gemini returned an empty or invalid response.");
            }

            return HttpResult.ok(textNode.asText());

        } catch (Exception e) {
            System.err.println("[AI/Gemini] Exception: " + e.getMessage());
            return HttpResult.failure("Could not reach Gemini API: " + e.getMessage());
        }
    }

    private static String extractApiErrorMessage(String body) {
        try {
            JsonNode root = new ObjectMapper().readTree(body);
            String message = root.path("error").path("message").asText("");
            String status = root.path("error").path("status").asText("");
            if (!message.isBlank() && !status.isBlank()) {
                return status + ": " + message;
            }
            return message.isBlank() ? status : message;
        } catch (Exception e) {
            return "";
        }
    }

    private long parseRetryDelay(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode details = root.path("error").path("details");
            for (JsonNode detail : details) {
                JsonNode retryDelay = detail.path("retryDelay");
                if (!retryDelay.isMissingNode()) {
                    return parseSeconds(retryDelay.asText());
                }
            }
            String message = root.path("error").path("message").asText("");
            Matcher matcher = RETRY_IN_MESSAGE.matcher(message);
            if (matcher.find()) {
                return Math.max(1, Math.round(Double.parseDouble(matcher.group(1))));
            }
        } catch (Exception ignored) {
        }
        return 5;
    }

    private static long parseSeconds(String raw) {
        if (raw == null || raw.isBlank()) {
            return 5;
        }
        String val = raw.replace("s", "").trim();
        return Math.max(1, Math.round(Double.parseDouble(val)));
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static String error(String message) {
        return ERROR_PREFIX + message;
    }

    public static boolean isError(String response) {
        return response != null && response.startsWith(ERROR_PREFIX);
    }

    public static String errorMessage(String response) {
        if (response == null) {
            return "AI request failed.";
        }
        if (response.startsWith(ERROR_PREFIX)) {
            return response.substring(ERROR_PREFIX.length());
        }
        return response;
    }

    private record HttpResult(boolean success, String text, String errorMessage,
                              boolean retryable, long retryAfterSeconds) {

        static HttpResult ok(String text) {
            return new HttpResult(true, text, null, false, 0);
        }

        static HttpResult failure(String message) {
            return new HttpResult(false, null, message, false, 0);
        }

        static HttpResult retryable(String message, long retryAfterSeconds) {
            return new HttpResult(false, null, message, true, retryAfterSeconds);
        }
    }
}
