package com.peakhospital.backend.emergency;

import com.peakhospital.backend.model.Patient;

import java.time.LocalDateTime;

/** Returned once. The temporary password is printed on the patient's slip and is not stored in readable form. */
public record EmergencyRegistrationResponse(
        Patient patient,
        String username,
        String temporaryPassword,
        LocalDateTime expiresAt
) {
}
