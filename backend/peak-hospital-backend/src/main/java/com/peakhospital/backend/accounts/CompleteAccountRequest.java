package com.peakhospital.backend.accounts;

import java.time.LocalDate;

/**
 * Sent by a patient who signed in with a temporary (for example emergency) login,
 * to turn it into their own account and fill in their real details.
 */
public record CompleteAccountRequest(
        String currentPassword,   // the temporary password from the slip
        String newUsername,
        String newPassword,
        String fullName,
        String phoneNumber,
        String email,
        LocalDate dateOfBirth,
        String gender,
        String address
) {
}
