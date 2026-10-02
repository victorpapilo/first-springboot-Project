import { useState } from "react";
import AppointmentForm from "../components/AppointmentForm";
import AppointmentList from "../components/AppointmentList";

export default function AppointmentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Appointments</h1>
        <p style={styles.subtitle}>Book future visits and track their status.</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Book an appointment</h2>
        <AppointmentForm onScheduled={() => setRefreshKey((k) => k + 1)} />
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>All appointments</h2>
        <AppointmentList refreshKey={refreshKey} />
      </section>
    </div>
  );
}

const styles = {
  header: { marginBottom: 28 },
  title: { fontFamily: "var(--font-display)", fontSize: 30, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", marginTop: 6, fontSize: 15 },
  section: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    padding: 24,
  },
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 16px", color: "var(--ink-900)" },
};
