package com.shakirabugs.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String senderName;
    /** null cuando escribe Shakira o el sistema */
    private String senderGithub;
    @Enumerated(EnumType.STRING)
    private MessageKind kind;
    @Column(length = 2000)
    private String content;
    private String challengeId;
    private Integer points;
    private Instant createdAt = Instant.now();

    protected ChatMessage() {}

    public ChatMessage(String senderName, String senderGithub, MessageKind kind, String content, String challengeId, Integer points) {
        this.senderName = senderName;
        this.senderGithub = senderGithub;
        this.kind = kind;
        this.content = content;
        this.challengeId = challengeId;
        this.points = points;
    }

    public Long getId() { return id; }
    public String getSenderName() { return senderName; }
    public String getSenderGithub() { return senderGithub; }
    public MessageKind getKind() { return kind; }
    public String getContent() { return content; }
    public String getChallengeId() { return challengeId; }
    public Integer getPoints() { return points; }
    public Instant getCreatedAt() { return createdAt; }
}
