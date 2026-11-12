package com.peakhospital.backend.audit;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** One line in the "who touched what, and when" trail. Never edited after it is written. */
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    private String username;
    private String action;        // e.g. CREATE_CLINICAL_RECORD, VIEW_PATIENT_RECORDS
    private String resourceType;  // e.g. ClinicalRecord
    private String resourceId;    // may be null for list views
    private String patientId;     // lets you pull the full history of one patient
    private String ipAddress;
    private Instant timestamp;

    public AuditLog(String username, String action, String resourceType,
                    String resourceId, String patientId, String ipAddress) {
        this.username = username;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.patientId = patientId;
        this.ipAddress = ipAddress;
        this.timestamp = Instant.now();
    }
}