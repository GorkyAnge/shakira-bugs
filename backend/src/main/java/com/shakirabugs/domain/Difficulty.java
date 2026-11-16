package com.shakirabugs.domain;

public enum Difficulty {
    EASY(10, "Fácil"),
    MEDIUM(25, "Media"),
    HARD(50, "Difícil");

    private final int points;
    private final String label;

    Difficulty(int points, String label) {
        this.points = points;
        this.label = label;
    }

    public int points() { return points; }
    public String label() { return label; }
}
