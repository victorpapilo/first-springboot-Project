package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.*;
import com.peakhospital.backend.repository.AdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final PatientService patientService;
    private final WardService wardService;

    public Admission admitPatient(Admission admission) {
        Patient patient = patientService.getPatientById(admission.getPatientId());
        Ward ward = wardService.getWardById(admission.getWardId());

        long occupied = wardService.occupiedBeds(ward.getId());
        if (occupied >= ward.getCapacity()) {
            throw new IllegalArgumentException("Ward \"" + ward.getName() + "\" is at full capacity (" + ward.getCapacity() + " beds).");
        }

        admission.setId(null);
        admission.setPatientName(patient.getFullName());
        admission.setWardName(ward.getName());
        admission.setStatus(AdmissionStatus.ADMITTED);
        admission.setAdmissionDate(LocalDateTime.now());
        admission.setDischargeDate(null);
        admission.setBedNumber((int) occupied + 1);

        return admissionRepository.save(admission);
    }

    public List<Admission> getAllAdmissions() {
        return admissionRepository.findAll();
    }

    public Admission getAdmissionById(String id) {
        return admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found with id: " + id));
    }

    public List<Admission> getAdmissionsForPatient(String patientId) {
        return admissionRepository.findByPatientId(patientId);
    }

    public Admission dischargePatient(String id) {
        Admission admission = getAdmissionById(id);
        admission.setStatus(AdmissionStatus.DISCHARGED);
        admission.setDischargeDate(LocalDateTime.now());
        return admissionRepository.save(admission);
    }
}
