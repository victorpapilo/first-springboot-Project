package com.peakhospital.backend.clinical;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** One visit's clinical note for one patient. Created, never silently edited. */
@Getter
@Setter
@Document(collection = "clinical_records")
public class ClinicalRecord {

    @Id
    private String id;

    private String patientId;
    private String chiefComplaint;   // why the patient came in
    private Vitals vitals;
    private String diagnosis;        // free-text diagnosis
    private String icd10Code;        // e.g. J18.9
    private String allergies;
    private String notes;            // history and examination findings
    private String plan;             // treatment plan, follow-up

    private String createdBy;        // set by the server from the login, never by the client
    private Instant createdAt;
}