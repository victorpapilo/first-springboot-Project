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
@Document(collection = "lab_tests")
public class LabTest {

    @Id
    private String id;

    @NotBlank(message = "patientId is required")
    private String patientId;

    private String patientName;

    @NotBlank(message = "Test name is required")
    private String testName;

    private LabTestStatus status = LabTestStatus.ORDERED;

    private String result;

    private LocalDateTime orderedDate = LocalDateTime.now();

    private LocalDateTime completedDate;
}
