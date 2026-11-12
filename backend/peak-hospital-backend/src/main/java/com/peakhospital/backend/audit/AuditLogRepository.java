package com.peakhospital.backend.audit;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    List<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    List<AuditLog> findByPatientIdOrderByTimestampDesc(String patientId, Pageable pageable);
}