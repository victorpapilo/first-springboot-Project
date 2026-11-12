package com.peakhospital.backend.accounts;

import com.peakhospital.backend.audit.AuditService;
import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.ApprovalStatus;
import com.peakhospital.backend.model.Doctor;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.Role;
import com.peakhospital.backend.model.User;
import com.peakhospital.backend.repository.DoctorRepository;
import com.peakhospital.backend.repository.PatientRepository;
import com.peakhospital.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    static final Pattern USERNAME = Pattern.compile("^[A-Za-z0-9._-]{3,40}$");
    private static final int TEMP_PASSWORD_LENGTH = 10;
    /** Patient logins that nobody claims within this many days stop working. */
    private static final int PATIENT_ACCOUNT_DAYS = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    /** Short tag from a record id, e.g. 3F9A21. Used in usernames and "Unknown Patient" names. */
    public static String idTag(String id) {
        String safe = id == null ? "" : id;
        return safe.substring(Math.max(0, safe.length() - 6)).toUpperCase();
    }

    public List<UserSummary> list(String scope) {
        boolean patients = "patients".equalsIgnoreCase(scope);
        return userRepository.findAll().stream()
                .filter(u -> patients == (u.getRole() == Role.PATIENT))
                .sorted(Comparator.comparingInt((User u) -> u.getRole().ordinal())
                        .thenComparing(u -> u.getFullName() == null ? u.getUsername() : u.getFullName(),
                                String.CASE_INSENSITIVE_ORDER))
                .map(UserSummary::from)
                .toList();
    }

    public CredentialsResponse create(CreateUserRequest request) {
        String username = request.username() == null ? "" : request.username().trim();
        if (!USERNAME.matcher(username).matches()) {
            throw new IllegalArgumentException(
                    "Username must be 3-40 characters: letters, numbers, dot, dash or underscore");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("That username is already taken");
        }
        Role role = request.role();
        if (role == null) {
            throw new IllegalArgumentException("Choose a role");
        }

        String fullName = request.fullName() == null ? "" : request.fullName().trim();
        User user = new User();

        switch (role) {
            case DOCTOR -> {
                String doctorId = request.doctorId();
                if (doctorId == null || doctorId.isBlank()) {
                    throw new IllegalArgumentException("Choose which doctor profile this login belongs to");
                }
                Doctor doctor = doctorRepository.findById(doctorId)
                        .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
                if (userRepository.existsByDoctorId(doctorId)) {
                    throw new IllegalArgumentException("That doctor already has a login");
                }
                user.setDoctorId(doctorId);
                if (fullName.isEmpty()) {
                    fullName = doctor.getFullName();
                }
            }
            case PATIENT -> {
                String patientId = request.patientId();
                if (patientId == null || patientId.isBlank()) {
                    throw new IllegalArgumentException("Choose which patient this login belongs to");
                }
                Patient patient = patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
                if (userRepository.existsByPatientId(patientId)) {
                    throw new IllegalArgumentException("That patient already has a login");
                }
                user.setPatientId(patientId);
                if (fullName.isEmpty()) {
                    fullName = patient.getFullName();
                }
            }
            default -> {
                if (fullName.isEmpty()) {
                    throw new IllegalArgumentException("Full name is required");
                }
            }
        }

        String temporaryPassword = PasswordGenerator.generate(TEMP_PASSWORD_LENGTH);
        user.setUsername(username);
        user.setFullName(fullName);
        user.setRole(role);
        applyTemporaryPassword(user, temporaryPassword);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        auditService.log("USER_CREATED_" + role.name(), "User", saved.getId(), saved.getPatientId());
        return new CredentialsResponse(UserSummary.from(saved), temporaryPassword);
    }

    /** Used by the emergency desk and by reception to give a patient a sign-in. */
    public CredentialsResponse createPatientAccount(Patient patient, String prefix) {
        if (userRepository.existsByPatientId(patient.getId())) {
            throw new IllegalArgumentException(
                    "This patient already has a login. An administrator can reset the password if it was lost.");
        }
        String temporaryPassword = PasswordGenerator.generate(TEMP_PASSWORD_LENGTH);

        User user = new User();
        user.setUsername(uniqueUsername(prefix, patient.getId()));
        user.setFullName(patient.getFullName());
        user.setRole(Role.PATIENT);
        user.setPatientId(patient.getId());
        applyTemporaryPassword(user, temporaryPassword);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        auditService.log("USER_CREATED_PATIENT", "User", saved.getId(), patient.getId());
        return new CredentialsResponse(UserSummary.from(saved), temporaryPassword);
    }

    public UserSummary changeRole(String id, Role newRole, String actor) {
        User user = find(id);
        requireApproved(user);
        if (newRole == null) {
            throw new IllegalArgumentException("Choose a role");
        }
        if (user.getUsername().equals(actor)) {
            throw new IllegalArgumentException("You cannot change your own role");
        }
        if (user.getRole() == Role.PATIENT || newRole == Role.PATIENT) {
            throw new IllegalArgumentException("Patient logins are tied to a patient record and cannot change role");
        }
        if (newRole == Role.DOCTOR && user.getDoctorId() == null) {
            throw new IllegalArgumentException(
                    "A doctor login must be linked to a doctor profile. Create it from the account form instead.");
        }
        user.setRole(newRole);
        User saved = userRepository.save(user);
        auditService.log("USER_ROLE_CHANGED_" + newRole.name(), "User", saved.getId(), null);
        return UserSummary.from(saved);
    }

    public UserSummary setActive(String id, boolean active, String actor) {
        User user = find(id);
        requireApproved(user);
        if (user.getUsername().equals(actor) && !active) {
            throw new IllegalArgumentException("You cannot deactivate your own account");
        }
        user.setActive(active);
        User saved = userRepository.save(user);
        auditService.log(active ? "USER_ACTIVATED" : "USER_DEACTIVATED", "User", saved.getId(), saved.getPatientId());
        return UserSummary.from(saved);
    }

    public CredentialsResponse resetPassword(String id) {
        User user = find(id);
        String temporaryPassword = PasswordGenerator.generate(TEMP_PASSWORD_LENGTH);
        applyTemporaryPassword(user, temporaryPassword);
        User saved = userRepository.save(user);
        auditService.log("USER_PASSWORD_RESET", "User", saved.getId(), saved.getPatientId());
        return new CredentialsResponse(UserSummary.from(saved), temporaryPassword);
    }

    // ---------------------------------------------------------------

    private void applyTemporaryPassword(User user, String temporaryPassword) {
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setMustChangePassword(true);
        user.setExpiresAt(user.getRole() == Role.PATIENT
                ? LocalDateTime.now().plusDays(PATIENT_ACCOUNT_DAYS)
                : null);
    }

    private String uniqueUsername(String prefix, String patientId) {
        String base = prefix.toLowerCase() + "-" + idTag(patientId).toLowerCase();
        String candidate = base;
        int attempts = 0;
        while (userRepository.existsByUsername(candidate) && attempts < 20) {
            candidate = base + ThreadLocalRandom.current().nextInt(10, 100);
            attempts++;
        }
        if (userRepository.existsByUsername(candidate)) {
            throw new IllegalStateException("Could not generate a unique username, please try again");
        }
        return candidate;
    }

    private void requireApproved(User user) {
        if (user.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalArgumentException("This account is still waiting for approval. Review it under Staff approvals.");
        }
    }

    private User find(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
