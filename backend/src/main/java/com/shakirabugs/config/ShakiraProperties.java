package com.shakirabugs.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "shakira")
public record ShakiraProperties(
        String webhookSecret,
        int minDelaySeconds,
        int maxDelaySeconds,
        int maxOpenChallenges,
        boolean autoAnnounce,
        String repoUrl,
        List<String> allowedOrigins) {
}
