package com.peakhospital.backend.repository;

import com.peakhospital.backend.model.LabTest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LabTestRepository extends MongoRepository<LabTest, String> {
    List<LabTest> findByPatientId(String patientId);
}
