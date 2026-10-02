package com.peakhospital.backend.repository;

import com.peakhospital.backend.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByPatientId(String patientId);
}
