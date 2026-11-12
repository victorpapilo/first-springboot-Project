import { useCallback, useEffect, useState } from "react";
import { Field, inputStyle } from "../components/Field";
import CredentialSlip from "../components/CredentialSlip";
import { api } from "../api/client";

const TRIAGE = {
  IMMEDIATE: { label: "Immediate", bg: "#b3402f", fg: "#fff" },
  VERY_URGENT: { label: "Very urgent", bg: "#d9822b", fg: "#fff" },
  URGENT: { label: "Urgent", bg: "var(--amber-100)", fg: "var(--amber-600)" },
  STANDARD: { label: "Standard", bg: "var(--teal-100)", fg: "var(--teal-600)" },
  NON_URGENT: { label: "Non-urgent", bg: "#eef1f0", fg: "var(--text-muted)" },
};

const EMPTY = { triageLevel: "URGENT", complaint: "", fullName: "", gender: "", approximateAge: "", phoneNumber: "" };

function TriageBadge({ level }) {
  const t = TRIAGE[level];
  if (!t) return <span>—</span>;
  return <span style={{ ...styles.badge, background: t.bg, color: t.fg }}>{t.label}</span>;
}

export default function EmergencyPage() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [slip, setSlip] = useState(null);
  const [board, setBoard] = useState([]);

  const loadBoard = useCallback(() => {
    api.getEmergencyQueue().then(setBoard).catch(() => {});
  }, []);

  useEffect(() => {
    loadBoard();
    const timer = setInterval(loadBoard, 30000);
    return () => clearInterval(timer);
  }, [loadBoard]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "saving", message: "" });
    try {
      const result = await api.registerEmergency({
        triageLevel: form.triageLevel,
        complaint: form.complaint.trim(),
        fullName: form.fullName.trim() || null,
        gender: form.gender || null,
        approximateAge: form.approximateAge === "" ? null : Number(form.approximateAge),
        phoneNumber: form.phoneNumber.trim() || null,
      });
      setSlip({
        title: "Emergency sign-in details",
        name: result.patient.fullName,
        username: result.username,
        password: result.temporaryPassword,
        expiresAt: result.expiresAt,
        note: "Hand this slip only to the patient or a relative after checking ID. The patient finishes setting up their own account when they sign in.",
      });
      setForm(EMPTY);
      setStatus({ state: "success", message: `Registered ${result.patient.fullName}. Treatment can start now.` });
      loadBoard();
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Emergency</h1>
        <p style={styles.subtitle}>Register someone in seconds. Only the complaint and priority are required.</p>
      </header>

      {slip && <CredentialSlip {...slip} onClose={() => setSlip(null)} />}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Emergency registration</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <Field label="Priority (triage)">
              <select style={inputStyle} value={form.triageLevel} onChange={update("triageLevel")}>
                {Object.entries(TRIAGE).map(([value, t]) => (
                  <option key={value} value={value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Complaint">
              <input style={inputStyle} required value={form.complaint} onChange={update("complaint")} maxLength={500} placeholder="e.g. Chest pain, road accident" />
            </Field>
            <Field label="Name (leave blank if unknown)">
              <input style={inputStyle} value={form.fullName} onChange={update("fullName")} maxLength={120} />
            </Field>
            <Field label="Approximate age">
              <input style={inputStyle} type="number" min="0" max="120" value={form.approximateAge} onChange={update("approximateAge")} />
            </Field>
            <Field label="Gender">
              <select style={inputStyle} value={form.gender} onChange={update("gender")}>
                <option value="">Not known</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Phone number (if known)">
              <input style={inputStyle} value={form.phoneNumber} onChange={update("phoneNumber")} maxLength={30} />
            </Field>
          </div>

          <div style={styles.actions}>
            <button type="submit" style={styles.submit} disabled={status.state === "saving"}>
              {status.state === "saving" ? "Registering…" : "Register emergency patient"}
            </button>
            {status.state === "success" && <span style={styles.success}>{status.message}</span>}
            {status.state === "error" && <span style={styles.error} role="alert">{status.message}</span>}
          </div>
        </form>
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <div style={styles.boardHead}>
          <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Emergency board (last 72 hours)</h2>
          <button type="button" style={styles.smallBtn} onClick={loadBoard}>Refresh</button>
        </div>
        <div className="scroll-x">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Age</th>
                <th style={styles.th}>Gender</th>
                <th style={styles.th}>Arrived</th>
              </tr>
            </thead>
            <tbody>
              {board.length === 0 && (
                <tr><td style={styles.empty} colSpan={5}>No emergency patients in the last 72 hours.</td></tr>
              )}
              {board.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}><TriageBadge level={p.triageLevel} /></td>
                  <td style={styles.td}>{p.fullName}</td>
                  <td style={styles.td}>{p.dateOfBirth ? "—" : p.approximateAge != null ? `~${p.approximateAge}` : "—"}</td>
                  <td style={styles.td}>{p.gender || "—"}</td>
                  <td style={styles.td}>{p.registrationDate ? new Date(p.registrationDate).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const styles = {
  header: { marginBottom: 28 },
  title: { fontFamily: "var(--font-display)", fontSize: 30, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", marginTop: 6, fontSize: 15 },
  section: { background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 24 },
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 16px", color: "var(--ink-900)" },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
  actions: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  submit: { background: "#b3402f", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 18px", fontWeight: 600, fontSize: 14.5 },
  success: { color: "var(--teal-600)", fontSize: 14 },
  error: { color: "var(--red-600)", fontSize: 14 },
  boardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 },
  smallBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: 13 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14.5 },
  th: { textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 },
  td: { padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-primary)" },
  empty: { padding: "20px 14px", color: "var(--text-muted)", textAlign: "center" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" },
};
