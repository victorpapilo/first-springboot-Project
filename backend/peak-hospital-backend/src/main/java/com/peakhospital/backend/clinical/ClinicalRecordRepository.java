package com.peakhospital.backend.clinical;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ClinicalRecordRepository extends MongoRepository<ClinicalRecord, String> {

    List<ClinicalRecord> findByPatientIdOrderByCreatedAtDesc(String patientId);
}