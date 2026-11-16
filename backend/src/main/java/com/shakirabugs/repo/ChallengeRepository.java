package com.shakirabugs.repo;

import com.shakirabugs.domain.Challenge;
import com.shakirabugs.domain.ChallengeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChallengeRepository extends JpaRepository<Challenge, String> {
    List<Challenge> findByStatus(ChallengeStatus status);
    long countByStatus(ChallengeStatus status);
}
