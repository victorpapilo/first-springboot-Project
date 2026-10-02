package com.peakhospital.backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "wards")
public class Ward {

    @Id
    private String id;

    @NotBlank(message = "Ward name is required")
    private String name;

    private String description;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;
}
