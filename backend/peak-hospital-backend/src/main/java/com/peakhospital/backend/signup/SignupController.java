package com.peakhospital.backend.signup;

import com.peakhospital.backend.dto.AuthResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public endpoints (see SecurityConfig). */
@RestController
@RequestMapping("/api/auth/signup")
@RequiredArgsConstructor
public class SignupController {

    private final SignupService signupService;

    @PostMapping("/patient")
    public ResponseEntity<AuthResponse> signupPatient(@RequestBody PatientSignupRequest request,
                                                      HttpServletRequest http) {
        return ResponseEntity.status(HttpStatus.CREATED).body(signupService.signupPatient(request, clientKey(http)));
    }

    @PostMapping("/staff")
    public ResponseEntity<StaffSignupResponse> signupStaff(@RequestBody StaffSignupRequest request,
                                                           HttpServletRequest http) {
        return ResponseEntity.status(HttpStatus.CREATED).body(signupService.signupStaff(request, clientKey(http)));
    }

    /**
     * Behind a proxy (Render) the real client address is the last entry the proxy appended.
     * The first entry can be written by the caller, so it is not trusted for rate limiting.
     */
    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] parts = forwarded.split(",");
            return parts[parts.length - 1].trim();
        }
        return request.getRemoteAddr();
    }
}
