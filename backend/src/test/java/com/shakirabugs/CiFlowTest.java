package com.shakirabugs;

import com.shakirabugs.domain.ChallengeStatus;
import com.shakirabugs.repo.ChallengeRepository;
import com.shakirabugs.repo.PlayerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class CiFlowTest {
    @Autowired MockMvc mvc;
    @Autowired ChallengeRepository challenges;
    @Autowired PlayerRepository players;

    private static final String BODY = """
            {"githubUser":"%s","event":"pull_request","branch":"fix/cart","passed":%s,"failed":[]}
            """;

    @Test
    void catalogIsLoaded() {
        assertThat(challenges.count()).isEqualTo(9);
        assertThat(challenges.countByStatus(ChallengeStatus.PENDING)).isEqualTo(9);
    }

    @Test
    void rejectsWrongSecret() throws Exception {
        mvc.perform(post("/api/ci/results").header("X-Shakira-Secret", "nope")
                        .contentType(MediaType.APPLICATION_JSON).content(BODY.formatted("ana", "[\"cart-total\"]")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void firstSolverGetsThePoints() throws Exception {
        mvc.perform(post("/api/ci/results").header("X-Shakira-Secret", "test-secret")
                        .contentType(MediaType.APPLICATION_JSON).content(BODY.formatted("Ana", "[\"cart-total\",\"xss-reviews\",\"no-existe\"]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pointsAwarded").value(60))
                .andExpect(jsonPath("$.newlySolved.length()").value(2));

        // Otro jugador envía el mismo fix: ya no suma
        mvc.perform(post("/api/ci/results").header("X-Shakira-Secret", "test-secret")
                        .contentType(MediaType.APPLICATION_JSON).content(BODY.formatted("beto", "[\"cart-total\"]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pointsAwarded").value(0));

        assertThat(players.findByGithubUser("ana")).get().extracting("points").isEqualTo(60);
        assertThat(challenges.findById("cart-total")).get().extracting("solvedBy").isEqualTo("ana");

        mvc.perform(get("/api/messages"))
                .andExpect(jsonPath("$[?(@.kind == 'CELEBRATION')]").exists());
    }

    @Test
    void playersCanJoinAndChat() throws Exception {
        mvc.perform(post("/api/players/join").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"Ana\",\"githubUser\":\"ana-dev\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.githubUser").value("ana-dev"));
        mvc.perform(post("/api/messages").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"githubUser\":\"ana-dev\",\"content\":\"hola equipo\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/messages").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"githubUser\":\"intruso\",\"content\":\"hola\"}"))
                .andExpect(status().isForbidden());
    }
}
