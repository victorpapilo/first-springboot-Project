package com.peakhospital.backend.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    private String fullName;

    private Role role = Role.RECEPTIONIST;

    /**
     * Existing accounts and accounts created by an admin are APPROVED. Staff who sign up
     * themselves start as PENDING and cannot sign in until an admin approves them.
     */
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    /** Deactivated accounts cannot sign in, and their existing sessions stop working. */
    private boolean active = true;

    /** True while the person is still using a temporary password handed to them by staff. */
    private boolean mustChangePassword = false;

    /** For PATIENT accounts: the patient record this login belongs to. */
    private String patientId;

    /** For DOCTOR accounts: the doctor profile this login belongs to. */
    private String doctorId;

    private LocalDateTime createdAt;

    /** Temporary accounts that are never claimed stop working after this time. */
    private LocalDateTime expiresAt;
}
