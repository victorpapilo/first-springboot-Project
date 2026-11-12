package com.peakhospital.backend.accounts;

public record ChangePasswordRequest(String currentPassword, String newPassword) {
}
