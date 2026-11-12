package com.peakhospital.backend.clinical;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * What the client is allowed to send. The author and timestamp are not here on purpose:
 * the server fills them in so nobody can write a note under someone else's name.
 */
public record ClinicalRecordRequest(
        @NotBlank String patientId,
        @NotBlank @Size(max = 500) String chiefComplaint,
        Vitals vitals,
        @Size(max = 500) String diagnosis,
        @Size(max = 20) String icd10Code,
        @Size(max = 500) String allergies,
        @Size(max = 5000) String notes,
        @Size(max = 3000) String plan
) {
}