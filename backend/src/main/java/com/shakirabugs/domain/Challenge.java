package com.shakirabugs.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
public class Challenge {
    @Id
    private String id;
    private String title;
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;
    private String file;
    @Column(length = 1000)
    private String alert;
    @Column(length = 1000)
    private String hint;
    @Enumerated(EnumType.STRING)
    private ChallengeStatus status = ChallengeStatus.PENDING;
    private Instant announcedAt;
    private String solvedBy;
    private Instant solvedAt;
    private String solvedRunUrl;

    protected Challenge() {}

    public Challenge(String id) { this.id = id; }

    public int points() { return difficulty.points(); }

    public void announce() {
        status = ChallengeStatus.ANNOUNCED;
        announcedAt = Instant.now();
    }

    public void solve(String githubUser, String runUrl) {
        status = ChallengeStatus.SOLVED;
        solvedBy = githubUser;
        solvedAt = Instant.now();
        solvedRunUrl = runUrl;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public String getFile() { return file; }
    public void setFile(String file) { this.file = file; }
    public String getAlert() { return alert; }
    public void setAlert(String alert) { this.alert = alert; }
    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
    public ChallengeStatus getStatus() { return status; }
    public void setStatus(ChallengeStatus status) { this.status = status; }
    public Instant getAnnouncedAt() { return announcedAt; }
    public String getSolvedBy() { return solvedBy; }
    public Instant getSolvedAt() { return solvedAt; }
    public String getSolvedRunUrl() { return solvedRunUrl; }
}
