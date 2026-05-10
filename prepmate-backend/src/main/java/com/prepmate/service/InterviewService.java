package com.prepmate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepmate.model.InterviewSession;
import com.prepmate.model.Question;
import com.prepmate.repository.InterviewSessionRepository;
import com.prepmate.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public InterviewService(
            InterviewSessionRepository sessionRepository,
            QuestionRepository questionRepository,
            GeminiService geminiService,
            ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Map<String, Object> generateQuestions(String topic, String difficulty, Long userId) {
        InterviewSession session = new InterviewSession();
        session.setUserId(userId);
        session.setTopic(topic);
        session.setDifficulty(difficulty);
        session.setMode("PRACTICE");
        session.setOverallScore(0);
        InterviewSession savedSession = sessionRepository.save(session);

        String prompt = "Generate 5 " + difficulty + " level technical interview "
                + "questions about " + topic + " for a Java developer role. "
                + "Return ONLY a JSON array. Each item must have: {\"questionText\": \"string\"}. "
                + "No numbering. No explanation. Only the JSON array.";

        String aiResponse = geminiService.ask(prompt);
        if ("AI service error".equals(aiResponse)) {
            throw new RuntimeException("Failed to generate questions from AI");
        }

        JsonNode array = parseJsonArray(aiResponse);
        List<Question> questions = new ArrayList<>();
        for (JsonNode item : array) {
            JsonNode textNode = item.get("questionText");
            if (textNode == null || !textNode.isTextual()) {
                continue;
            }
            Question q = new Question();
            q.setSessionId(savedSession.getId());
            q.setQuestionText(textNode.asText());
            q.setAiScore(0);
            questions.add(questionRepository.save(q));
        }

        if (questions.isEmpty()) {
            throw new RuntimeException("AI returned no valid questions");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("session", savedSession);
        result.put("questions", questions);
        return result;
    }

    @Transactional
    public Question evaluateAnswer(Long questionId, String userAnswer) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.setUserAnswer(userAnswer);

        String prompt = "You are a senior Java developer interviewer. "
                + "Evaluate this answer to the interview question.\n"
                + "Question: " + question.getQuestionText() + "\n"
                + "Answer: " + userAnswer + "\n"
                + "Give score out of 10, 2-sentence feedback, and what was missing.\n"
                + "Return ONLY JSON: {\"score\": int, \"feedback\": \"string\", \"missing\": \"string\"}\n"
                + "No explanation. Only JSON.";

        String aiResponse = geminiService.ask(prompt);
        if ("AI service error".equals(aiResponse)) {
            throw new RuntimeException("Failed to evaluate answer from AI");
        }

        JsonNode root = parseJsonObject(aiResponse);
        int score = root.path("score").asInt(0);
        String feedback = root.path("feedback").asText("");
        String missing = root.path("missing").asText("");

        question.setAiScore(score);
        question.setAiFeedback(feedback + missing);

        return questionRepository.save(question);
    }

    private JsonNode parseJsonArray(String raw) {
        try {
            String cleaned = extractJsonFragment(raw.trim(), '[', ']');
            JsonNode node = objectMapper.readTree(cleaned);
            if (!node.isArray()) {
                throw new IllegalArgumentException("Not a JSON array");
            }
            return node;
        } catch (Exception e) {
            throw new RuntimeException("Could not parse questions JSON: " + e.getMessage(), e);
        }
    }

    private JsonNode parseJsonObject(String raw) {
        try {
            String cleaned = extractJsonFragment(raw.trim(), '{', '}');
            JsonNode node = objectMapper.readTree(cleaned);
            if (!node.isObject()) {
                throw new IllegalArgumentException("Not a JSON object");
            }
            return node;
        } catch (Exception e) {
            throw new RuntimeException("Could not parse evaluation JSON: " + e.getMessage(), e);
        }
    }

    /**
     * Strips optional markdown fences and isolates the outermost array/object.
     */
    private static String extractJsonFragment(String raw, char open, char close) {
        String s = raw;
        if (s.startsWith("```")) {
            int firstNl = s.indexOf('\n');
            if (firstNl > 0) {
                s = s.substring(firstNl + 1);
            }
            int fence = s.indexOf("```");
            if (fence >= 0) {
                s = s.substring(0, fence);
            }
            s = s.trim();
        }
        int start = s.indexOf(open);
        int end = s.lastIndexOf(close);
        if (start < 0 || end <= start) {
            throw new IllegalArgumentException("No JSON " + open + close + " in response");
        }
        return s.substring(start, end + 1);
    }
}
