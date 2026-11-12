package com.peakhospital.backend.signup;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin only (enforced in SecurityConfig). */
@RestController
@RequestMapping("/api/staff-applications")
@RequiredArgsConstructor
public class StaffApplicationController {

    private final StaffApplicationService service;

    public record ApproveRequest(boolean visiting, String visitingDays, String note) {
    }

    public record RejectRequest(String note) {
    }

    /** GET /api/staff-applications?status=PENDING|APPROVED|REJECTED|ALL */
    @GetMapping
    public List<StaffApplication> list(@RequestParam(defaultValue = "PENDING") String status) {
        return service.list(status);
    }

    @PostMapping("/{id}/approve")
    public StaffApplication approve(@PathVariable String id,
                                    @RequestBody(required = false) ApproveRequest body,
                                    Authentication auth) {
        boolean visiting = body != null && body.visiting();
        return service.approve(id, visiting,
                body == null ? null : body.visitingDays(),
                body == null ? null : body.note(),
                auth.getName());
    }

    @PostMapping("/{id}/reject")
    public StaffApplication reject(@PathVariable String id,
                                   @RequestBody(required = false) RejectRequest body,
                                   Authentication auth) {
        return service.reject(id, body == null ? null : body.note(), auth.getName());
    }
}
