package com.peakhospital.backend.service;

import com.peakhospital.backend.dto.DashboardStats;
import com.peakhospital.backend.model.PatientType;
import com.peakhospital.backend.model.Visit;
import com.peakhospital.backend.repository.PatientRepository;
import com.peakhospital.backend.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;

    public DashboardStats getStats() {
        long totalPatients = patientRepository.count();
        long newPatients = patientRepository.countByPatientType(PatientType.NEW);
        long recurringPatients = patientRepository.countByPatientType(PatientType.RECURRING);

        List<Visit> allVisits = visitRepository.findAll();
        long totalCheckIns = allVisits.size();
        double totalRevenue = allVisits.stream().mapToDouble(Visit::getAmountCharged).sum();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<Visit> todaysVisits = visitRepository.findByVisitDateBetween(startOfDay, endOfDay);

        long checkInsToday = todaysVisits.size();
        double revenueToday = todaysVisits.stream().mapToDouble(Visit::getAmountCharged).sum();

        return new DashboardStats(
                totalPatients,
                newPatients,
                recurringPatients,
                totalCheckIns,
                checkInsToday,
                totalRevenue,
                revenueToday
        );
    }
}
