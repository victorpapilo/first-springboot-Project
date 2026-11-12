package com.peakhospital.backend.accounts;

import java.security.SecureRandom;

/** Generates the one-time passwords printed on sign-in slips. */
public final class PasswordGenerator {

    // No 0/O, 1/l/I: easy to misread when typed from paper.
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordGenerator() {
    }

    public static String generate(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
