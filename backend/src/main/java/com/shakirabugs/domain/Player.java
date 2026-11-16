package com.shakirabugs.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String githubUser;
    private String displayName;
    private int points;
    private int solvedCount;
    private Instant joinedAt = Instant.now();

    protected Player() {}

    public Player(String githubUser, String displayName) {
        this.githubUser = githubUser;
        this.displayName = displayName;
    }

    public void award(int pts) {
        points += pts;
        solvedCount++;
    }

    public Long getId() { return id; }
    public String getGithubUser() { return githubUser; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public int getPoints() { return points; }
    public int getSolvedCount() { return solvedCount; }
    public Instant getJoinedAt() { return joinedAt; }
}
