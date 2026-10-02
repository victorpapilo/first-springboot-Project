package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.Appointment;
import com.peakhospital.backend.model.AppointmentStatus;
import com.peakhospital.backend.model.Doctor;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public Appointment scheduleAppointment(Appointment appointment) {
        Patient patient = patientService.getPatientById(appointment.getPatientId());
        Doctor doctor = doctorService.getDoctorById(appointment.getDoctorId());

        appointment.setId(null);
        appointment.setPatientName(patient.getFullName());
        appointment.setDoctorName(doctor.getFullName());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setCreatedAt(LocalDateTime.now());

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(String id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    public List<Appointment> getAppointmentsForPatient(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsForDoctor(String doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public Appointment updateStatus(String id, AppointmentStatus status) {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public void cancelAppointment(String id) {
        updateStatus(id, AppointmentStatus.CANCELLED);
    }
}
