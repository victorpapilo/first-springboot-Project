package com.peakhospital.backend.repository;

import com.peakhospital.backend.model.Admission;
import com.peakhospital.backend.model.AdmissionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AdmissionRepository extends MongoRepository<Admission, String> {
    List<Admission> findByPatientId(String patientId);
    List<Admission> findByWardId(String wardId);
    List<Admission> findByWardIdAndStatus(String wardId, AdmissionStatus status);
    long countByWardIdAndStatus(String wardId, AdmissionStatus status);
}
