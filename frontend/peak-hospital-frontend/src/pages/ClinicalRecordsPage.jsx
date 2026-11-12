import { useEffect, useState } from "react";
import { api } from "../api/client";

const EMPTY_FORM = {
  chiefComplaint: "",
  systolic: "",
  diastolic: "",
  temperatureC: "",
  pulse: "",
  respiratoryRate: "",
  spo2: "",
  weightKg: "",
  heightCm: "",
  diagnosis: "",
  icd10Code: "",
  allergies: "",
  notes: "",
  plan: "",
};

const toNum = (v) => (v === "" ? null : Number(v));
const orNull = (v) => (v.trim() === "" ? null : v.trim());

function vitalsSummary(v) {
  if (!v) return [];
  const items = [];
  if (v.systolic != null && v.diastolic != null) items.push(["Blood pressure", `${v.systolic}/${v.diastolic} mmHg`]);
  if (v.temperatureC != null) items.push(["Temperature", `${v.temperatureC} °C`]);
  if (v.pulse != null) items.push(["Pulse", `${v.pulse} bpm`]);
  if (v.respiratoryRate != null) items.push(["Resp. rate", `${v.respiratoryRate} /min`]);
  if (v.spo2 != null) items.push(["SpO2", `${v.spo2}%`]);
  if (v.weightKg != null) items.push(["Weight", `${v.weightKg} kg`]);
  if (v.heightCm != null) items.push(["Height", `${v.heightCm} cm`]);
  return items;
}

export default function ClinicalRecordsPage() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api
      .getPatients()
      .then(setPatients)
      .catch((err) => setStatus({ state: "error", message: err.message }));
  }, []);

  useEffect(() => {
    if (!patientId) {
      setRecords([]);
      return;
    }
    let cancelled = false;
    setLoadingRecords(true);
    api
      .getClinicalRecords(patientId)
      .then((data) => {
        if (!cancelled) setRecords(data);
      })
      .catch((err) => {
        if (!cancelled) setStatus({ state: "error", message: err.message });
      })
      .finally(() => {
        if (!cancelled) setLoadingRecords(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId, reloadKey]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "saving", message: "" });

    const vitals = {
      systolic: toNum(form.systolic),
      diastolic: toNum(form.diastolic),
      temperatureC: toNum(form.temperatureC),
      pulse: toNum(form.pulse),
      respiratoryRate: toNum(form.respiratoryRate),
      spo2: toNum(form.spo2),
      weightKg: toNum(form.weightKg),
      heightCm: toNum(form.heightCm),
    };
    const hasVitals = Object.values(vitals).some((v) => v !== null);

    try {
      await api.createClinicalRecord({
        patientId,
        chiefComplaint: form.chiefComplaint.trim(),
        vitals: hasVitals ? vitals : null,
        diagnosis: orNull(form.diagnosis),
        icd10Code: orNull(form.icd10Code),
        allergies: orNull(form.allergies),
        notes: orNull(form.notes),
        plan: orNull(form.plan),
      });
      setForm(EMPTY_FORM);
      setReloadKey((k) => k + 1);
      setStatus({ state: "success", message: "Visit note saved." });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  const selectedPatient = patients.find((p) => p.id === patientId);

  return (
    <div>
      <h1 style={styles.title}>Clinical Records</h1>
      <p style={styles.subtitle}>Record visit notes and review each patient’s history.</p>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Patient</h2>
        <select
          style={styles.input}
          value={patientId}
          onChange={(e) => {
            setPatientId(e.target.value);
            setStatus({ state: "idle", message: "" });
          }}
        >
          <option value="">Select a patient…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </select>
      </section>

      {patientId && (
        <>
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Record a visit</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <Labeled label="Chief complaint (why the patient came in)">
                <input
                  style={styles.input}
                  value={form.chiefComplaint}
                  onChange={set("chiefComplaint")}
                  maxLength={500}
                  required
                />
              </Labeled>

              <div style={styles.groupLabel}>Vitals (all optional)</div>
              <div style={styles.grid4}>
                <Labeled label="Systolic (mmHg)">
                  <input style={styles.input} type="number" min="0" value={form.systolic} onChange={set("systolic")} />
                </Labeled>
                <Labeled label="Diastolic (mmHg)">
                  <input style={styles.input} type="number" min="0" value={form.diastolic} onChange={set("diastolic")} />
                </Labeled>
                <Labeled label="Temperature (°C)">
                  <input style={styles.input} type="number" step="0.1" min="0" value={form.temperatureC} onChange={set("temperatureC")} />
                </Labeled>
                <Labeled label="Pulse (bpm)">
                  <input style={styles.input} type="number" min="0" value={form.pulse} onChange={set("pulse")} />
                </Labeled>
                <Labeled label="Resp. rate (/min)">
                  <input style={styles.input} type="number" min="0" value={form.respiratoryRate} onChange={set("respiratoryRate")} />
                </Labeled>
                <Labeled label="SpO2 (%)">
                  <input style={styles.input} type="number" min="0" max="100" value={form.spo2} onChange={set("spo2")} />
                </Labeled>
                <Labeled label="Weight (kg)">
                  <input style={styles.input} type="number" step="0.1" min="0" value={form.weightKg} onChange={set("weightKg")} />
                </Labeled>
                <Labeled label="Height (cm)">
                  <input style={styles.input} type="number" step="0.1" min="0" value={form.heightCm} onChange={set("heightCm")} />
                </Labeled>
              </div>

              <div style={styles.grid2}>
                <Labeled label="Diagnosis">
                  <input style={styles.input} value={form.diagnosis} onChange={set("diagnosis")} maxLength={500} />
                </Labeled>
                <Labeled label="ICD-10 code (e.g. J18.9)">
                  <input style={styles.input} value={form.icd10Code} onChange={set("icd10Code")} maxLength={20} />
                </Labeled>
              </div>

              <Labeled label="Allergies">
                <input style={styles.input} value={form.allergies} onChange={set("allergies")} maxLength={500} />
              </Labeled>

              <Labeled label="History and examination notes">
                <textarea style={{ ...styles.input, ...styles.textarea }} value={form.notes} onChange={set("notes")} maxLength={5000} />
              </Labeled>

              <Labeled label="Treatment plan and follow-up">
                <textarea style={{ ...styles.input, ...styles.textarea }} value={form.plan} onChange={set("plan")} maxLength={3000} />
              </Labeled>

              <div style={styles.actions}>
                <button type="submit" style={styles.submit} disabled={status.state === "saving"}>
                  {status.state === "saving" ? "Saving…" : "Save visit note"}
                </button>
                {status.state === "success" && <span style={styles.success}>{status.message}</span>}
                {status.state === "error" && (
                  <span style={styles.error} role="alert">
                    {status.message}
                  </span>
                )}
              </div>
            </form>
          </section>

          <section style={styles.card}>
            <h2 style={styles.cardTitle}>
              Visit history{selectedPatient ? ` · ${selectedPatient.fullName}` : ""}
            </h2>

            {loadingRecords && <p style={styles.muted}>Loading…</p>}
            {!loadingRecords && records.length === 0 && (
              <p style={styles.muted}>No visit notes recorded for this patient yet.</p>
            )}

            {records.map((r) => {
              const vitals = vitalsSummary(r.vitals);
              return (
                <article key={r.id} style={styles.record}>
                  <header style={styles.recordHead}>
                    <strong>{new Date(r.createdAt).toLocaleString()}</strong>
                    <span style={styles.muted}>by {r.createdBy}</span>
                  </header>

                  <Row label="Complaint" value={r.chiefComplaint} />
                  {vitals.length > 0 && (
                    <div style={styles.chips}>
                      {vitals.map(([k, v]) => (
                        <span key={k} style={styles.chip}>
                          {k}: <strong>{v}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                  <Row
                    label="Diagnosis"
                    value={r.diagnosis ? `${r.diagnosis}${r.icd10Code ? ` (${r.icd10Code})` : ""}` : r.icd10Code}
                  />
                  <Row label="Allergies" value={r.allergies} />
                  <Row label="Notes" value={r.notes} />
                  <Row label="Plan" value={r.plan} />
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

function Labeled({ label, children }) {
  return (
    <label style={styles.label}>
      {label}
      {children}
    </label>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <p style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      {value}
    </p>
  );
}

const styles = {
  title: { fontFamily: "var(--font-display)", fontSize: 32, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", margin: "6px 0 24px" },
  card: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-card)",
    padding: "24px 26px",
    marginBottom: 24,
  },
  cardTitle: { fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--ink-900)" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-muted)" },
  groupLabel: { fontSize: 13, fontWeight: 600, color: "var(--ink-900)", marginTop: 4 },
  input: {
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    fontSize: 14.5,
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  textarea: { minHeight: 90, resize: "vertical" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 },
  actions: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
  submit: {
    background: "var(--teal-600)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "11px 20px",
    fontWeight: 600,
    fontSize: 14.5,
    cursor: "pointer",
  },
  success: { color: "var(--teal-600)", fontSize: 14 },
  error: { color: "var(--red-600)", fontSize: 14 },
  muted: { color: "var(--text-muted)", fontSize: 14 },
  record: { borderTop: "1px solid var(--line)", padding: "16px 0 4px" },
  recordHead: { display: "flex", gap: 12, alignItems: "baseline", marginBottom: 8, flexWrap: "wrap" },
  row: { margin: "4px 0", fontSize: 14.5, lineHeight: 1.5, whiteSpace: "pre-wrap" },
  rowLabel: { display: "inline-block", minWidth: 96, color: "var(--text-muted)", fontSize: 13 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0" },
  chip: {
    background: "var(--paper)",
    border: "1px solid var(--line)",
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 13,
  },
};