package com.peakhospital.backend.clinical;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clinical-records")
public class ClinicalRecordController {

    private final ClinicalRecordService service;

    public ClinicalRecordController(ClinicalRecordService service) {
        this.service = service;
    }

    /** POST /api/clinical-records */
    @PostMapping
    public ResponseEntity<ClinicalRecord> create(@Valid @RequestBody ClinicalRecordRequest request,
                                                 Authentication auth) {
        ClinicalRecord saved = service.create(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** GET /api/clinical-records/patient/{patientId}  (newest first) */
    @GetMapping("/patient/{patientId}")
    public List<ClinicalRecord> forPatient(@PathVariable String patientId) {
        return service.forPatient(patientId);
    }

    /** GET /api/clinical-records/{id} */
    @GetMapping("/{id}")
    public ClinicalRecord get(@PathVariable String id) {
        return service.get(id);
    }
}