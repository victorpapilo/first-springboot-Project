package com.peakhospital.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    @NotBlank(message = "patientId is required")
    private String patientId;

    private String patientName;

    @NotBlank(message = "doctorId is required")
    private String doctorId;

    private String doctorName;

    @NotNull(message = "Appointment date/time is required")
    private LocalDateTime scheduledFor;

    private String reason;

    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    private LocalDateTime createdAt = LocalDateTime.now();
}
