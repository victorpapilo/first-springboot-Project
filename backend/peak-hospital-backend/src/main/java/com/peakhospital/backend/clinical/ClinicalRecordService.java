package com.peakhospital.backend.clinical;

import com.peakhospital.backend.audit.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class ClinicalRecordService {

    private static final String TYPE = "ClinicalRecord";

    private final ClinicalRecordRepository repository;
    private final AuditService audit;

    public ClinicalRecordService(ClinicalRecordRepository repository, AuditService audit) {
        this.repository = repository;
        this.audit = audit;
    }

    public ClinicalRecord create(ClinicalRecordRequest request, String username) {
        ClinicalRecord record = new ClinicalRecord();
        record.setPatientId(request.patientId().trim());
        record.setChiefComplaint(request.chiefComplaint().trim());
        record.setVitals(request.vitals());
        record.setDiagnosis(request.diagnosis());
        record.setIcd10Code(request.icd10Code() == null ? null : request.icd10Code().trim().toUpperCase());
        record.setAllergies(request.allergies());
        record.setNotes(request.notes());
        record.setPlan(request.plan());
        record.setCreatedBy(username);
        record.setCreatedAt(Instant.now());

        ClinicalRecord saved = repository.save(record);
        audit.log("CREATE_CLINICAL_RECORD", TYPE, saved.getId(), saved.getPatientId());
        return saved;
    }

    public List<ClinicalRecord> forPatient(String patientId) {
        List<ClinicalRecord> records = repository.findByPatientIdOrderByCreatedAtDesc(patientId);
        audit.log("VIEW_PATIENT_RECORDS", TYPE, null, patientId);
        return records;
    }

    public ClinicalRecord get(String id) {
        ClinicalRecord record = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
        audit.log("VIEW_CLINICAL_RECORD", TYPE, record.getId(), record.getPatientId());
        return record;
    }
}