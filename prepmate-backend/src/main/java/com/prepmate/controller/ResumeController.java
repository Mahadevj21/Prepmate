package com.prepmate.controller;

import com.prepmate.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping(value = "/analyze", produces = "application/json")
    public ResponseEntity<String> analyze(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"File is empty\"}");
        }
        if (!"application/pdf".equals(file.getContentType())) {
            return ResponseEntity.badRequest().body("{\"error\": \"Only PDF files are supported\"}");
        }

        try {
            String analysis = resumeService.analyzeResume(file);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
