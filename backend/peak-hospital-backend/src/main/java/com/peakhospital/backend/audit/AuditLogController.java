package com.peakhospital.backend.audit;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogRepository repository;

    public AuditLogController(AuditLogRepository repository) {
        this.repository = repository;
    }

    /** GET /api/audit-logs?patientId=...&page=0&size=50  (admins only) */
    @GetMapping
    public List<AuditLog> list(@RequestParam(required = false) String patientId,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "50") int size,
                               Authentication auth) {
        requireAdmin(auth);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200));
        if (patientId != null && !patientId.isBlank()) {
            return repository.findByPatientIdOrderByTimestampDesc(patientId, pageable);
        }
        return repository.findAllByOrderByTimestampDesc(pageable);
    }

    // Accepts both "ADMIN" and "ROLE_ADMIN" so it works however your users are stored.
    private void requireAdmin(Authentication auth) {
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins only");
        }
    }
}