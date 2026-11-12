package com.peakhospital.backend.accounts;

import com.peakhospital.backend.dto.AuthResponse;
import com.peakhospital.backend.model.Appointment;
import com.peakhospital.backend.model.Invoice;
import com.peakhospital.backend.model.LabTest;
import com.peakhospital.backend.model.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** "My ..." endpoints for the signed-in person. Role limits are set in SecurityConfig. */
@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final MeService meService;

    @GetMapping
    public ProfileResponse profile(Authentication auth) {
        return meService.profile(auth.getName());
    }

    @GetMapping("/appointments")
    public List<Appointment> appointments(Authentication auth) {
        return meService.appointments(auth.getName());
    }

    @GetMapping("/lab-tests")
    public List<LabTest> labTests(Authentication auth) {
        return meService.labTests(auth.getName());
    }

    @GetMapping("/invoices")
    public List<Invoice> invoices(Authentication auth) {
        return meService.invoices(auth.getName());
    }

    @GetMapping("/prescriptions")
    public List<Prescription> prescriptions(Authentication auth) {
        return meService.prescriptions(auth.getName());
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request, Authentication auth) {
        meService.changePassword(auth.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/complete-account")
    public AuthResponse completeAccount(@RequestBody CompleteAccountRequest request, Authentication auth) {
        return meService.completeAccount(auth.getName(), request);
    }
}
