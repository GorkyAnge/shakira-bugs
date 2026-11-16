package com.shakirabugs.service;

import com.shakirabugs.domain.Player;
import com.shakirabugs.dto.Dtos.PlayerDto;
import com.shakirabugs.repo.PlayerRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class PlayerService {
    private final PlayerRepository players;
    private final SimpMessagingTemplate messaging;

    public PlayerService(PlayerRepository players, SimpMessagingTemplate messaging) {
        this.players = players;
        this.messaging = messaging;
    }

    public static String normalize(String githubUser) {
        return githubUser.trim().toLowerCase(Locale.ROOT);
    }

    public Optional<Player> find(String githubUser) {
        return players.findByGithubUser(normalize(githubUser));
    }

    /** @return el jugador y si es nuevo */
    @Transactional
    public JoinResult join(String githubUser, String displayName) {
        var existing = find(githubUser);
        if (existing.isPresent()) {
            existing.get().setDisplayName(displayName.trim());
            return new JoinResult(existing.get(), false);
        }
        var created = players.save(new Player(normalize(githubUser), displayName.trim()));
        return new JoinResult(created, true);
    }

    @Transactional
    public Player findOrCreate(String githubUser) {
        return find(githubUser).orElseGet(() -> players.save(new Player(normalize(githubUser), githubUser)));
    }

    public List<PlayerDto> leaderboard() {
        var rank = new AtomicInteger();
        return players.findAllByOrderByPointsDescSolvedCountDescJoinedAtAsc().stream()
                .map(p -> new PlayerDto(rank.incrementAndGet(), p.getGithubUser(), p.getDisplayName(), p.getPoints(), p.getSolvedCount()))
                .toList();
    }

    public void broadcast() {
        messaging.convertAndSend("/topic/leaderboard", leaderboard());
    }

    public record JoinResult(Player player, boolean isNew) {}
}
