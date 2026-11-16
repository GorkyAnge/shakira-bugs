package com.shakirabugs.service;

import com.shakirabugs.domain.ChatMessage;
import com.shakirabugs.dto.Dtos.MessageDto;
import com.shakirabugs.repo.ChallengeRepository;
import com.shakirabugs.repo.ChatMessageRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ChatService {
    private final ChatMessageRepository messages;
    private final ChallengeRepository challenges;
    private final ChallengeService challengeService;
    private final SimpMessagingTemplate messaging;

    public ChatService(ChatMessageRepository messages, ChallengeRepository challenges,
                       ChallengeService challengeService, SimpMessagingTemplate messaging) {
        this.messages = messages;
        this.challenges = challenges;
        this.challengeService = challengeService;
        this.messaging = messaging;
    }

    public MessageDto post(ChatMessage message) {
        MessageDto dto = toDto(messages.save(message));
        messaging.convertAndSend("/topic/messages", dto);
        return dto;
    }

    public List<MessageDto> history() {
        List<MessageDto> list = new ArrayList<>(messages.findTop200ByOrderByIdDesc().stream().map(this::toDto).toList());
        Collections.reverse(list);
        return list;
    }

    private MessageDto toDto(ChatMessage m) {
        var challenge = m.getChallengeId() == null ? null
                : challenges.findById(m.getChallengeId()).map(challengeService::toDto).orElse(null);
        return new MessageDto(m.getId(), m.getSenderName(), m.getSenderGithub(), m.getKind(), m.getContent(),
                challenge, m.getPoints(), m.getCreatedAt());
    }
}
