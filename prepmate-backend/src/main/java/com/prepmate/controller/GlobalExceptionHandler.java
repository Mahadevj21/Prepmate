package com.prepmate.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Messages that indicate a client error (4xx), not a server fault
    private static final Set<String> CLIENT_ERROR_MESSAGES = Set.of(
            "email already exists",
            "user not found",
            "invalid password",
            "question not found",
            "session not found",
            "ai returned no valid questions",
            "no gemini api key configured"
    );

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Internal server error";
        System.err.println("[ERROR] RuntimeException: " + msg);

        // Return 400/404 for known client errors instead of 500
        String lower = msg.toLowerCase();
        if (lower.contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", msg));
        }
        if (CLIENT_ERROR_MESSAGES.stream().anyMatch(lower::contains)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", msg));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", msg));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        System.err.println("[ERROR] Unhandled exception: " + ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Unexpected error"));
    }
}
