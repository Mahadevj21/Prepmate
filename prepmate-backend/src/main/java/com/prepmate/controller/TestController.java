package com.prepmate.controller;

import com.prepmate.service.GenAiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final GenAiService genAiService;

    public TestController(GenAiService genAiService) {
        this.genAiService = genAiService;
    }

    @GetMapping("/ai")
    public String ai(@RequestParam String prompt) {
        return genAiService.ask(prompt);
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}
