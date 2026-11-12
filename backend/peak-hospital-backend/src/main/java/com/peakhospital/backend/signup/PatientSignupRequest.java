package com.peakhospital.backend.signup;

import java.time.LocalDate;

/** A patient creating their own account. No admin approval is needed. */
public record PatientSignupRequest(
        String fullName,
        String phoneNumber,
        String email,
        LocalDate dateOfBirth,
        String gender,
        String address,
        String username,
        String password
) {
}
