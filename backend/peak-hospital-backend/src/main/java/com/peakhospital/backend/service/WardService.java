package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.AdmissionStatus;
import com.peakhospital.backend.model.Ward;
import com.peakhospital.backend.repository.AdmissionRepository;
import com.peakhospital.backend.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WardService {

    private final WardRepository wardRepository;
    private final AdmissionRepository admissionRepository;

    public Ward addWard(Ward ward) {
        ward.setId(null);
        return wardRepository.save(ward);
    }

    public List<Ward> getAllWards() {
        return wardRepository.findAll();
    }

    public Ward getWardById(String id) {
        return wardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + id));
    }

    public long occupiedBeds(String wardId) {
        return admissionRepository.countByWardIdAndStatus(wardId, AdmissionStatus.ADMITTED);
    }

    public void deleteWard(String id) {
        Ward ward = getWardById(id);
        wardRepository.delete(ward);
    }
}
