package com.prepmate.service;

import com.prepmate.model.Roadmap;
import com.prepmate.repository.RoadmapRepository;
import org.springframework.stereotype.Service;

@Service
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final GeminiService geminiService;

    public RoadmapService(RoadmapRepository roadmapRepository, GeminiService geminiService) {
        this.roadmapRepository = roadmapRepository;
        this.geminiService = geminiService;
    }

    public Roadmap generateRoadmap(String goal, Long userId) {
        String prompt = "Generate a 4-week learning roadmap for: " + goal
                + ". Return ONLY valid JSON in this format: "
                + "{\"weeks\":[{\"weekNumber\":1,\"title\":\"string\",\"topics\":[\"string\"]}]}"
                + " No explanation. No markdown. Only the JSON object.";

        String aiResponse = geminiService.ask(prompt);

        Roadmap roadmap = new Roadmap();
        roadmap.setUserId(userId);
        roadmap.setTitle(titleFromGoal(goal));
        roadmap.setGoal(goal);
        roadmap.setGeneratedContent(aiResponse);
        roadmap.setProgressPercent(0);

        return roadmapRepository.save(roadmap);
    }

    private static String titleFromGoal(String goal) {
        if (goal == null || goal.isBlank()) {
            return "Learning roadmap";
        }
        String trimmed = goal.trim();
        return trimmed.length() <= 200 ? trimmed : trimmed.substring(0, 197) + "...";
    }
}
