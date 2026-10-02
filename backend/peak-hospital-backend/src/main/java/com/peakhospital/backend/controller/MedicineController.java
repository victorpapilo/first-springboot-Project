package com.peakhospital.backend.controller;

import com.peakhospital.backend.model.Medicine;
import com.peakhospital.backend.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping
    public ResponseEntity<Medicine> addMedicine(@Valid @RequestBody Medicine medicine) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.addMedicine(medicine));
    }

    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @PutMapping("/{id}/restock")
    public ResponseEntity<Medicine> restock(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(medicineService.restock(id, body.getOrDefault("quantity", 0)));
    }

    @PutMapping("/{id}/dispense")
    public ResponseEntity<Medicine> dispense(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(medicineService.dispense(id, body.getOrDefault("quantity", 0)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable String id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}
