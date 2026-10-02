package com.peakhospital.backend.repository;

import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.PatientType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PatientRepository extends MongoRepository<Patient, String> {

    List<Patient> findByFullNameContainingIgnoreCase(String name);

    List<Patient> findByPatientType(PatientType patientType);

    long countByPatientType(PatientType patientType);
}
