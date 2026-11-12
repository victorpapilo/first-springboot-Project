package com.peakhospital.backend.emergency;

import com.peakhospital.backend.model.Patient;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyService emergencyService;

    /** POST /api/emergency/register */
    @PostMapping("/register")
    public ResponseEntity<EmergencyRegistrationResponse> register(
            @Valid @RequestBody EmergencyRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emergencyService.register(request));
    }

    /** GET /api/emergency/queue */
    @GetMapping("/queue")
    public List<Patient> board() {
        return emergencyService.board();
    }
}
