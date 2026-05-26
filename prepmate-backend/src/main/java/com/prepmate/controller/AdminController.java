package com.prepmate.controller;

import com.prepmate.dto.AdminInsightsResponse;
import com.prepmate.dto.ChangePasswordRequest;
import com.prepmate.model.User;
import com.prepmate.model.Roadmap;
import com.prepmate.model.InterviewSession;
import com.prepmate.model.Question;
import com.prepmate.repository.UserRepository;
import com.prepmate.repository.RoadmapRepository;
import com.prepmate.repository.InterviewSessionRepository;
import com.prepmate.repository.QuestionRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;
    private final InterviewSessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminController(
            UserRepository userRepository,
            RoadmapRepository roadmapRepository,
            InterviewSessionRepository sessionRepository,
            QuestionRepository questionRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roadmapRepository = roadmapRepository;
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        long totalUsers = userRepository.count();
        long totalRoadmaps = roadmapRepository.count();
        long totalInterviews = sessionRepository.count();

        List<Question> questions = questionRepository.findAll();
        long answeredCount = questions.stream()
                .filter(q -> q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty())
                .count();

        double averageScore = questions.stream()
                .filter(q -> q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty())
                .mapToInt(Question::getAiScore)
                .average()
                .orElse(0.0);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", totalUsers);
        metrics.put("totalRoadmaps", totalRoadmaps);
        metrics.put("totalInterviews", totalInterviews);
        metrics.put("totalQuestionsAnswered", answeredCount);
        metrics.put("averageScore", Math.round(averageScore * 10.0) / 10.0); // round to 1 decimal place

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        List<User> users = userRepository.findAll();
        List<Roadmap> roadmaps = roadmapRepository.findAll();
        List<InterviewSession> sessions = sessionRepository.findAll();
        List<Question> questions = questionRepository.findAll();

        List<Map<String, Object>> userList = users.stream().map(user -> {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", user.getId());
            uMap.put("name", user.getName());
            uMap.put("email", user.getEmail());
            uMap.put("role", user.getRole());
            uMap.put("createdAt", user.getCreatedAt());

            long rCount = roadmaps.stream()
                    .filter(r -> r.getUserId().equals(user.getId()))
                    .count();
            uMap.put("roadmapsCount", rCount);

            List<Long> sessionIds = sessions.stream()
                    .filter(s -> s.getUserId().equals(user.getId()))
                    .map(InterviewSession::getId)
                    .collect(Collectors.toList());
            uMap.put("interviewsCount", sessionIds.size());

            double avgScore = questions.stream()
                    .filter(q -> sessionIds.contains(q.getSessionId()))
                    .filter(q -> q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty())
                    .mapToInt(Question::getAiScore)
                    .average()
                    .orElse(0.0);
            uMap.put("averageScore", Math.round(avgScore * 10.0) / 10.0);

            return uMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(userList);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password for " + user.getEmail() + " has been reset successfully"));
    }

    @GetMapping("/insights")
    public ResponseEntity<AdminInsightsResponse> getDetailedInsights() {
        List<User> allUsers = userRepository.findAll();
        List<Roadmap> allRoadmaps = roadmapRepository.findAll();
        List<InterviewSession> allSessions = sessionRepository.findAll();
        List<Question> allQuestions = questionRepository.findAll();

        // Platform Metrics
        long totalUsers = allUsers.size();
        long totalRoadmaps = allRoadmaps.size();
        long totalInterviews = allSessions.size();
        long totalQuestionsAnswered = allQuestions.stream()
                .filter(q -> q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty())
                .count();
        double platformAvgScore = allQuestions.stream()
                .filter(q -> q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty())
                .mapToInt(Question::getAiScore)
                .average()
                .orElse(0.0);

        AdminInsightsResponse.PlatformMetrics platformMetrics = new AdminInsightsResponse.PlatformMetrics(
                totalUsers, totalRoadmaps, totalInterviews, totalQuestionsAnswered,
                Math.round(platformAvgScore * 10.0) / 10.0
        );

        // User Analytics
        long activeUsers = allSessions.stream().map(InterviewSession::getUserId).distinct().count();
        long newUsersThisMonth = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(LocalDateTime.now().minusMonths(1)))
                .count();
        double avgInterviewsPerUser = totalUsers > 0 ? (double) totalInterviews / totalUsers : 0.0;
        Map<String, Long> usersByRole = allUsers.stream()
                .collect(Collectors.groupingBy(u -> u.getRole() != null ? u.getRole() : "USER", Collectors.counting()));

        AdminInsightsResponse.UserAnalytics userAnalytics = new AdminInsightsResponse.UserAnalytics(
                activeUsers, newUsersThisMonth,
                Math.round(avgInterviewsPerUser * 100.0) / 100.0, usersByRole
        );

        // Engagement Metrics
        Map<String, Long> sessionsByDifficulty = allSessions.stream()
                .collect(Collectors.groupingBy(InterviewSession::getDifficulty, Collectors.counting()));
        Map<String, Long> sessionsByMode = allSessions.stream()
                .collect(Collectors.groupingBy(InterviewSession::getMode, Collectors.counting()));

        AdminInsightsResponse.EngagementMetrics engagementMetrics = new AdminInsightsResponse.EngagementMetrics(
                0.0, 0.0, sessionsByDifficulty, sessionsByMode
        );

        // Performance Metrics
        double avgScoreByDifficulty = allQuestions.stream()
                .filter(q -> q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty())
                .mapToInt(Question::getAiScore)
                .average()
                .orElse(0.0);
        long avgQuestionsPerSession = totalInterviews > 0 ? allQuestions.size() / totalInterviews : 0;
        List<Map<String, Object>> topPerformers = allUsers.stream()
                .map(user -> {
                    List<Long> userSessionIds = allSessions.stream()
                            .filter(s -> s.getUserId().equals(user.getId()))
                            .map(InterviewSession::getId)
                            .collect(Collectors.toList());
                    double userAvgScore = allQuestions.stream()
                            .filter(q -> userSessionIds.contains(q.getSessionId()))
                            .filter(q -> q.getUserAnswer() != null && !q.getUserAnswer().trim().isEmpty())
                            .mapToInt(Question::getAiScore)
                            .average()
                            .orElse(0.0);
                    long userInterviewCount = userSessionIds.size();

                    Map<String, Object> performerMap = new HashMap<>();
                    performerMap.put("userId", user.getId());
                    performerMap.put("name", user.getName());
                    performerMap.put("email", user.getEmail());
                    performerMap.put("avgScore", Math.round(userAvgScore * 10.0) / 10.0);
                    performerMap.put("totalInterviews", userInterviewCount);
                    return performerMap;
                })
                .filter(m -> (Long) m.get("totalInterviews") > 0)
                .sorted((a, b) -> Double.compare((Double) b.get("avgScore"), (Double) a.get("avgScore")))
                .limit(5)
                .collect(Collectors.toList());

        AdminInsightsResponse.PerformanceMetrics performanceMetrics = new AdminInsightsResponse.PerformanceMetrics(
                Math.round(avgScoreByDifficulty * 10.0) / 10.0, avgQuestionsPerSession, 0.0, topPerformers
        );

        AdminInsightsResponse insights = new AdminInsightsResponse(
                platformMetrics, userAnalytics, engagementMetrics, performanceMetrics
        );

        return ResponseEntity.ok(insights);
    }
}
