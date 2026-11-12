package com.peakhospital.backend.accounts;

import com.peakhospital.backend.audit.AuditService;
import com.peakhospital.backend.dto.AuthResponse;
import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.Appointment;
import com.peakhospital.backend.model.Doctor;
import com.peakhospital.backend.model.Invoice;
import com.peakhospital.backend.model.LabTest;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.Prescription;
import com.peakhospital.backend.model.Role;
import com.peakhospital.backend.model.User;
import com.peakhospital.backend.repository.AppointmentRepository;
import com.peakhospital.backend.repository.DoctorRepository;
import com.peakhospital.backend.repository.InvoiceRepository;
import com.peakhospital.backend.repository.LabTestRepository;
import com.peakhospital.backend.repository.PatientRepository;
import com.peakhospital.backend.repository.PrescriptionRepository;
import com.peakhospital.backend.repository.UserRepository;
import com.peakhospital.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Everything here is scoped to the signed-in person. The ids always come from the
 * account on the server, never from the request, so nobody can ask for someone else's data.
 */
@Service
@RequiredArgsConstructor
public class MeService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final LabTestRepository labTestRepository;
    private final InvoiceRepository invoiceRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    public ProfileResponse profile(String username) {
        User user = current(username);
        Patient patient = user.getPatientId() == null ? null
                : patientRepository.findById(user.getPatientId()).orElse(null);
        Doctor doctor = user.getDoctorId() == null ? null
                : doctorRepository.findById(user.getDoctorId()).orElse(null);
        return new ProfileResponse(user.getUsername(), user.getFullName(), user.getRole(),
                user.isMustChangePassword(), patient, doctor);
    }

    public List<Appointment> appointments(String username) {
        User user = current(username);
        if (user.getRole() == Role.DOCTOR) {
            return user.getDoctorId() == null ? List.of() : appointmentRepository.findByDoctorId(user.getDoctorId());
        }
        if (user.getRole() == Role.PATIENT) {
            return appointmentRepository.findByPatientId(patientIdOf(user));
        }
        return List.of();
    }

    public List<LabTest> labTests(String username) {
        return labTestRepository.findByPatientId(patientIdOf(current(username)));
    }

    public List<Invoice> invoices(String username) {
        return invoiceRepository.findByPatientId(patientIdOf(current(username)));
    }

    public List<Prescription> prescriptions(String username) {
        return prescriptionRepository.findByPatientId(patientIdOf(current(username)));
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = current(username);
        if (request.currentPassword() == null
                || !passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Your current password is not correct");
        }
        validateNewPassword(request.newPassword(), request.currentPassword(), user.getUsername());

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        user.setExpiresAt(null);
        userRepository.save(user);
        auditService.log("PASSWORD_CHANGED", "User", user.getId(), user.getPatientId());
    }

    /** Turns a temporary patient login into the patient's own account and fills in their real details. */
    public AuthResponse completeAccount(String username, CompleteAccountRequest request) {
        User user = current(username);
        if (!user.isMustChangePassword()) {
            throw new IllegalArgumentException("This account has already been set up");
        }
        Patient patient = patientRepository.findById(patientIdOf(user))
                .orElseThrow(() -> new ResourceNotFoundException("Patient record not found"));

        if (request.currentPassword() == null
                || !passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("The temporary password is not correct");
        }
        String fullName = clean(request.fullName());
        String phone = clean(request.phoneNumber());
        if (fullName == null) {
            throw new IllegalArgumentException("Your full name is required");
        }
        if (phone == null) {
            throw new IllegalArgumentException("A phone number is required");
        }

        String newUsername = clean(request.newUsername());
        if (newUsername == null || !UserAdminService.USERNAME.matcher(newUsername).matches()) {
            throw new IllegalArgumentException(
                    "Username must be 3-40 characters: letters, numbers, dot, dash or underscore");
        }
        if (!newUsername.equals(user.getUsername()) && userRepository.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("That username is already taken");
        }
        validateNewPassword(request.newPassword(), request.currentPassword(), newUsername);

        patient.setFullName(fullName);
        patient.setPhoneNumber(phone);
        patient.setEmail(clean(request.email()));
        patient.setAddress(clean(request.address()));
        patient.setGender(clean(request.gender()));
        if (request.dateOfBirth() != null) {
            patient.setDateOfBirth(request.dateOfBirth());
            patient.setApproximateAge(null);
        }
        patientRepository.save(patient);

        user.setUsername(newUsername);
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setFullName(fullName);
        user.setMustChangePassword(false);
        user.setExpiresAt(null);
        userRepository.save(user);

        auditService.log("ACCOUNT_COMPLETED", "Patient", patient.getId(), patient.getId());

        // The username may have changed, so the old token (which names the old username) is replaced.
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getFullName(), user.getRole(), false);
    }

    // ---------------------------------------------------------------

    private User current(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    private String patientIdOf(User user) {
        if (user.getPatientId() == null) {
            throw new IllegalArgumentException(
                    "Your login is not linked to a patient record. Please contact reception.");
        }
        return user.getPatientId();
    }

    private void validateNewPassword(String newPassword, String currentPassword, String username) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Your new password must be at least 8 characters");
        }
        if (newPassword.equals(currentPassword)) {
            throw new IllegalArgumentException("Choose a password different from the current one");
        }
        if (newPassword.equalsIgnoreCase(username)) {
            throw new IllegalArgumentException("Your password cannot be the same as your username");
        }
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
