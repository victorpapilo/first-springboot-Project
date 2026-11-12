package com.peakhospital.backend.signup;

import com.peakhospital.backend.model.ApprovalStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StaffApplicationRepository extends MongoRepository<StaffApplication, String> {

    List<StaffApplication> findByStatusOrderBySubmittedAtDesc(ApprovalStatus status);

    List<StaffApplication> findAllByOrderBySubmittedAtDesc();

    boolean existsByLicenseNumberIgnoreCaseAndStatus(String licenseNumber, ApprovalStatus status);
}
