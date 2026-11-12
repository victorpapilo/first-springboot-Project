package com.peakhospital.backend.dto;

import com.peakhospital.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private Role role;
    /** When true the app must send the person to a "choose your own password" screen first. */
    private boolean mustChangePassword;
}
