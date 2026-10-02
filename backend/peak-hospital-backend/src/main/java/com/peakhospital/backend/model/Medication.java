package com.peakhospital.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medication {
    private String name;
    private String dosage;
    private String frequency;
    private String duration;
}
