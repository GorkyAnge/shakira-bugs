package com.shakirabugs.dto;

import com.shakirabugs.domain.ChallengeStatus;
import com.shakirabugs.domain.Difficulty;
import com.shakirabugs.domain.MessageKind;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class Dtos {
    private Dtos() {}

    public static final String GITHUB_USER_REGEX = "^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$";

    public record ChallengeDto(String id, String title, Difficulty difficulty, String difficultyLabel, int points,
                               String file, String fileUrl, ChallengeStatus status, String alert,
                               Instant announcedAt, String solvedBy, Instant solvedAt) {}

    public record MessageDto(Long id, String senderName, String senderGithub, MessageKind kind, String content,
                             ChallengeDto challenge, Integer points, Instant createdAt) {}

    public record PlayerDto(int rank, String githubUser, String displayName, int points, int solvedCount) {}

    public record JoinRequest(
            @NotBlank @Size(max = 40) String displayName,
            @NotBlank @Pattern(regexp = GITHUB_USER_REGEX, message = "usuario de GitHub inválido") String githubUser) {}

    public record SendMessageRequest(
            @NotBlank @Pattern(regexp = GITHUB_USER_REGEX) String githubUser,
            @NotBlank @Size(max = 1000) String content) {}

    /** Lo que envía GitHub Actions cuando termina de evaluar un push o PR. */
    public record CiResultRequest(
            @NotBlank @Pattern(regexp = GITHUB_USER_REGEX) String githubUser,
            String event,
            String branch,
            String sha,
            String runUrl,
            Integer prNumber,
            List<@Pattern(regexp = "^[a-z0-9-]{1,60}$") String> passed,
            List<@Pattern(regexp = "^[a-z0-9-]{1,60}$") String> failed) {}

    public record CiResultResponse(String githubUser, List<String> newlySolved, int pointsAwarded, int totalPoints) {}
}
