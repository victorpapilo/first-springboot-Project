import { useState } from "react";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";

export default function PatientsPage({ onDataChanged }) {
  const [listKey, setListKey] = useState(0);

  function handleRegistered() {
    setListKey((k) => k + 1);
    onDataChanged?.();
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Patients</h1>
        <p style={styles.subtitle}>Register a new patient, or search existing records.</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Register a patient</h2>
        <PatientForm onRegistered={handleRegistered} />
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>All patients</h2>
        <PatientList refreshKey={listKey} />
      </section>
    </div>
  );
}

const styles = {
  header: { marginBottom: 28 },
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
