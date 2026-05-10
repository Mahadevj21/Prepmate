package com.prepmate.controller;

import com.prepmate.dto.GenerateRoadmapRequest;
import com.prepmate.model.Roadmap;
import com.prepmate.service.RoadmapService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Roadmap> generate(@Valid @RequestBody GenerateRoadmapRequest request) {
        Roadmap saved = roadmapService.generateRoadmap(request.getGoal(), request.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
