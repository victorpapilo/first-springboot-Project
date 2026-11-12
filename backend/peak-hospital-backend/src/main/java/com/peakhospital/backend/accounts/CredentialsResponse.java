package com.peakhospital.backend.accounts;

/** The temporary password is returned exactly once, at creation or reset. It is not stored in readable form. */
public record CredentialsResponse(UserSummary user, String temporaryPassword) {
}
