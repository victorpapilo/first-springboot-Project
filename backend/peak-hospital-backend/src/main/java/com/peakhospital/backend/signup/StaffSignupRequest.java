package com.peakhospital.backend.signup;

import com.peakhospital.backend.model.Role;

/** Staff applying for an account. Stays locked until an administrator approves it. */
public record StaffSignupRequest(
        Role role,
        String fullName,
        String phoneNumber,
        String email,
        String licenseNumber,    // professional license or staff ID
        String licensingBody,    // who issued it, e.g. the professional council
        String specialization,   // required for doctors
        String username,
        String password
) {
}
