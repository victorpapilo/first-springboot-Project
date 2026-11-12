package com.peakhospital.backend.signup;

import com.peakhospital.backend.audit.AuditService;
import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.ApprovalStatus;
import com.peakhospital.backend.model.Doctor;
import com.peakhospital.backend.model.Role;
import com.peakhospital.backend.model.User;
import com.peakhospital.backend.repository.DoctorRepository;
import com.peakhospital.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffApplicationService {

    private final StaffApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AuditService auditService;

    /** status: PENDING (default), APPROVED, REJECTED or ALL. */
    public List<StaffApplication> list(String status) {
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
        if ("ALL".equalsIgnoreCase(status)) {
            return applicationRepository.findAllByOrderBySubmittedAtDesc();
        }
        try {
            return applicationRepository.findByStatusOrderBySubmittedAtDesc(ApprovalStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status must be PENDING, APPROVED, REJECTED or ALL");
        }
    }

    public StaffApplication approve(String id, boolean visiting, String visitingDays, String note, String actor) {
        StaffApplication application = findPending(id);
        User user = userRepository.findById(application.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("The account for this application no longer exists"));

        // An approved doctor needs a doctor profile so they can be booked and see their own schedule.
        if (application.getRole() == Role.DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setFullName(application.getFullName());
            doctor.setSpecialization(application.getSpecialization());
            doctor.setPhoneNumber(application.getPhoneNumber());
            doctor.setEmail(application.getEmail());
            doctor.setActive(true);
            doctor.setVisiting(visiting);
            doctor.setVisitingDays(visiting ? clean(visitingDays) : null);
            user.setDoctorId(doctorRepository.save(doctor).getId());
        }

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user.setActive(true);
        userRepository.save(user);

        application.setStatus(ApprovalStatus.APPROVED);
        application.setReviewedBy(actor);
        application.setReviewedAt(LocalDateTime.now());
        application.setReviewNote(clean(note));
        StaffApplication saved = applicationRepository.save(application);

        auditService.log("STAFF_APPLICATION_APPROVED_" + application.getRole().name(), "User", user.getId(), null);
        return saved;
    }

    /** The locked account is removed so the username can be used again; the application stays as a record. */
    public StaffApplication reject(String id, String note, String actor) {
        StaffApplication application = findPending(id);
        if (application.getUserId() != null) {
            userRepository.deleteById(application.getUserId());
        }
        String removedUserId = application.getUserId();

        application.setUserId(null);
        application.setStatus(ApprovalStatus.REJECTED);
        application.setReviewedBy(actor);
        application.setReviewedAt(LocalDateTime.now());
        application.setReviewNote(clean(note));
        StaffApplication saved = applicationRepository.save(application);

        auditService.log("STAFF_APPLICATION_REJECTED_" + application.getRole().name(), "User", removedUserId, null);
        return saved;
    }

    private StaffApplication findPending(String id) {
        StaffApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        if (application.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("This application has already been reviewed");
        }
        return application;
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
