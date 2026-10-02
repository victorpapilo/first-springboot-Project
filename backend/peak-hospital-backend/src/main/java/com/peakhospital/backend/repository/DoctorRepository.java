package com.peakhospital.backend.repository;

import com.peakhospital.backend.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DoctorRepository extends MongoRepository<Doctor, String> {
}
