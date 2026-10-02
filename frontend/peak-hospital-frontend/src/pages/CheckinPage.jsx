import VisitForm from "../components/VisitForm";

export default function CheckinPage({ onDataChanged }) {
  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Record check-in</h1>
        <p style={styles.subtitle}>
          Log a patient visit and the amount charged. Their second visit onward, they're counted as recurring.
        </p>
      </header>

      <section style={styles.section}>
        <VisitForm onRecorded={onDataChanged} />
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
    maxWidth: 520,
  },
  section: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    padding: 24,
    maxWidth: 640,
  },
};
