package com.peakhospital.backend.repository;

import com.peakhospital.backend.model.Ward;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WardRepository extends MongoRepository<Ward, String> {
}
