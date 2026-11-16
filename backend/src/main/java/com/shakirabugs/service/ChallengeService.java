package com.shakirabugs.service;

import com.shakirabugs.config.ShakiraProperties;
import com.shakirabugs.domain.Challenge;
import com.shakirabugs.dto.Dtos.ChallengeDto;
import com.shakirabugs.repo.ChallengeRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ChallengeService {
    private final ChallengeRepository repo;
    private final ShakiraProperties props;
    private final SimpMessagingTemplate messaging;

    public ChallengeService(ChallengeRepository repo, ShakiraProperties props, SimpMessagingTemplate messaging) {
        this.repo = repo;
        this.props = props;
        this.messaging = messaging;
    }

    public ChallengeDto toDto(Challenge c) {
        String fileUrl = props.repoUrl().replaceAll("/$", "") + "/blob/main/" + c.getFile();
        return new ChallengeDto(c.getId(), c.getTitle(), c.getDifficulty(), c.getDifficulty().label(), c.points(),
                c.getFile(), fileUrl, c.getStatus(), c.getAlert(), c.getAnnouncedAt(), c.getSolvedBy(), c.getSolvedAt());
    }

    public List<ChallengeDto> all() {
        return repo.findAll().stream()
                .sorted(Comparator.comparing(Challenge::getStatus).thenComparing(c -> c.getDifficulty().ordinal()))
                .map(this::toDto)
                .toList();
    }

    public void broadcast() {
        messaging.convertAndSend("/topic/challenges", all());
    }
}
