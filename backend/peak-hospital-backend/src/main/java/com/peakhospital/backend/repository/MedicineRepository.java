package com.peakhospital.backend.repository;

import com.peakhospital.backend.model.Medicine;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MedicineRepository extends MongoRepository<Medicine, String> {
}
