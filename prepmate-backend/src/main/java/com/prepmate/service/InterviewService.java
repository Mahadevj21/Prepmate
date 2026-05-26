package com.prepmate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
    private final GenAiService geminiService;
    private final ObjectMapper objectMapper;

    public InterviewService(
            InterviewSessionRepository sessionRepository,
            QuestionRepository questionRepository,
            GenAiService geminiService,
            ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Map<String, Object> generateQuestions(com.prepmate.dto.GenerateInterviewRequest request) {
        String mode = request.getMode() != null ? request.getMode() : "PRACTICE";
        String topic = request.getTopic();
        String difficulty = request.getDifficulty();
        Long userId = request.getUserId();
        String jd = request.getJobDescription();

        if (topic == null || topic.trim().isEmpty()) {
            if (jd != null && !jd.trim().isEmpty()) {
                topic = "Job Description Mock Interview";
            } else {
                topic = "Interview Session";
            }
        }

        InterviewSession session = new InterviewSession();
        session.setUserId(userId);
        session.setTopic(topic);
        session.setDifficulty(difficulty);
        session.setMode(mode);
        session.setOverallScore(0);
        InterviewSession savedSession = sessionRepository.save(session);

        String prompt;
        if ("MOCK".equalsIgnoreCase(mode) && jd != null && !jd.trim().isEmpty()) {
            prompt = "Generate 7 " + difficulty + " level technical interview questions based on the following job description:\n"
                    + jd + "\n\n"
                    + "Return ONLY a JSON array. Each item must have: {\"questionText\": \"string\"}. "
                    + "No numbering. No explanation. Only the JSON array.";
        } else {
            prompt = "Generate 5 " + difficulty + " level technical interview "
                    + "questions about " + topic + " for a Java developer role. "
                    + "Return ONLY a JSON array. Each item must have: {\"questionText\": \"string\"}. "
                    + "No numbering. No explanation. Only the JSON array.";
        }

        String aiResponse = geminiService.ask(prompt);
        if (GenAiService.isError(aiResponse)) {
            throw new RuntimeException(GenAiService.errorMessage(aiResponse));
        }

        JsonNode array;
        try {
            array = AiJsonParser.parseArray(aiResponse);
        } catch (Exception e) {
            throw new RuntimeException("Could not parse questions JSON: " + e.getMessage(), e);
        }
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

        String prompt = "You are a senior technical interviewer. "
                + "Evaluate this answer to the interview question.\n"
                + "Question: " + question.getQuestionText() + "\n"
                + "Answer: " + userAnswer + "\n"
                + "Return ONLY a JSON object with these exact fields:\n"
                + "{\n"
                + "  \"score\": <integer 0-10>,\n"
                + "  \"feedback\": \"<2-sentence overall assessment>\",\n"
                + "  \"missing\": \"<what was missing or could be improved>\",\n"
                + "  \"strengths\": [\"<point 1>\", \"<point 2>\"],\n"
                + "  \"improvements\": [\"<point 1>\", \"<point 2>\"]\n"
                + "}\n"
                + "Use plain text only in string values. Do not use backslashes, regex, or LaTeX. "
                + "No markdown. No explanation. Only the JSON object.";

        String aiResponse = geminiService.ask(prompt);
        if (GenAiService.isError(aiResponse)) {
            throw new RuntimeException(GenAiService.errorMessage(aiResponse));
        }

        JsonNode root;
        try {
            root = AiJsonParser.parseObject(aiResponse);
        } catch (Exception e) {
            throw new RuntimeException("Could not parse evaluation JSON: " + e.getMessage(), e);
        }
        int score = root.path("score").asInt(0);
        String feedback = root.path("feedback").asText("");
        String missing = root.path("missing").asText("");

        // Build strengths array
        ArrayNode strengthsArr = objectMapper.createArrayNode();
        JsonNode strengthsNode = root.path("strengths");
        if (strengthsNode.isArray()) {
            strengthsNode.forEach(s -> strengthsArr.add(s.asText()));
        }

        // Build improvements array
        ArrayNode improvementsArr = objectMapper.createArrayNode();
        JsonNode improvementsNode = root.path("improvements");
        if (improvementsNode.isArray()) {
            improvementsNode.forEach(s -> improvementsArr.add(s.asText()));
        }

        // Store full structured evaluation as JSON in aiFeedback
        try {
            ObjectNode structured = objectMapper.createObjectNode();
            structured.put("feedback", feedback);
            structured.put("missing", missing);
            structured.set("strengths", strengthsArr);
            structured.set("improvements", improvementsArr);
            question.setAiFeedback(objectMapper.writeValueAsString(structured));
        } catch (Exception e) {
            // fallback to plain text if serialization fails
            question.setAiFeedback(feedback + (missing.isBlank() ? "" : " | Missing: " + missing));
        }

        question.setAiScore(score);
        questionRepository.save(question);

        // Update session overall score after each answer
        updateSessionScore(question.getSessionId());

        return question;
    }

    private void updateSessionScore(Long sessionId) {
        List<Question> allQuestions = questionRepository.findBySessionIdOrderById(sessionId);
        int total = 0;
        long answered = 0;
        for (Question q : allQuestions) {
            if (q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty()) {
                total += q.getAiScore();
                answered++;
            }
        }
        if (answered > 0) {
            final int finalScore = (int) (total / answered);
            sessionRepository.findById(sessionId).ifPresent(s -> {
                s.setOverallScore(finalScore);
                sessionRepository.save(s);
            });
        }
    }

    public List<InterviewSession> getUserInterviewHistory(Long userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, Object> getSessionDetails(Long sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Question> questions = questionRepository.findBySessionIdOrderById(sessionId);

        // Calculate overall score from answered questions
        int totalScore = 0;
        long answeredCount = 0;
        for (Question q : questions) {
            if (q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty()) {
                totalScore += q.getAiScore();
                answeredCount++;
            }
        }

        int overallScore = answeredCount > 0 ? (int) (totalScore / answeredCount) : 0;
        session.setOverallScore(overallScore);
        sessionRepository.save(session); // persist the calculated score

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("session", session);
        result.put("questions", questions);
        return result;
    }
}
