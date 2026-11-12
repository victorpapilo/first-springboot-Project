
package com.peakhospital.backend.service;

import com.peakhospital.backend.dto.AuthResponse;
import com.peakhospital.backend.dto.LoginRequest;
import com.peakhospital.backend.dto.RegisterRequest;
import com.peakhospital.backend.model.ApprovalStatus;
import com.peakhospital.backend.model.Role;
import com.peakhospital.backend.model.User;
import com.peakhospital.backend.repository.UserRepository;
import com.peakhospital.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * Registration.
     * The caller must be authorized to create the requested role.
     * Public registration must never be allowed to assign staff roles.
     */
    public AuthResponse register(RegisterRequest request) {

        validateRequest(request);

        if (request.getRole() == null) {
            throw new IllegalArgumentException("User role is required");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = new User();

        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole());
        user.setMustChangePassword(true);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return toResponse(user);
    }

    /**
     * Creates a staff account through the admin-protected user endpoint.
     */
    public AuthResponse createUser(RegisterRequest request) {

        validateRequest(request);

        if (request.getRole() == null) {
            throw new IllegalArgumentException("User role is required");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = new User();

        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole());
        user.setMustChangePassword(true);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return toResponse(user);
    }

    /**
     * Shared login for all hospital roles.
     */
    public AuthResponse login(LoginRequest request) {

        userRepository.findByUsername(request.getUsername()).ifPresent(u -> {

            if (u.getApprovalStatus() != ApprovalStatus.APPROVED
                    && request.getPassword() != null
                    && passwordEncoder.matches(
                            request.getPassword(),
                            u.getPassword()
                    )) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        u.getApprovalStatus() == ApprovalStatus.PENDING
                                ? "Your account is waiting for approval by an administrator."
                                : "Your registration was not approved. Please contact the hospital administrator."
                );
            }
        });

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BadCredentialsException(
                    "Invalid username or password"
            );
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid username or password"
                        )
                );

        return toResponse(user);
    }

    /**
     * Shared request validation.
     */
    private void validateRequest(RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration details are required"
            );
        }

        if (request.getUsername() == null
                || request.getUsername().isBlank()) {
            throw new IllegalArgumentException(
                    "Username is required"
            );
        }

        if (request.getPassword() == null
                || request.getPassword().length() < 8) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters"
            );
        }

        if (request.getFullName() == null
                || request.getFullName().isBlank()) {
            throw new IllegalArgumentException(
                    "Full name is required"
            );
        }
    }

    /**
     * Generates the JWT and returns the authenticated user's details.
     */
    private AuthResponse toResponse(User user) {

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.isMustChangePassword()
        );
    }
}
