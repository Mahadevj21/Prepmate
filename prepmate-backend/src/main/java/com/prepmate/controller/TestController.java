package com.prepmate.controller;

import com.prepmate.service.GeminiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final GeminiService geminiService;

    public TestController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping("/gemini")
    public String gemini(@RequestParam String prompt) {
        return geminiService.ask(prompt);
    }
}
