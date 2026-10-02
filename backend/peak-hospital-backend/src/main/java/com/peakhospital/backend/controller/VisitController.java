package com.peakhospital.backend.controller;

import com.peakhospital.backend.model.Visit;
import com.peakhospital.backend.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @PostMapping
    public ResponseEntity<Visit> recordVisit(@Valid @RequestBody Visit visit) {
        return ResponseEntity.status(HttpStatus.CREATED).body(visitService.recordVisit(visit));
    }

    @GetMapping
    public ResponseEntity<List<Visit>> getAllVisits() {
        return ResponseEntity.ok(visitService.getAllVisits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Visit> getVisitById(@PathVariable String id) {
        return ResponseEntity.ok(visitService.getVisitById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Visit>> getVisitsForPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(visitService.getVisitsForPatient(patientId));
    }
}
