package com.shakirabugs.web;

import com.shakirabugs.config.ShakiraProperties;
import com.shakirabugs.dto.Dtos.ChallengeDto;
import com.shakirabugs.dto.Dtos.CiResultRequest;
import com.shakirabugs.dto.Dtos.CiResultResponse;
import com.shakirabugs.service.ChallengeService;
import com.shakirabugs.service.ScoreService;
import com.shakirabugs.service.ShakiraService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/** Endpoints protegidos con el secreto compartido (header X-Shakira-Secret). */
@RestController
@RequestMapping("/api")
public class CiController {
    private final ScoreService score;
    private final ShakiraService shakira;
    private final ChallengeService challenges;
    private final ShakiraProperties props;

    public CiController(ScoreService score, ShakiraService shakira, ChallengeService challenges, ShakiraProperties props) {
        this.score = score;
        this.shakira = shakira;
        this.challenges = challenges;
        this.props = props;
    }

    /** Llamado por GitHub Actions con los retos que pasan en un push/PR. */
    @PostMapping("/ci/results")
    public CiResultResponse results(@RequestHeader(value = "X-Shakira-Secret", required = false) String secret,
                                    @Valid @RequestBody CiResultRequest req) {
        checkSecret(secret);
        return score.process(req);
    }

    /** Fuerza a Shakira a mandar una alerta nueva (útil para probar). */
    @PostMapping("/manager/next")
    public ResponseEntity<ChallengeDto> next(@RequestHeader(value = "X-Shakira-Secret", required = false) String secret) {
        checkSecret(secret);
        return shakira.announceNext().map(c -> ResponseEntity.ok(challenges.toDto(c)))
                .orElse(ResponseEntity.noContent().build());
    }

    private void checkSecret(String provided) {
        byte[] expected = props.webhookSecret().getBytes(StandardCharsets.UTF_8);
        byte[] actual = provided == null ? new byte[0] : provided.getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expected, actual)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Secreto inválido");
        }
    }
}
