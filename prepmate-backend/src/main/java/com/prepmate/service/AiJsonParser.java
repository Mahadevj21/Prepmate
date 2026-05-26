package com.prepmate.service;

import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;

/**
 * Parses JSON from LLM responses. Models often emit invalid escapes (e.g. {@code \s} in feedback).
 */
public final class AiJsonParser {

    private static final JsonMapper LENIENT = JsonMapper.builder()
            .enable(JsonReadFeature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER)
            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS)
            .build();

    private AiJsonParser() {
    }

    public static JsonNode parseObject(String raw) {
        String cleaned = extractJsonFragment(raw.trim(), '{', '}');
        return readTree(cleaned, true);
    }

    public static JsonNode parseArray(String raw) {
        String cleaned = extractJsonFragment(raw.trim(), '[', ']');
        return readTree(cleaned, false);
    }

    private static JsonNode readTree(String cleaned, boolean expectObject) {
        Exception firstError = null;
        for (String candidate : new String[]{cleaned, escapeInvalidBackslashes(cleaned)}) {
            try {
                JsonNode node = LENIENT.readTree(candidate);
                if (expectObject && !node.isObject()) {
                    throw new IllegalArgumentException("Not a JSON object");
                }
                if (!expectObject && !node.isArray()) {
                    throw new IllegalArgumentException("Not a JSON array");
                }
                return node;
            } catch (Exception e) {
                if (firstError == null) {
                    firstError = e;
                }
            }
        }
        throw new IllegalArgumentException(firstError != null ? firstError.getMessage() : "Invalid JSON");
    }

    /**
     * Strips optional markdown fences and isolates the outermost array/object.
     */
    static String extractJsonFragment(String raw, char open, char close) {
        String s = raw;
        if (s.startsWith("```")) {
            int firstNl = s.indexOf('\n');
            if (firstNl > 0) {
                s = s.substring(firstNl + 1);
            }
            int fence = s.indexOf("```");
            if (fence >= 0) {
                s = s.substring(0, fence);
            }
            s = s.trim();
        }
        int start = s.indexOf(open);
        int end = s.lastIndexOf(close);
        if (start < 0 || end <= start) {
            throw new IllegalArgumentException("No JSON " + open + close + " in response");
        }
        return s.substring(start, end + 1);
    }

    /**
     * Fixes lone backslashes before non-JSON escape characters (e.g. {@code \s} -> {@code \\s}).
     */
    static String escapeInvalidBackslashes(String json) {
        StringBuilder out = new StringBuilder(json.length() + 32);
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c != '\\' || i + 1 >= json.length()) {
                out.append(c);
                continue;
            }
            char next = json.charAt(i + 1);
            if (next == 'u' && i + 5 < json.length()) {
                String hex = json.substring(i + 2, i + 6);
                if (hex.matches("[0-9a-fA-F]{4}")) {
                    out.append(json, i, i + 6);
                    i += 5;
                    continue;
                }
            }
            if ("\"\\/bfnrt".indexOf(next) >= 0) {
                out.append('\\').append(next);
                i++;
                continue;
            }
            out.append("\\\\").append(next);
            i++;
        }
        return out.toString();
    }
}
