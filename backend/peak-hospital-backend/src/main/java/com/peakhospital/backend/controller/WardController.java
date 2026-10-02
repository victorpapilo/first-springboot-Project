package com.peakhospital.backend.controller;

import com.peakhospital.backend.model.Ward;
import com.peakhospital.backend.service.WardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wards")
@RequiredArgsConstructor
public class WardController {

    private final WardService wardService;

    @PostMapping
    public ResponseEntity<Ward> addWard(@Valid @RequestBody Ward ward) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wardService.addWard(ward));
    }

    @GetMapping
    public ResponseEntity<List<Ward>> getAllWards() {
        return ResponseEntity.ok(wardService.getAllWards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ward> getWardById(@PathVariable String id) {
        return ResponseEntity.ok(wardService.getWardById(id));
    }

    @GetMapping("/{id}/occupancy")
    public ResponseEntity<Map<String, Object>> getOccupancy(@PathVariable String id) {
        Ward ward = wardService.getWardById(id);
        long occupied = wardService.occupiedBeds(id);
        return ResponseEntity.ok(Map.of(
                "wardName", ward.getName(),
                "capacity", ward.getCapacity(),
                "occupied", occupied,
                "available", ward.getCapacity() - occupied
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWard(@PathVariable String id) {
        wardService.deleteWard(id);
        return ResponseEntity.noContent().build();
    }
}
