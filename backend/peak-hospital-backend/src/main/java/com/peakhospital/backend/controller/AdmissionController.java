package com.peakhospital.backend.controller;

import com.peakhospital.backend.model.Admission;
import com.peakhospital.backend.service.AdmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
@RequiredArgsConstructor
public class AdmissionController {

    private final AdmissionService admissionService;

    @PostMapping
    public ResponseEntity<Admission> admitPatient(@Valid @RequestBody Admission admission) {
        return ResponseEntity.status(HttpStatus.CREATED).body(admissionService.admitPatient(admission));
    }

    @GetMapping
    public ResponseEntity<List<Admission>> getAllAdmissions() {
        return ResponseEntity.ok(admissionService.getAllAdmissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Admission> getAdmissionById(@PathVariable String id) {
        return ResponseEntity.ok(admissionService.getAdmissionById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Admission>> getForPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(admissionService.getAdmissionsForPatient(patientId));
    }

    @PutMapping("/{id}/discharge")
    public ResponseEntity<Admission> dischargePatient(@PathVariable String id) {
        return ResponseEntity.ok(admissionService.dischargePatient(id));
    }
}
