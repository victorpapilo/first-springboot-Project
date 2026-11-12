package com.peakhospital.backend.signup;

import com.peakhospital.backend.model.ApprovalStatus;
import com.peakhospital.backend.model.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/** The details an administrator checks before approving a staff sign-up. Kept as a permanent record. */
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "staff_applications")
public class StaffApplication {

    @Id
    private String id;

    /** The locked account created at sign-up. Cleared if the application is rejected (the account is removed). */
    private String userId;

    private String username;
    private Role role;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String licenseNumber;
    private String licensingBody;
    private String specialization;

    private ApprovalStatus status = ApprovalStatus.PENDING;
    private LocalDateTime submittedAt;

    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private String reviewNote;
}
