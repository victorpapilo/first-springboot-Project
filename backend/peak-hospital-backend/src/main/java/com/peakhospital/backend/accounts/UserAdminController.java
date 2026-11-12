package com.peakhospital.backend.accounts;

import com.peakhospital.backend.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin only (enforced in SecurityConfig). */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService service;

    public record RoleChangeRequest(Role role) {
    }

    public record ActiveRequest(boolean active) {
    }

    /** GET /api/users?scope=staff|patients */
    @GetMapping
    public List<UserSummary> list(@RequestParam(defaultValue = "staff") String scope) {
        return service.list(scope);
    }

    @PostMapping
    public ResponseEntity<CredentialsResponse> create(@RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}/role")
    public UserSummary changeRole(@PathVariable String id, @RequestBody RoleChangeRequest body,
                                  Authentication auth) {
        return service.changeRole(id, body.role(), auth.getName());
    }

    @PutMapping("/{id}/active")
    public UserSummary setActive(@PathVariable String id, @RequestBody ActiveRequest body, Authentication auth) {
        return service.setActive(id, body.active(), auth.getName());
    }

    @PostMapping("/{id}/reset-password")
    public CredentialsResponse resetPassword(@PathVariable String id) {
        return service.resetPassword(id);
    }
}
