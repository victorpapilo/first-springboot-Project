/**
 * A printable card with sign-in details. Shown once, right after an account is created or reset,
 * because the temporary password is not stored in readable form and cannot be shown again.
 */
export default function CredentialSlip({ title = "Sign-in details", name, username, password, expiresAt, note, onClose }) {
  return (
    <div className="credential-slip" style={styles.card}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .credential-slip, .credential-slip * { visibility: visible !important; }
          .credential-slip { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 1px solid #000 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={styles.brand}>Peak Hospital</div>
      <h3 style={styles.title}>{title}</h3>
      {name && <p style={styles.name}>{name}</p>}

      <dl style={styles.list}>
        <dt style={styles.term}>Username</dt>
        <dd style={styles.value}>{username}</dd>
        <dt style={styles.term}>Temporary password</dt>
        <dd style={styles.value}>{password}</dd>
      </dl>

      <p style={styles.text}>
        Sign in with these details. You will then be asked to choose your own password
        {expiresAt ? ` and confirm your details. Unused logins stop working on ${new Date(expiresAt).toLocaleDateString()}.` : "."}
      </p>
      <p style={styles.text}>Upper and lower case letters in the password matter.</p>
      {note && <p style={styles.warn}>{note}</p>}

      <div className="no-print" style={styles.actions}>
        <button type="button" style={styles.primary} onClick={() => window.print()}>Print slip</button>
        <button type="button" style={styles.secondary} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "var(--paper-raised)",
    border: "2px solid var(--teal-600)",
    borderRadius: "var(--radius-md)",
    padding: 24,
    marginBottom: 24,
    maxWidth: 520,
  },
  brand: { fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)" },
  title: { fontFamily: "var(--font-display)", fontSize: 22, margin: "4px 0 4px", color: "var(--ink-900)" },
  name: { margin: "0 0 14px", fontWeight: 600 },
  list: { display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: "0 0 14px", alignItems: "center" },
  term: { color: "var(--text-muted)", fontSize: 13 },
  value: {
    margin: 0,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: 20,
    letterSpacing: 1,
    color: "var(--ink-900)",
  },
  text: { margin: "6px 0", fontSize: 14, lineHeight: 1.5 },
  warn: {
    margin: "12px 0 0",
    padding: "8px 12px",
    background: "var(--amber-100)",
    color: "var(--amber-600)",
    borderRadius: "var(--radius-sm)",
    fontSize: 13.5,
  },
  actions: { display: "flex", gap: 10, marginTop: 16 },
  primary: {
    background: "var(--teal-600)", color: "#fff", border: "none",
    borderRadius: "var(--radius-sm)", padding: "9px 16px", fontWeight: 600, fontSize: 14,
  },
  secondary: {
    background: "transparent", border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)", padding: "9px 16px", fontSize: 14,
  },
};
