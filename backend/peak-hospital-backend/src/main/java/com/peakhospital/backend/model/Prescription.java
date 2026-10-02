package com.peakhospital.backend.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "prescriptions")
public class Prescription {

    @Id
    private String id;

    @NotBlank(message = "patientId is required")
    private String patientId;

    private String patientName;

    private String doctorId;

    private String doctorName;

    private List<Medication> medications;

    private String notes;

    private LocalDateTime prescribedDate = LocalDateTime.now();
}
