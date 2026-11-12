package com.peakhospital.backend.accounts;

import com.peakhospital.backend.model.Doctor;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.Role;

public record ProfileResponse(
        String username,
        String fullName,
        Role role,
        boolean mustChangePassword,
        Patient patient,   // only for PATIENT logins
        Doctor doctor      // only for DOCTOR logins
) {
}
