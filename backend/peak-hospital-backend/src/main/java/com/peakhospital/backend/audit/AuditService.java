package com.peakhospital.backend.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    /** Call this from any service that reads or changes patient data. */
    public void log(String action, String resourceType, String resourceId, String patientId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.getName() != null) ? auth.getName() : "anonymous";
        repository.save(new AuditLog(username, action, resourceType, resourceId, patientId, currentIp()));
    }

    /** For events where nobody is signed in yet, such as a self sign-up. */
    public void logAs(String username, String action, String resourceType, String resourceId, String patientId) {
        repository.save(new AuditLog(username, action, resourceType, resourceId, patientId, currentIp()));
    }

    private String currentIp() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            HttpServletRequest request = attrs.getRequest();
            // Behind Render/Vercel-style proxies the real client IP arrives in this header.
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return null;
    }
}