
export default function MyPortalPage() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>PATIENT PORTAL</p>
          <h1 style={styles.title}>My Health Portal</h1>
          <p style={styles.subtitle}>
            Welcome to Peak Hospital. Manage your healthcare
            information from one place.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.icon}>📅</div>
          <h3>Appointments</h3>
          <p>View and manage your upcoming appointments.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>💊</div>
          <h3>Prescriptions</h3>
          <p>Access your prescriptions and medication information.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>🧪</div>
          <h3>Laboratory Results</h3>
          <p>View laboratory tests and available results.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>📋</div>
          <h3>Medical Records</h3>
          <p>Access your available medical history and records.</p>
        </div>
      </div>

      <div style={styles.notice}>
        <strong>Your health matters.</strong>
        <p>
          Your medical information will be displayed here
          once it is connected to your patient account.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    color: "var(--ink-900, #172b35)",
  },
  header: {
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 700,
    color: "#26877e",
  },
  title: {
    fontSize: 30,
    margin: "10px 0",
  },
  subtitle: {
    color: "#71818a",
    lineHeight: 1.7,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
  },
  card: {
    background: "#fff",
    border: "1px solid #e8edef",
    borderRadius: 14,
    padding: 24,
  },
  icon: {
    fontSize: 27,
    marginBottom: 15,
  },
  notice: {
    marginTop: 25,
    padding: 22,
    background: "#edf7f5",
    borderRadius: 12,
    lineHeight: 1.7,
  },
};
