package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.Visit;
import com.peakhospital.backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public Visit recordVisit(Visit visit) {
        Patient patient = patientService.getPatientById(visit.getPatientId());

        visit.setId(null);
        visit.setPatientName(patient.getFullName());
        if (visit.getDoctorId() != null && !visit.getDoctorId().isBlank()) {
            visit.setDoctorName(doctorService.getDoctorById(visit.getDoctorId()).getFullName());
        }
        visit.setVisitDate(LocalDateTime.now());
        Visit saved = visitRepository.save(visit);

        patientService.registerVisit(patient);

        return saved;
    }

    public List<Visit> getAllVisits() {
        return visitRepository.findAll();
    }

    public Visit getVisitById(String id) {
        return visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + id));
    }

    public List<Visit> getVisitsForPatient(String patientId) {
        return visitRepository.findByPatientId(patientId);
    }

    public List<Visit> getVisitsBetween(LocalDateTime start, LocalDateTime end) {
        return visitRepository.findByVisitDateBetween(start, end);
    }
}
