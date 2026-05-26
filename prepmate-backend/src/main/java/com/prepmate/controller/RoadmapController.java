package com.prepmate.controller;

import com.prepmate.dto.GenerateRoadmapRequest;
import com.prepmate.model.Roadmap;
import com.prepmate.service.RoadmapService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Roadmap>> getHistory(@PathVariable Long userId) {
        List<Roadmap> roadmaps = roadmapService.getUserRoadmaps(userId);
        return ResponseEntity.ok(roadmaps);
    }
}
