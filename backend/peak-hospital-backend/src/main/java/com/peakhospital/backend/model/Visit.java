package com.peakhospital.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "visits")
public class Visit {

    @Id
    private String id;

    @NotBlank(message = "patientId is required")
    private String patientId;

    private String patientName;

    private String doctorId;

    private String doctorName;

    @NotBlank(message = "Reason for visit is required")
    private String reason;

    private String diagnosis;

    @NotNull
    @PositiveOrZero(message = "Amount charged cannot be negative")
    private double amountCharged;

    private String notes;

    private LocalDateTime visitDate = LocalDateTime.now();
}
