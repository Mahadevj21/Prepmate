package com.prepmate.service;

import com.prepmate.model.Roadmap;
import com.prepmate.repository.RoadmapRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final GenAiService geminiService;

    public RoadmapService(RoadmapRepository roadmapRepository, GenAiService geminiService) {
        this.roadmapRepository = roadmapRepository;
        this.geminiService = geminiService;
    }

    public Roadmap generateRoadmap(String goal, Long userId) {
        String prompt = "Generate a 4-week learning roadmap for: " + goal
                + ". Return ONLY valid JSON in this exact format: "
                + "{\"weeks\":[{\"weekNumber\":1,\"title\":\"string\",\"topics\":[\"string\"]}]}"
                + " No explanation. No markdown. No code fences. Only the JSON object.";

        String aiResponse = geminiService.ask(prompt);
        if (GenAiService.isError(aiResponse)) {
            throw new RuntimeException(GenAiService.errorMessage(aiResponse));
        }

        // Strip markdown code fences if Gemini wraps the JSON anyway
        String cleaned = stripMarkdownFences(aiResponse.trim());

        Roadmap roadmap = new Roadmap();
        roadmap.setUserId(userId);
        roadmap.setTitle(titleFromGoal(goal));
        roadmap.setGoal(goal);
        roadmap.setGeneratedContent(cleaned);
        roadmap.setProgressPercent(0);

        return roadmapRepository.save(roadmap);
    }

    public List<Roadmap> getUserRoadmaps(Long userId) {
        return roadmapRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private static String stripMarkdownFences(String raw) {
        if (raw.startsWith("```")) {
            int firstNl = raw.indexOf('\n');
            if (firstNl > 0) {
                raw = raw.substring(firstNl + 1);
            }
            int fence = raw.lastIndexOf("```");
            if (fence >= 0) {
                raw = raw.substring(0, fence);
            }
            raw = raw.trim();
        }
        return raw;
    }

    private static String titleFromGoal(String goal) {
        if (goal == null || goal.isBlank()) {
            return "Learning roadmap";
        }
        String trimmed = goal.trim();
        return trimmed.length() <= 200 ? trimmed : trimmed.substring(0, 197) + "...";
    }
}
