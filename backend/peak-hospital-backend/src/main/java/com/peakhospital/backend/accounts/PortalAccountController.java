package com.peakhospital.backend.accounts;

import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Lets reception (or an admin) give an existing patient a sign-in to the patient portal. */
@RestController
@RequestMapping("/api/portal-accounts")
@RequiredArgsConstructor
public class PortalAccountController {

    private final UserAdminService userAdminService;
    private final PatientService patientService;

    public record PortalAccountRequest(String patientId) {
    }

    @PostMapping
    public ResponseEntity<CredentialsResponse> create(@RequestBody PortalAccountRequest request) {
        if (request.patientId() == null || request.patientId().isBlank()) {
            throw new IllegalArgumentException("patientId is required");
        }
        Patient patient = patientService.getPatientById(request.patientId());
        return ResponseEntity.status(HttpStatus.CREATED).body(userAdminService.createPatientAccount(patient, "PT"));
    }
}
