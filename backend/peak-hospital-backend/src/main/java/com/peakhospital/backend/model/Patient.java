package com.peakhospital.backend.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "patients")
public class Patient {

    @Id
    private String id;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private String email;

    private String address;

    private String gender;

    private LocalDate dateOfBirth;

    private PatientType patientType = PatientType.NEW;

    private LocalDateTime registrationDate = LocalDateTime.now();

    private LocalDateTime lastVisitDate;

    private int totalVisits = 0;
}
