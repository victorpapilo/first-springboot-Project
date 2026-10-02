package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.Doctor;
import com.peakhospital.backend.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public Doctor addDoctor(Doctor doctor) {
        doctor.setId(null);
        doctor.setActive(true);
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    public Doctor updateDoctor(String id, Doctor updated) {
        Doctor existing = getDoctorById(id);
        existing.setFullName(updated.getFullName());
        existing.setSpecialization(updated.getSpecialization());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setEmail(updated.getEmail());
        return doctorRepository.save(existing);
    }

    public void deactivateDoctor(String id) {
        Doctor existing = getDoctorById(id);
        existing.setActive(false);
        doctorRepository.save(existing);
    }

    public void deleteDoctor(String id) {
        Doctor existing = getDoctorById(id);
        doctorRepository.delete(existing);
    }
}
