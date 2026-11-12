package com.peakhospital.backend.model;

/** Emergency priority, most urgent first (the order matters: it is used for sorting). */
public enum TriageLevel {
    IMMEDIATE,
    VERY_URGENT,
    URGENT,
    STANDARD,
    NON_URGENT
}
