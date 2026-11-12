package com.peakhospital.backend.accounts;

import com.peakhospital.backend.model.ApprovalStatus;
import com.peakhospital.backend.model.Role;
import com.peakhospital.backend.model.User;

import java.time.LocalDateTime;

/** What the admin screen is allowed to see about an account. Never includes the password. */
public record UserSummary(
        String id,
        String username,
        String fullName,
        Role role,
        boolean active,
        ApprovalStatus approvalStatus,
        boolean mustChangePassword,
        String patientId,
        String doctorId,
        LocalDateTime createdAt,
        LocalDateTime expiresAt
) {
    public static UserSummary from(User u) {
        return new UserSummary(u.getId(), u.getUsername(), u.getFullName(), u.getRole(), u.isActive(),
                u.getApprovalStatus(), u.isMustChangePassword(), u.getPatientId(), u.getDoctorId(), u.getCreatedAt(), u.getExpiresAt());
    }
}
