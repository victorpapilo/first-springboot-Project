package com.peakhospital.backend.signup;

import com.peakhospital.backend.audit.AuditService;
import com.peakhospital.backend.dto.AuthResponse;
import com.peakhospital.backend.model.ApprovalStatus;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.Role;
import com.peakhospital.backend.model.User;
import com.peakhospital.backend.repository.UserRepository;
import com.peakhospital.backend.security.JwtUtil;
import com.peakhospital.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SignupService {

    private static final Pattern USERNAME = Pattern.compile("^[A-Za-z0-9._-]{3,40}$");
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    /** Staff roles people may ask for. ADMIN and PATIENT can never be requested through the staff form. */
    private static final Set<Role> STAFF_ROLES =
            Set.of(Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.PHARMACIST, Role.LAB_TECHNICIAN);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientService patientService;
    private final StaffApplicationRepository applicationRepository;
    private final SignupRateLimiter rateLimiter;
    private final AuditService auditService;
    private final JwtUtil jwtUtil;

    /** Patients are active immediately and are signed in straight away. */
    public AuthResponse signupPatient(PatientSignupRequest request, String clientKey) {
        rateLimiter.check(clientKey);

        String fullName = required(request.fullName(), "Your full name is required");
        String phone = required(request.phoneNumber(), "A phone number is required");
        if (phone.replaceAll("\\D", "").length() < 7) {
            throw new IllegalArgumentException("Enter a valid phone number");
        }
        String email = clean(request.email());
        if (email != null && !EMAIL.matcher(email).matches()) {
            throw new IllegalArgumentException("Enter a valid email address");
        }
        String username = validUsername(request.username());
        validatePassword(request.password(), username);

        // Always a brand-new patient record. Matching an existing record by phone number alone would let
        // anyone claim someone else's medical history, so reception links duplicates after checking ID.
        Patient patient = new Patient();
        patient.setFullName(fullName);
        patient.setPhoneNumber(phone);
        patient.setEmail(email);
        patient.setAddress(clean(request.address()));
        patient.setGender(clean(request.gender()));
        patient.setDateOfBirth(request.dateOfBirth());
        Patient savedPatient = patientService.registerPatient(patient);

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(fullName);
        user.setRole(Role.PATIENT);
        user.setPatientId(savedPatient.getId());
        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user.setActive(true);
        user.setMustChangePassword(false);
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        auditService.logAs(username, "PATIENT_SELF_SIGNUP", "Patient", savedPatient.getId(), savedPatient.getId());

        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getRole().name());
        return new AuthResponse(token, savedUser.getUsername(), savedUser.getFullName(), savedUser.getRole(), false);
    }

    /** Staff get a locked account plus an application for an admin to review. They cannot sign in yet. */
    public StaffSignupResponse signupStaff(StaffSignupRequest request, String clientKey) {
        rateLimiter.check(clientKey);

        Role role = request.role();
        if (role == null || !STAFF_ROLES.contains(role)) {
            throw new IllegalArgumentException("Choose a valid staff role");
        }
        String fullName = required(request.fullName(), "Your full name is required");
        String phone = required(request.phoneNumber(), "A phone number is required");
        if (phone.replaceAll("\\D", "").length() < 7) {
            throw new IllegalArgumentException("Enter a valid phone number");
        }
        String email = clean(request.email());
        if (email != null && !EMAIL.matcher(email).matches()) {
            throw new IllegalArgumentException("Enter a valid email address");
        }
        String license = required(request.licenseNumber(), "Your license or staff ID number is required");
        String body = clean(request.licensingBody());
        String specialization = clean(request.specialization());
        if (role == Role.DOCTOR && specialization == null) {
            throw new IllegalArgumentException("Doctors must enter a specialization");
        }
        String username = validUsername(request.username());
        validatePassword(request.password(), username);

        if (applicationRepository.existsByLicenseNumberIgnoreCaseAndStatus(license, ApprovalStatus.APPROVED)) {
            throw new IllegalArgumentException(
                    "That license number is already linked to an approved account. Please contact the administrator.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(fullName);
        user.setRole(role);
        user.setApprovalStatus(ApprovalStatus.PENDING);
        user.setActive(true);
        user.setMustChangePassword(false);
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        StaffApplication application = new StaffApplication();
        application.setUserId(savedUser.getId());
        application.setUsername(username);
        application.setRole(role);
        application.setFullName(fullName);
        application.setPhoneNumber(phone);
        application.setEmail(email);
        application.setLicenseNumber(license);
        application.setLicensingBody(body);
        application.setSpecialization(specialization);
        application.setStatus(ApprovalStatus.PENDING);
        application.setSubmittedAt(LocalDateTime.now());
        applicationRepository.save(application);

        auditService.logAs(username, "STAFF_SIGNUP_SUBMITTED_" + role.name(), "User", savedUser.getId(), null);

        return new StaffSignupResponse(
                "Application received. An administrator will check your license and approve your account. "
                        + "You will be able to sign in once it is approved.");
    }

    // ---------------------------------------------------------------

    private String validUsername(String raw) {
        String username = clean(raw);
        if (username == null || !USERNAME.matcher(username).matches()) {
            throw new IllegalArgumentException(
                    "Username must be 3-40 characters: letters, numbers, dot, dash or underscore");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("That username is already taken");
        }
        return username;
    }

    private void validatePassword(String password, String username) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Your password must be at least 8 characters");
        }
        if (password.equalsIgnoreCase(username)) {
            throw new IllegalArgumentException("Your password cannot be the same as your username");
        }
    }

    private String required(String value, String message) {
        String cleaned = clean(value);
        if (cleaned == null) {
            throw new IllegalArgumentException(message);
        }
        return cleaned;
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
