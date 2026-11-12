package com.peakhospital.backend.clinical;

/** Measurements taken at a visit. Every field is optional. */
public record Vitals(
        Integer systolic,         // mmHg
        Integer diastolic,        // mmHg
        Double temperatureC,      // degrees Celsius
        Integer pulse,            // beats per minute
        Integer respiratoryRate,  // breaths per minute
        Integer spo2,             // oxygen saturation %
        Double weightKg,
        Double heightCm
) {
}