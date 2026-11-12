package com.peakhospital.backend.emergency;

import com.peakhospital.backend.model.TriageLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** The bare minimum needed to start treating someone. Everything except complaint and triage is optional. */
public record EmergencyRegistrationRequest(
        @Size(max = 120) String fullName,           // blank = unknown patient
        @Size(max = 20) String gender,
        @Min(0) @Max(120) Integer approximateAge,
        @Size(max = 30) String phoneNumber,
        @NotBlank @Size(max = 500) String complaint,
        @NotNull TriageLevel triageLevel
) {
}
