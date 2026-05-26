package com.prepmate.service;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory cache for API responses.
 * Reduces duplicate requests and API quota usage.
 */
@Component
public class ResponseCache {

    private static final int MAX_CACHE_SIZE = 500;
    private static final long CACHE_TTL_MINUTES = 60; // Cache for 1 hour

    private static class CachedResponse {
        String response;
        long createdAt;

        CachedResponse(String response) {
            this.response = response;
            this.createdAt = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - createdAt > CACHE_TTL_MINUTES * 60 * 1000;
        }
    }

    private final Map<String, CachedResponse> cache = new ConcurrentHashMap<>();

    /**
     * Get cached response, returns null if not found or expired.
     */
    public String get(String prompt) {
        String key = hashPrompt(prompt);
        CachedResponse cached = cache.get(key);

        if (cached != null && !cached.isExpired()) {
            System.out.println("[Cache] HIT for prompt length: " + prompt.length());
            return cached.response;
        }

        if (cached != null) {
            cache.remove(key);
        }
        return null;
    }

    /**
     * Store response in cache.
     */
    public void put(String prompt, String response) {
        String key = hashPrompt(prompt);

        // Simple eviction: if cache is full, clear oldest entries
        if (cache.size() >= MAX_CACHE_SIZE) {
            cache.entrySet().stream()
                    .sorted((a, b) -> Long.compare(a.getValue().createdAt, b.getValue().createdAt))
                    .limit(Math.max(1, MAX_CACHE_SIZE / 10))
                    .forEach(entry -> cache.remove(entry.getKey()));
        }

        cache.put(key, new CachedResponse(response));
        System.out.println("[Cache] STORED response (cache size: " + cache.size() + ")");
    }

    public void clear() {
        cache.clear();
        System.out.println("[Cache] Cleared all cached responses");
    }

    public int size() {
        return cache.size();
    }

    private String hashPrompt(String prompt) {
        return Integer.toHexString(prompt.hashCode());
    }
}
