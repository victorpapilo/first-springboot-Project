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
@Document(collection = "invoices")
public class Invoice {

    @Id
    private String id;

    @NotBlank(message = "patientId is required")
    private String patientId;

    private String patientName;

    private List<InvoiceItem> items;

    private double totalAmount;

    private double amountPaid = 0;

    private InvoiceStatus status = InvoiceStatus.UNPAID;

    private LocalDateTime invoiceDate = LocalDateTime.now();
}
