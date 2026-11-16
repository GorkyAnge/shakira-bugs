package com.shakirabugs.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shakirabugs.domain.Challenge;
import com.shakirabugs.domain.Difficulty;
import com.shakirabugs.repo.ChallengeRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Carga/actualiza el catálogo de retos (challenges.json) sin tocar el estado de los ya existentes. */
@Component
@Order(0)
public class CatalogLoader implements ApplicationRunner {
    record Entry(String id, String title, Difficulty difficulty, String file, String alert, String hint) {}

    private final ChallengeRepository repo;
    private final ObjectMapper mapper;

    public CatalogLoader(ChallengeRepository repo, ObjectMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        try (var in = new ClassPathResource("challenges.json").getInputStream()) {
            List<Entry> entries = mapper.readValue(in, new TypeReference<>() {});
            for (Entry e : entries) {
                Challenge c = repo.findById(e.id()).orElseGet(() -> new Challenge(e.id()));
                c.setTitle(e.title());
                c.setDifficulty(e.difficulty());
                c.setFile(e.file());
                c.setAlert(e.alert());
                c.setHint(e.hint());
                repo.save(c);
            }
        }
    }
}
