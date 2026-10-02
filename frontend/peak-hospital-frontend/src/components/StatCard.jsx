export default function StatCard({ label, value, tone = "default" }) {
  return (
    <div style={{ ...styles.card, ...(tone === "amber" ? styles.cardAmber : {}) }}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles = {
  card: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-card)",
    padding: "20px 22px",
    minWidth: 0,
  },
  cardAmber: {
    borderColor: "#e8cfa0",
    background: "var(--amber-100)",
  },
  label: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 10,
    fontWeight: 500,
  },
  value: {
    fontFamily: "var(--font-display)",
    fontSize: 32,
    fontWeight: 600,
    color: "var(--ink-900)",
    lineHeight: 1,
  },
};
