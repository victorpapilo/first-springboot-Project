import { useEffect, useState } from "react";
import { Field, inputStyle } from "../components/Field";
import { api } from "../api/client";

export default function LabTestsPage() {
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [patientId, setPatientId] = useState("");
  const [testName, setTestName] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api.getPatients().then(setPatients).catch(() => {});
    api.getLabTests().then(setTests).catch(() => {});
  }, [refreshKey]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId) {
      setStatus({ state: "error", message: "Select a patient first." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      const test = await api.orderLabTest({ patientId, testName });
      setStatus({ state: "success", message: `Ordered ${test.testName} for ${test.patientName}.` });
      setTestName("");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  async function handleComplete(test) {
    const result = prompt(`Result for ${test.testName} (${test.patientName}):`, "");
    if (result === null || result.trim() === "") return;
    await api.completeLabTest(test.id, result);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Lab Tests</h1>
        <p style={styles.subtitle}>Order tests and record results.</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Order a test</h2>
        {patients.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14.5 }}>Register a patient first.</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              <Field label="Patient">
                <select style={inputStyle} required value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                  <option value="">Select a patient…</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </Field>
              <Field label="Test name">
                <input style={inputStyle} required value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g. Full Blood Count" />
              </Field>
            </div>
            <div style={styles.actions}>
              <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
                {status.state === "loading" ? "Ordering…" : "Order test"}
              </button>
              {status.state === "success" && <span style={styles.success}>{status.message}</span>}
              {status.state === "error" && <span style={styles.error}>{status.message}</span>}
            </div>
          </form>
        )}
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>All tests</h2>
        <div className="scroll-x">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Test</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Result</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 && (
                <tr><td style={styles.empty} colSpan={5}>No tests ordered yet.</td></tr>
              )}
              {tests.map((t) => (
                <tr key={t.id}>
                  <td style={styles.td}>{t.patientName}</td>
                  <td style={styles.td}>{t.testName}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(t.status === "COMPLETED" ? styles.badgeTeal : styles.badgeMuted) }}>
                      {t.status === "COMPLETED" ? "Completed" : "Ordered"}
                    </span>
                  </td>
                  <td style={styles.td}>{t.result || "—"}</td>
                  <td style={styles.td}>
                    {t.status === "ORDERED" && (
                      <button style={styles.smallBtn} onClick={() => handleComplete(t)}>Enter result</button>
                    )}
                  </td>
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
  actions: { display: "flex", alignItems: "center", gap: 14 },
  submit: { background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 18px", fontWeight: 600, fontSize: 14.5 },
  success: { color: "var(--teal-600)", fontSize: 14 },
  error: { color: "var(--red-600)", fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14.5 },
  th: { textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 },
  td: { padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-primary)" },
  empty: { padding: "20px 14px", color: "var(--text-muted)", textAlign: "center" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 500 },
  badgeTeal: { background: "var(--teal-100)", color: "var(--teal-600)" },
  badgeMuted: { background: "#eef1f0", color: "var(--text-muted)" },
  smallBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: 13 },
};
