package com.prepmate.controller;

import com.prepmate.dto.EvaluateAnswerRequest;
import com.prepmate.dto.GenerateInterviewRequest;
import com.prepmate.model.Question;
import com.prepmate.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generate(@Valid @RequestBody GenerateInterviewRequest request) {
        Map<String, Object> body = interviewService.generateQuestions(
                request.getTopic(),
                request.getDifficulty(),
                request.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Question> evaluate(@Valid @RequestBody EvaluateAnswerRequest request) {
        Question updated = interviewService.evaluateAnswer(request.getQuestionId(), request.getUserAnswer());
        return ResponseEntity.ok(updated);
    }
}
