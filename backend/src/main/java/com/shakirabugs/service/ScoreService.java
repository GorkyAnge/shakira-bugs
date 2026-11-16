package com.shakirabugs.service;

import com.shakirabugs.domain.Challenge;
import com.shakirabugs.domain.ChallengeStatus;
import com.shakirabugs.dto.Dtos.CiResultRequest;
import com.shakirabugs.dto.Dtos.CiResultResponse;
import com.shakirabugs.repo.ChallengeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/** Convierte los resultados de CI en puntos. El primero que arregla un reto se lleva los puntos. */
@Service
public class ScoreService {
    private static final Logger log = LoggerFactory.getLogger(ScoreService.class);

    private final ChallengeRepository challenges;
    private final PlayerService players;
    private final ShakiraService shakira;
    private final ChallengeService challengeService;
    /** Un mismo commit puede llegar dos veces (CI de push y de pull_request): solo procesamos el primero. */
    private final Set<String> seenCommits = Collections.newSetFromMap(new LinkedHashMap<>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Boolean> eldest) {
            return size() > 500;
        }
    });

    public ScoreService(ChallengeRepository challenges, PlayerService players, ShakiraService shakira, ChallengeService challengeService) {
        this.challenges = challenges;
        this.players = players;
        this.shakira = shakira;
        this.challengeService = challengeService;
    }

    @Transactional
    public synchronized CiResultResponse process(CiResultRequest req) {
        var player = players.findOrCreate(req.githubUser());
        if (req.sha() != null && !req.sha().isBlank() && !seenCommits.add(player.getGithubUser() + "@" + req.sha())) {
            log.info("Commit {} de {} ya procesado, se ignora", req.sha(), player.getGithubUser());
            return new CiResultResponse(player.getGithubUser(), List.of(), 0, player.getPoints());
        }
        List<Challenge> solved = new ArrayList<>();
        for (String id : Optional.ofNullable(req.passed()).orElse(List.of())) {
            challenges.findById(id)
                    .filter(c -> c.getStatus() != ChallengeStatus.SOLVED)
                    .ifPresent(c -> {
                        c.solve(player.getGithubUser(), req.runUrl());
                        player.award(c.points());
                        solved.add(c);
                    });
        }
        log.info("CI de {} ({} {}): nuevos resueltos {}", player.getGithubUser(), req.event(), req.branch(),
                solved.stream().map(Challenge::getId).toList());

        if (!solved.isEmpty()) {
            shakira.congratulate(player, solved, req.runUrl());
            players.broadcast();
            challengeService.broadcast();
        } else if ("pull_request".equals(req.event())) {
            shakira.encourage(player.getGithubUser(), req.branch());
        }
        int awarded = solved.stream().mapToInt(Challenge::points).sum();
        return new CiResultResponse(player.getGithubUser(), solved.stream().map(Challenge::getId).toList(), awarded, player.getPoints());
    }
}
