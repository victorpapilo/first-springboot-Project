package com.peakhospital.backend.controller;

import com.peakhospital.backend.model.LabTest;
import com.peakhospital.backend.service.LabTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lab-tests")
@RequiredArgsConstructor
public class LabTestController {

    private final LabTestService labTestService;

    @PostMapping
    public ResponseEntity<LabTest> orderTest(@Valid @RequestBody LabTest labTest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(labTestService.orderTest(labTest));
    }

    @GetMapping
    public ResponseEntity<List<LabTest>> getAllTests() {
        return ResponseEntity.ok(labTestService.getAllTests());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabTest>> getForPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(labTestService.getTestsForPatient(patientId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<LabTest> completeTest(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(labTestService.completeTest(id, body.get("result")));
    }
}
