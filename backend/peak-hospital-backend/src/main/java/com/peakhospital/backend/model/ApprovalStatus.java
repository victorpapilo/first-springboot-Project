package com.peakhospital.backend.model;

/** Staff sign-ups start as PENDING and cannot sign in until an admin approves them. */
public enum ApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED
}
