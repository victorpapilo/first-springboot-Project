package com.peakhospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalPatients;
    private long newPatients;
    private long recurringPatients;
    private long totalCheckIns;
    private long checkInsToday;
    private double totalRevenue;
    private double revenueToday;
}
