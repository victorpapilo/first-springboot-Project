package com.peakhospital.backend.dto;

import com.peakhospital.backend.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private Role role;
}
