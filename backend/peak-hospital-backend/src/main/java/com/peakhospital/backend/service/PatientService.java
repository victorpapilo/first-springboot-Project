package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.PatientType;
import com.peakhospital.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public Patient registerPatient(Patient patient) {
        patient.setId(null);
        patient.setPatientType(PatientType.NEW);
        patient.setRegistrationDate(LocalDateTime.now());
        patient.setTotalVisits(0);
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    public List<Patient> searchByName(String name) {
        return patientRepository.findByFullNameContainingIgnoreCase(name);
    }

    public Patient updatePatient(String id, Patient updated) {
        Patient existing = getPatientById(id);
        existing.setFullName(updated.getFullName());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setEmail(updated.getEmail());
        existing.setAddress(updated.getAddress());
        existing.setGender(updated.getGender());
        existing.setDateOfBirth(updated.getDateOfBirth());
        return patientRepository.save(existing);
    }

    public void deletePatient(String id) {
        Patient existing = getPatientById(id);
        patientRepository.delete(existing);
    }

    public long countByType(PatientType type) {
        return patientRepository.countByPatientType(type);
    }

    /**
     * Called after a visit is recorded: bumps visit count, updates last visit date,
     * and flips the patient to RECURRING once they've been seen before.
     */
    public void registerVisit(Patient patient) {
        patient.setTotalVisits(patient.getTotalVisits() + 1);
        patient.setLastVisitDate(LocalDateTime.now());
        if (patient.getTotalVisits() > 1) {
            patient.setPatientType(PatientType.RECURRING);
        }
        patientRepository.save(patient);
    }
}
