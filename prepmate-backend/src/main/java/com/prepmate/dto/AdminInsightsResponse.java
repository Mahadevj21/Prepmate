package com.prepmate.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AdminInsightsResponse {

    private PlatformMetrics platformMetrics;
    private UserAnalytics userAnalytics;
    private EngagementMetrics engagementMetrics;
    private PerformanceMetrics performanceMetrics;

    public AdminInsightsResponse() {
    }

    public AdminInsightsResponse(PlatformMetrics platformMetrics, UserAnalytics userAnalytics,
                                 EngagementMetrics engagementMetrics, PerformanceMetrics performanceMetrics) {
        this.platformMetrics = platformMetrics;
        this.userAnalytics = userAnalytics;
        this.engagementMetrics = engagementMetrics;
        this.performanceMetrics = performanceMetrics;
    }

    // Getters and Setters
    public PlatformMetrics getPlatformMetrics() {
        return platformMetrics;
    }

    public void setPlatformMetrics(PlatformMetrics platformMetrics) {
        this.platformMetrics = platformMetrics;
    }

    public UserAnalytics getUserAnalytics() {
        return userAnalytics;
    }

    public void setUserAnalytics(UserAnalytics userAnalytics) {
        this.userAnalytics = userAnalytics;
    }

    public EngagementMetrics getEngagementMetrics() {
        return engagementMetrics;
    }

    public void setEngagementMetrics(EngagementMetrics engagementMetrics) {
        this.engagementMetrics = engagementMetrics;
    }

    public PerformanceMetrics getPerformanceMetrics() {
        return performanceMetrics;
    }

    public void setPerformanceMetrics(PerformanceMetrics performanceMetrics) {
        this.performanceMetrics = performanceMetrics;
    }

    // Inner classes
    public static class PlatformMetrics {
        private long totalUsers;
        private long totalRoadmaps;
        private long totalInterviews;
        private long totalQuestionsAnswered;
        private double platformAverageScore;
        private LocalDateTime lastUpdated;

        public PlatformMetrics() {
        }

        public PlatformMetrics(long totalUsers, long totalRoadmaps, long totalInterviews,
                               long totalQuestionsAnswered, double platformAverageScore) {
            this.totalUsers = totalUsers;
            this.totalRoadmaps = totalRoadmaps;
            this.totalInterviews = totalInterviews;
            this.totalQuestionsAnswered = totalQuestionsAnswered;
            this.platformAverageScore = platformAverageScore;
            this.lastUpdated = LocalDateTime.now();
        }

        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        public long getTotalRoadmaps() { return totalRoadmaps; }
        public void setTotalRoadmaps(long totalRoadmaps) { this.totalRoadmaps = totalRoadmaps; }
        public long getTotalInterviews() { return totalInterviews; }
        public void setTotalInterviews(long totalInterviews) { this.totalInterviews = totalInterviews; }
        public long getTotalQuestionsAnswered() { return totalQuestionsAnswered; }
        public void setTotalQuestionsAnswered(long totalQuestionsAnswered) { this.totalQuestionsAnswered = totalQuestionsAnswered; }
        public double getPlatformAverageScore() { return platformAverageScore; }
        public void setPlatformAverageScore(double platformAverageScore) { this.platformAverageScore = platformAverageScore; }
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    }

    public static class UserAnalytics {
        private long activeUsers;
        private long newUsersThisMonth;
        private double avgInterviewsPerUser;
        private Map<String, Long> usersByRole;

        public UserAnalytics() {
        }

        public UserAnalytics(long activeUsers, long newUsersThisMonth, double avgInterviewsPerUser,
                             Map<String, Long> usersByRole) {
            this.activeUsers = activeUsers;
            this.newUsersThisMonth = newUsersThisMonth;
            this.avgInterviewsPerUser = avgInterviewsPerUser;
            this.usersByRole = usersByRole;
        }

        public long getActiveUsers() { return activeUsers; }
        public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
        public long getNewUsersThisMonth() { return newUsersThisMonth; }
        public void setNewUsersThisMonth(long newUsersThisMonth) { this.newUsersThisMonth = newUsersThisMonth; }
        public double getAvgInterviewsPerUser() { return avgInterviewsPerUser; }
        public void setAvgInterviewsPerUser(double avgInterviewsPerUser) { this.avgInterviewsPerUser = avgInterviewsPerUser; }
        public Map<String, Long> getUsersByRole() { return usersByRole; }
        public void setUsersByRole(Map<String, Long> usersByRole) { this.usersByRole = usersByRole; }
    }

    public static class EngagementMetrics {
        private double roadmapCompletionRate;
        private double interviewCompletionRate;
        private Map<String, Long> sessionsByDifficulty;
        private Map<String, Long> sessionsByMode;

        public EngagementMetrics() {
        }

        public EngagementMetrics(double roadmapCompletionRate, double interviewCompletionRate,
                                 Map<String, Long> sessionsByDifficulty, Map<String, Long> sessionsByMode) {
            this.roadmapCompletionRate = roadmapCompletionRate;
            this.interviewCompletionRate = interviewCompletionRate;
            this.sessionsByDifficulty = sessionsByDifficulty;
            this.sessionsByMode = sessionsByMode;
        }

        public double getRoadmapCompletionRate() { return roadmapCompletionRate; }
        public void setRoadmapCompletionRate(double roadmapCompletionRate) { this.roadmapCompletionRate = roadmapCompletionRate; }
        public double getInterviewCompletionRate() { return interviewCompletionRate; }
        public void setInterviewCompletionRate(double interviewCompletionRate) { this.interviewCompletionRate = interviewCompletionRate; }
        public Map<String, Long> getSessionsByDifficulty() { return sessionsByDifficulty; }
        public void setSessionsByDifficulty(Map<String, Long> sessionsByDifficulty) { this.sessionsByDifficulty = sessionsByDifficulty; }
        public Map<String, Long> getSessionsByMode() { return sessionsByMode; }
        public void setSessionsByMode(Map<String, Long> sessionsByMode) { this.sessionsByMode = sessionsByMode; }
    }

    public static class PerformanceMetrics {
        private double avgScoreByDifficulty;
        private long averageQuestionsPerSession;
        private double topicPopularity;
        private List<Map<String, Object>> topPerformers;

        public PerformanceMetrics() {
        }

        public PerformanceMetrics(double avgScoreByDifficulty, long averageQuestionsPerSession,
                                  double topicPopularity, List<Map<String, Object>> topPerformers) {
            this.avgScoreByDifficulty = avgScoreByDifficulty;
            this.averageQuestionsPerSession = averageQuestionsPerSession;
            this.topicPopularity = topicPopularity;
            this.topPerformers = topPerformers;
        }

        public double getAvgScoreByDifficulty() { return avgScoreByDifficulty; }
        public void setAvgScoreByDifficulty(double avgScoreByDifficulty) { this.avgScoreByDifficulty = avgScoreByDifficulty; }
        public long getAverageQuestionsPerSession() { return averageQuestionsPerSession; }
        public void setAverageQuestionsPerSession(long averageQuestionsPerSession) { this.averageQuestionsPerSession = averageQuestionsPerSession; }
        public double getTopicPopularity() { return topicPopularity; }
        public void setTopicPopularity(double topicPopularity) { this.topicPopularity = topicPopularity; }
        public List<Map<String, Object>> getTopPerformers() { return topPerformers; }
        public void setTopPerformers(List<Map<String, Object>> topPerformers) { this.topPerformers = topPerformers; }
    }
}
