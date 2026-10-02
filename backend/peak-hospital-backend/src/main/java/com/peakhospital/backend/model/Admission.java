package com.peakhospital.backend.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admissions")
public class Admission {

    @Id
    private String id;

    @NotBlank(message = "patientId is required")
    private String patientId;

    private String patientName;

    @NotBlank(message = "wardId is required")
    private String wardId;

    private String wardName;

    private int bedNumber;

    private String reason;

    private AdmissionStatus status = AdmissionStatus.ADMITTED;

    private LocalDateTime admissionDate = LocalDateTime.now();

    private LocalDateTime dischargeDate;
}
