package com.shakirabugs.service;

import com.shakirabugs.config.ShakiraProperties;
import com.shakirabugs.domain.*;
import com.shakirabugs.repo.ChallengeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * La manager. Envía alertas aleatorias sobre bugs, felicita a quien los arregla
 * y responde cuando la mencionan con @Shakira.
 */
@Service
public class ShakiraService {
    public static final String NAME = "Shakira";
    private static final Logger log = LoggerFactory.getLogger(ShakiraService.class);

    private static final List<String> REMINDERS = List.of(
            "👀 Sigo esperando el fix de \"%s\". Los bugs no mienten, y este sigue ahí.",
            "⏰ ¿Alguien está con \"%s\"? Son puntos fáciles de ganar… bueno, más o menos 😅",
            "☕ Me tomé un café y \"%s\" sigue abierto. ¡Vamos, equipo!",
            "📣 Recordatorio amistoso (por ahora): \"%s\" sigue roto.");
    private static final List<String> CHEERS = List.of(
            "¡Eso, %s! 💃 Arreglaste %s y te llevas +%d puntos. ¡Así se trabaja!",
            "🎉 ¡%s, eres una estrella! %s quedó resuelto. +%d puntos para ti.",
            "🐺 ¡Loba del código! %s resolvió %s. Sumando +%d puntos.",
            "🏆 %s acaba de arreglar %s. +%d puntos. ¡Qué orgullo de equipo!");
    private static final List<String> SASS = List.of(
            "Estoy en una reunión con los inversionistas, pero dime 😘",
            "Menos chat y más commits, mi amor 💅",
            "Puedes pedirme una *pista*, ver el *ranking* o los *retos* abiertos.",
            "Si me escribes es porque ya hiciste el PR, ¿verdad? 👀");

    private final ChallengeRepository challenges;
    private final ChatService chat;
    private final ChallengeService challengeService;
    private final PlayerService players;
    private final TaskScheduler scheduler;
    private final ShakiraProperties props;
    private boolean finaleSent = false;

    public ShakiraService(ChallengeRepository challenges, ChatService chat, ChallengeService challengeService,
                          PlayerService players, @Qualifier("shakiraScheduler") TaskScheduler scheduler, ShakiraProperties props) {
        this.challenges = challenges;
        this.chat = chat;
        this.challengeService = challengeService;
        this.players = players;
        this.scheduler = scheduler;
        this.props = props;
    }

    // ---------- Bucle aleatorio ----------

    @EventListener(ApplicationReadyEvent.class)
    public void start() {
        if (!props.autoAnnounce()) {
            log.info("Shakira auto-announce desactivado");
            return;
        }
        scheduleNextTick();
    }

    private void scheduleNextTick() {
        int min = Math.max(5, props.minDelaySeconds());
        int max = Math.max(min + 1, props.maxDelaySeconds());
        long delay = ThreadLocalRandom.current().nextLong(min, max);
        scheduler.schedule(this::tick, Instant.now().plusSeconds(delay));
        log.info("Próxima acción de Shakira en {}s", delay);
    }

    private void tick() {
        try {
            act();
        } catch (Exception e) {
            log.error("Shakira tuvo un mal día", e);
        } finally {
            scheduleNextTick();
        }
    }

    @Transactional
    public synchronized void act() {
        long open = challenges.countByStatus(ChallengeStatus.ANNOUNCED);
        var pending = challenges.findByStatus(ChallengeStatus.PENDING);
        if (!pending.isEmpty() && open < props.maxOpenChallenges()) {
            announce(random(pending));
        } else if (open > 0 && ThreadLocalRandom.current().nextBoolean()) {
            var c = random(challenges.findByStatus(ChallengeStatus.ANNOUNCED));
            say(MessageKind.TEXT, String.format(random(REMINDERS), c.getTitle()), c.getId(), null);
        } else if (pending.isEmpty() && open == 0 && !finaleSent) {
            finaleSent = true;
            var top = players.leaderboard().stream().findFirst();
            say(MessageKind.CELEBRATION, "🎊 ¡TODOS los bugs resueltos! La tienda está perfecta. "
                    + top.map(p -> "Empleado del mes: " + p.displayName() + " con " + p.points() + " pts 👑").orElse(""), null, null);
        }
    }

    /** Fuerza una alerta nueva (ignora el máximo de retos abiertos). */
    @Transactional
    public synchronized Optional<Challenge> announceNext() {
        var pending = challenges.findByStatus(ChallengeStatus.PENDING);
        if (pending.isEmpty()) return Optional.empty();
        var c = random(pending);
        announce(c);
        return Optional.of(c);
    }

    private void announce(Challenge c) {
        c.announce();
        challenges.save(c);
        say(MessageKind.ALERT, c.getAlert(), c.getId(), c.points());
        challengeService.broadcast();
    }

    // ---------- Reacciones a CI ----------

    public void congratulate(Player player, List<Challenge> solved, String runUrl) {
        int pts = solved.stream().mapToInt(Challenge::points).sum();
        String what = solved.stream().map(c -> "\"" + c.getTitle() + "\"").collect(Collectors.joining(" y "));
        String text = String.format(random(CHEERS), "@" + player.getGithubUser(), what, pts);
        if (solved.stream().anyMatch(c -> c.getAnnouncedAt() == null)) {
            text += " ¡Y ni siquiera lo había reportado! Proactividad, me encanta 😍";
        }
        text += " Total: " + player.getPoints() + " pts.";
        if (runUrl != null && !runUrl.isBlank()) text += "\n🔗 " + runUrl;
        say(MessageKind.CELEBRATION, text, solved.size() == 1 ? solved.get(0).getId() : null, pts);
    }

    public void encourage(String githubUser, String branch) {
        say(MessageKind.TEXT, "Revisé tu PR" + (branch != null ? " (" + branch + ")" : "") + ", @" + githubUser
                + "… pero no arregló ningún reto nuevo 😕. Corre `npm run challenges` en buggy-site e inténtalo otra vez 💪", null, null);
    }

    // ---------- Menciones ----------

    public void onPlayerMessage(Player player, String content) {
        String lower = content.toLowerCase(Locale.ROOT);
        if (!lower.contains("@shakira")) return;
        String reply;
        var open = challenges.findByStatus(ChallengeStatus.ANNOUNCED);
        if (lower.contains("pista") || lower.contains("hint")) {
            reply = open.stream()
                    .filter(c -> lower.contains(c.getId()))
                    .findFirst()
                    .or(() -> open.stream().max(Comparator.comparing(Challenge::getAnnouncedAt)))
                    .map(c -> "💡 Pista para \"" + c.getTitle() + "\": " + c.getHint())
                    .orElse("No hay retos abiertos ahora mismo. Disfruta el silencio… mientras dure 😏");
        } else if (lower.contains("ranking") || lower.contains("puntos")) {
            var top = players.leaderboard().stream().limit(3)
                    .map(p -> p.rank() + ". " + p.displayName() + " — " + p.points() + " pts").toList();
            reply = top.isEmpty() ? "Nadie tiene puntos todavía. ¡Sé la primera persona! 🥇" : "🏆 Top 3:\n" + String.join("\n", top);
        } else if (lower.contains("reto") || lower.contains("bug")) {
            reply = open.isEmpty() ? "No hay retos abiertos. Ya vendrán, créeme 😈"
                    : "Retos abiertos:\n" + open.stream()
                    .map(c -> "• " + c.getTitle() + " (" + c.getDifficulty().label() + ", +" + c.points() + ") → " + c.getFile())
                    .collect(Collectors.joining("\n"));
        } else {
            reply = "@" + player.getGithubUser() + " " + random(SASS);
        }
        String finalReply = reply;
        scheduler.schedule(() -> say(MessageKind.TEXT, finalReply, null, null), Instant.now().plus(Duration.ofMillis(1200)));
    }

    // ---------- util ----------

    private void say(MessageKind kind, String content, String challengeId, Integer points) {
        chat.post(new ChatMessage(NAME, null, kind, content, challengeId, points));
    }

    private static <T> T random(List<T> list) {
        return list.get(ThreadLocalRandom.current().nextInt(list.size()));
    }
}
