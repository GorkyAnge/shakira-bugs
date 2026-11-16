package com.shakirabugs.web;

import com.shakirabugs.domain.ChatMessage;
import com.shakirabugs.domain.MessageKind;
import com.shakirabugs.dto.Dtos.*;
import com.shakirabugs.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final ChatService chat;
    private final PlayerService players;
    private final ChallengeService challenges;
    private final ShakiraService shakira;

    public ApiController(ChatService chat, PlayerService players, ChallengeService challenges, ShakiraService shakira) {
        this.chat = chat;
        this.players = players;
        this.challenges = challenges;
        this.shakira = shakira;
    }

    @GetMapping("/messages")
    public List<MessageDto> messages() {
        return chat.history();
    }

    @PostMapping("/messages")
    public MessageDto send(@Valid @RequestBody SendMessageRequest req) {
        var player = players.find(req.githubUser())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Primero únete al chat"));
        var dto = chat.post(new ChatMessage(player.getDisplayName(), player.getGithubUser(), MessageKind.TEXT, req.content().trim(), null, null));
        shakira.onPlayerMessage(player, req.content());
        return dto;
    }

    @PostMapping("/players/join")
    public PlayerDto join(@Valid @RequestBody JoinRequest req) {
        var result = players.join(req.githubUser(), req.displayName());
        var p = result.player();
        if (result.isNew()) {
            chat.post(new ChatMessage("Sistema", null, MessageKind.SYSTEM,
                    p.getDisplayName() + " (@" + p.getGithubUser() + ") se unió al equipo", null, null));
            chat.post(new ChatMessage(ShakiraService.NAME, null, MessageKind.TEXT,
                    "¡Bienvenid@, " + p.getDisplayName() + "! 💃 Clona el repo, arregla bugs en buggy-site/src y abre un PR. "
                            + "Yo me entero sola cuando lo hagas bien. Escribe \"@Shakira ayuda\" si te pierdes.", null, null));
            players.broadcast();
        }
        return players.leaderboard().stream().filter(d -> d.githubUser().equals(p.getGithubUser())).findFirst().orElseThrow();
    }

    @GetMapping("/players")
    public List<PlayerDto> leaderboard() {
        return players.leaderboard();
    }

    @GetMapping("/challenges")
    public List<ChallengeDto> challenges() {
        return challenges.all();
    }
}
