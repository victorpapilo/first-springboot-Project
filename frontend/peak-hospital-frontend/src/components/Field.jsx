export function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

export const inputStyle = {
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 12px",
  fontSize: 14.5,
  background: "var(--paper-raised)",
  color: "var(--text-primary)",
};

const styles = {
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-muted)",
  },
};
