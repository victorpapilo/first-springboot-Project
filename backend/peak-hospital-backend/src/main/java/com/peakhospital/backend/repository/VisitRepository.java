package com.peakhospital.backend.repository;

import com.peakhospital.backend.model.Visit;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface VisitRepository extends MongoRepository<Visit, String> {

    List<Visit> findByPatientId(String patientId);

    List<Visit> findByVisitDateBetween(LocalDateTime start, LocalDateTime end);
}
