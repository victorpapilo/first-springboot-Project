package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.Doctor;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.Prescription;
import com.peakhospital.backend.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public Prescription createPrescription(Prescription prescription) {
        Patient patient = patientService.getPatientById(prescription.getPatientId());
        prescription.setId(null);
        prescription.setPatientName(patient.getFullName());

        if (prescription.getDoctorId() != null && !prescription.getDoctorId().isBlank()) {
            Doctor doctor = doctorService.getDoctorById(prescription.getDoctorId());
            prescription.setDoctorName(doctor.getFullName());
        }

        prescription.setPrescribedDate(LocalDateTime.now());
        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Prescription getPrescriptionById(String id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));
    }

    public List<Prescription> getPrescriptionsForPatient(String patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }
}
