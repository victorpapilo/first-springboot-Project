package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.LabTest;
import com.peakhospital.backend.model.LabTestStatus;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabTestService {

    private final LabTestRepository labTestRepository;
    private final PatientService patientService;

    public LabTest orderTest(LabTest labTest) {
        Patient patient = patientService.getPatientById(labTest.getPatientId());
        labTest.setId(null);
        labTest.setPatientName(patient.getFullName());
        labTest.setStatus(LabTestStatus.ORDERED);
        labTest.setOrderedDate(LocalDateTime.now());
        labTest.setResult(null);
        labTest.setCompletedDate(null);
        return labTestRepository.save(labTest);
    }

    public List<LabTest> getAllTests() {
        return labTestRepository.findAll();
    }

    public LabTest getTestById(String id) {
        return labTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with id: " + id));
    }

    public List<LabTest> getTestsForPatient(String patientId) {
        return labTestRepository.findByPatientId(patientId);
    }

    public LabTest completeTest(String id, String result) {
        LabTest test = getTestById(id);
        test.setResult(result);
        test.setStatus(LabTestStatus.COMPLETED);
        test.setCompletedDate(LocalDateTime.now());
        return labTestRepository.save(test);
    }
}
