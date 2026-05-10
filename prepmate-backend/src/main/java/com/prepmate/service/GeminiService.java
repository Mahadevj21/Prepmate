package com.prepmate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class GeminiService {

    private static final String GEMINI_BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private final String apiKey;
    private final String modelId;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    public GeminiService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.model:gemini-2.0-flash}") String modelId,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.modelId = modelId;
        this.objectMapper = objectMapper;
    }

    public String ask(String prompt) {
        try {
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", prompt);
            ObjectNode contentItem = objectMapper.createObjectNode();
            contentItem.set("parts", objectMapper.createArrayNode().add(part));
            ObjectNode body = objectMapper.createObjectNode();
            body.set("contents", objectMapper.createArrayNode().add(contentItem));
            String requestBody = objectMapper.writeValueAsString(body);

            String queryKey = URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
            String url = GEMINI_BASE + modelId + ":generateContent?key=" + queryKey;
            URI uri = URI.create(url);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofMinutes(2))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return "AI service error";
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || !textNode.isTextual()) {
                return "AI service error";
            }

            return textNode.asText();
        } catch (Exception e) {
            return "AI service error";
        }
    }
}
