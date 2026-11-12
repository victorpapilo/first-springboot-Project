package com.peakhospital.backend.signup;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Stops one connection from creating accounts in bulk. Kept in memory, so it resets when the
 * server restarts and is counted per server instance. Good enough to deter casual spam.
 */
@Component
public class SignupRateLimiter {

    private static final int MAX_ATTEMPTS = 10;
    private static final Duration WINDOW = Duration.ofHours(1);
    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    public void check(String clientKey) {
        if (attempts.size() > MAX_TRACKED_CLIENTS) {
            attempts.clear();
        }
        Instant now = Instant.now();
        Deque<Instant> recent = attempts.computeIfAbsent(clientKey, k -> new ArrayDeque<>());
        synchronized (recent) {
            while (!recent.isEmpty() && recent.peekFirst().isBefore(now.minus(WINDOW))) {
                recent.pollFirst();
            }
            if (recent.size() >= MAX_ATTEMPTS) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Too many sign-up attempts from this connection. Please try again later.");
            }
            recent.addLast(now);
        }
    }
}
