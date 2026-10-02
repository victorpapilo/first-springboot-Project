package com.peakhospital.backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medicines")
public class Medicine {

    @Id
    private String id;

    @NotBlank(message = "Medicine name is required")
    private String name;

    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantityInStock;

    private double unitPrice;

    private LocalDate expiryDate;
}
