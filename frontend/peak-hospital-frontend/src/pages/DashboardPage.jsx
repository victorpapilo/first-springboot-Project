import { useEffect, useState } from "react";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import PatientList from "../components/PatientList";
import { formatNaira } from "../utils/format";

export default function DashboardPage({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [refreshKey]);

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Overview</h1>
        <p style={styles.subtitle}>Patient volume and revenue at a glance.</p>
      </header>

      {error && (
        <p style={styles.errorBanner}>
          Couldn't reach the API — is the Spring Boot server running on localhost:8080? ({error})
        </p>
      )}

      {stats && (
        <div style={styles.statGrid}>
          <StatCard label="Total patients" value={stats.totalPatients} />
          <StatCard label="New patients" value={stats.newPatients} />
          <StatCard label="Recurring patients" value={stats.recurringPatients} />
          <StatCard label="Check-ins today" value={stats.checkInsToday} />
          <StatCard label="Total check-ins" value={stats.totalCheckIns} />
          <StatCard label="Revenue today" value={formatNaira(stats.revenueToday)} tone="amber" />
          <StatCard label="Total revenue" value={formatNaira(stats.totalRevenue)} tone="amber" />
        </div>
      )}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Patients</h2>
        <PatientList refreshKey={refreshKey} />
      </section>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: 28,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 30,
    margin: 0,
    color: "var(--ink-900)",
  },
  subtitle: {
    color: "var(--text-muted)",
    marginTop: 6,
    fontSize: 15,
  },
  errorBanner: {
    background: "var(--red-100)",
    color: "var(--red-600)",
    padding: "12px 16px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    marginBottom: 20,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 36,
  },
  section: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    padding: 24,
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 19,
    margin: "0 0 16px",
    color: "var(--ink-900)",
  },
};
