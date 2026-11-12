package com.peakhospital.backend.emergency;

import com.peakhospital.backend.accounts.CredentialsResponse;
import com.peakhospital.backend.accounts.UserAdminService;
import com.peakhospital.backend.audit.AuditService;
import com.peakhospital.backend.model.Patient;
import com.peakhospital.backend.model.Visit;
import com.peakhospital.backend.repository.PatientRepository;
import com.peakhospital.backend.service.PatientService;
import com.peakhospital.backend.service.VisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmergencyService {

    /** How far back the emergency board looks. */
    private static final int BOARD_HOURS = 72;

    private final PatientService patientService;
    private final PatientRepository patientRepository;
    private final VisitService visitService;
    private final UserAdminService userAdminService;
    private final AuditService auditService;
    private final MongoTemplate mongoTemplate;

    public EmergencyRegistrationResponse register(EmergencyRegistrationRequest request) {
        boolean unknown = request.fullName() == null || request.fullName().isBlank();

        Patient patient = new Patient();
        patient.setFullName(unknown ? "Unknown Patient" : request.fullName().trim());
        patient.setPhoneNumber(blank(request.phoneNumber()) ? "Not provided" : request.phoneNumber().trim());
        patient.setGender(blank(request.gender()) ? null : request.gender().trim());
        patient.setApproximateAge(request.approximateAge());
        patient.setEmergency(true);
        patient.setTriageLevel(request.triageLevel());
        Patient saved = patientService.registerPatient(patient);

        if (unknown) {
            saved.setFullName("Unknown Patient EM-" + UserAdminService.idTag(saved.getId()));
            saved = patientRepository.save(saved);
        }

        // Count this as a visit straight away so the record shows up in visit history and statistics.
        Visit visit = new Visit();
        visit.setPatientId(saved.getId());
        visit.setReason("EMERGENCY (" + request.triageLevel() + "): " + request.complaint().trim());
        visit.setAmountCharged(0);
        visitService.recordVisit(visit);

        CredentialsResponse credentials = userAdminService.createPatientAccount(saved, "EM");
        auditService.log("EMERGENCY_REGISTRATION", "Patient", saved.getId(), saved.getId());

        Patient fresh = patientService.getPatientById(saved.getId());
        return new EmergencyRegistrationResponse(fresh, credentials.user().username(),
                credentials.temporaryPassword(), credentials.user().expiresAt());
    }

    /** Recent emergency patients, most urgent first, then longest waiting. */
    public List<Patient> board() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(BOARD_HOURS);
        Query query = Query.query(Criteria.where("emergency").is(true).and("registrationDate").gte(cutoff));
        List<Patient> patients = new ArrayList<>(mongoTemplate.find(query, Patient.class));
        patients.sort((a, b) -> {
            int ta = a.getTriageLevel() == null ? 99 : a.getTriageLevel().ordinal();
            int tb = b.getTriageLevel() == null ? 99 : b.getTriageLevel().ordinal();
            if (ta != tb) {
                return Integer.compare(ta, tb);
            }
            if (a.getRegistrationDate() == null || b.getRegistrationDate() == null) {
                return 0;
            }
            return a.getRegistrationDate().compareTo(b.getRegistrationDate());
        });
        return patients;
    }

    private boolean blank(String s) {
        return s == null || s.isBlank();
    }
}
