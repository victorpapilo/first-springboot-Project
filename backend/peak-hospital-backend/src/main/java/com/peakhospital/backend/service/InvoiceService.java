package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.Invoice;
import com.peakhospital.backend.model.InvoiceItem;
import com.peakhospital.backend.model.InvoiceStatus;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PatientService patientService;

    public Invoice createInvoice(Invoice invoice) {
        Patient patient = patientService.getPatientById(invoice.getPatientId());

        double total = invoice.getItems() == null ? 0 :
                invoice.getItems().stream().mapToDouble(InvoiceItem::getAmount).sum();

        invoice.setId(null);
        invoice.setPatientName(patient.getFullName());
        invoice.setTotalAmount(total);
        invoice.setAmountPaid(0);
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setInvoiceDate(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(String id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    public List<Invoice> getInvoicesForPatient(String patientId) {
        return invoiceRepository.findByPatientId(patientId);
    }

    public Invoice recordPayment(String id, double amount) {
        Invoice invoice = getInvoiceById(id);
        invoice.setAmountPaid(invoice.getAmountPaid() + amount);

        if (invoice.getAmountPaid() >= invoice.getTotalAmount()) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (invoice.getAmountPaid() > 0) {
            invoice.setStatus(InvoiceStatus.PARTIAL);
        }

        return invoiceRepository.save(invoice);
    }
}
