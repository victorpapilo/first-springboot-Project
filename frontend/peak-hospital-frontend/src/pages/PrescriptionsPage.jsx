import { useEffect, useState } from "react";
import { Field, inputStyle } from "../components/Field";
import { api } from "../api/client";

const EMPTY_MED = { name: "", dosage: "", frequency: "", duration: "" };

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState([{ ...EMPTY_MED }]);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api.getPatients().then(setPatients).catch(() => {});
    api.getDoctors().then(setDoctors).catch(() => {});
    api.getPrescriptions().then(setPrescriptions).catch(() => {});
  }, [refreshKey]);

  function updateMed(index, field, value) {
    setMedications((meds) => meds.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function addMedRow() {
    setMedications((meds) => [...meds, { ...EMPTY_MED }]);
  }

  function removeMedRow(index) {
    setMedications((meds) => meds.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId) {
      setStatus({ state: "error", message: "Select a patient first." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      const presc = await api.createPrescription({
        patientId,
        doctorId: doctorId || undefined,
        notes,
        medications: medications.filter((m) => m.name.trim() !== ""),
      });
      setStatus({ state: "success", message: `Prescription saved for ${presc.patientName}.` });
      setMedications([{ ...EMPTY_MED }]);
      setNotes("");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Prescriptions</h1>
        <p style={styles.subtitle}>Record medications prescribed to a patient.</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>New prescription</h2>
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
              <Field label="Doctor (optional)">
                <select style={inputStyle} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                  <option value="">No doctor on record…</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.fullName}</option>)}
                </select>
              </Field>
            </div>

            <div>
              <span style={styles.label}>Medications</span>
              {medications.map((m, i) => (
                <div key={i} style={styles.medRow}>
                  <input style={inputStyle} placeholder="Name" value={m.name}
                    onChange={(e) => updateMed(i, "name", e.target.value)} />
                  <input style={inputStyle} placeholder="Dosage (e.g. 500mg)" value={m.dosage}
                    onChange={(e) => updateMed(i, "dosage", e.target.value)} />
                  <input style={inputStyle} placeholder="Frequency (e.g. 2x/day)" value={m.frequency}
                    onChange={(e) => updateMed(i, "frequency", e.target.value)} />
                  <input style={inputStyle} placeholder="Duration (e.g. 5 days)" value={m.duration}
                    onChange={(e) => updateMed(i, "duration", e.target.value)} />
                  {medications.length > 1 && (
                    <button type="button" style={styles.removeBtn} onClick={() => removeMedRow(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" style={styles.addRowBtn} onClick={addMedRow}>+ Add medication</button>
            </div>

            <Field label="Notes (optional)">
              <input style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>

            <div style={styles.actions}>
              <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
                {status.state === "loading" ? "Saving…" : "Save prescription"}
              </button>
              {status.state === "success" && <span style={styles.success}>{status.message}</span>}
              {status.state === "error" && <span style={styles.error}>{status.message}</span>}
            </div>
          </form>
        )}
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>All prescriptions</h2>
        <div className="scroll-x">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Doctor</th>
                <th style={styles.th}>Medications</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 && (
                <tr><td style={styles.empty} colSpan={4}>No prescriptions yet.</td></tr>
              )}
              {prescriptions.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.patientName}</td>
                  <td style={styles.td}>{p.doctorName ? `Dr. ${p.doctorName}` : "—"}</td>
                  <td style={styles.td}>
                    {(p.medications || []).map((m) => `${m.name} (${m.dosage})`).join(", ") || "—"}
                  </td>
                  <td style={styles.td}>{new Date(p.prescribedDate).toLocaleDateString()}</td>
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
  label: { fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 },
  medRow: { display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" },
  addRowBtn: { background: "transparent", border: "1px dashed var(--line)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 13.5, color: "var(--teal-600)", marginTop: 4 },
  removeBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", color: "var(--red-600)", padding: "8px 10px" },
  actions: { display: "flex", alignItems: "center", gap: 14 },
  submit: { background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 18px", fontWeight: 600, fontSize: 14.5 },
  success: { color: "var(--teal-600)", fontSize: 14 },
  error: { color: "var(--red-600)", fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14.5 },
  th: { textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 },
  td: { padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-primary)" },
  empty: { padding: "20px 14px", color: "var(--text-muted)", textAlign: "center" },
};
