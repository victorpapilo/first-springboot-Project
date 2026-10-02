package com.peakhospital.backend.controller;

import com.peakhospital.backend.model.Invoice;
import com.peakhospital.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(invoice));
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable String id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Invoice>> getForPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(invoiceService.getInvoicesForPatient(patientId));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Invoice> recordPayment(@PathVariable String id, @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(invoiceService.recordPayment(id, body.getOrDefault("amount", 0.0)));
    }
}
