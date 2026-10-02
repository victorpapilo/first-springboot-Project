import { useEffect, useState } from "react";
import { Field, inputStyle } from "./Field";
import { api } from "../api/client";

export default function VisitForm({ onRecorded }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api.getPatients().then(setPatients).catch(() => {});
    api.getDoctors().then(setDoctors).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId) {
      setStatus({ state: "error", message: "Select a patient first." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      const visit = await api.recordVisit({
        patientId,
        doctorId: doctorId || undefined,
        reason,
        diagnosis,
        amountCharged: Number(amount),
        notes,
      });
      setStatus({ state: "success", message: `Check-in recorded for ${visit.patientName}.` });
      setReason("");
      setDiagnosis("");
      setAmount("");
      setNotes("");
      onRecorded?.(visit);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  if (patients.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: 14.5 }}>
        No patients yet. Register a patient first, then come back here to record their check-in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.grid}>
        <Field label="Patient">
          <select
            style={inputStyle}
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            <option value="">Select a patient…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} — {p.patientType === "RECURRING" ? "Recurring" : "New"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Doctor seen (optional)">
          <select style={inputStyle} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">No doctor on record…</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.fullName} — {d.specialization}</option>
            ))}
          </select>
        </Field>
        <Field label="Reason for visit">
          <input
            style={inputStyle}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Routine checkup"
            required
          />
        </Field>
        <Field label="Diagnosis (optional)">
          <input
            style={inputStyle}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Malaria"
          />
        </Field>
        <Field label="Amount charged (₦)">
          <input
            type="number"
            min="0"
            step="0.01"
            style={inputStyle}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>
        <Field label="Notes (optional)">
          <input
            style={inputStyle}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>

      <div style={styles.actions}>
        <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
          {status.state === "loading" ? "Recording…" : "Record check-in"}
        </button>
        {status.state === "success" && <span style={styles.success}>{status.message}</span>}
        {status.state === "error" && <span style={styles.error}>{status.message}</span>}
      </div>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  submit: {
    background: "var(--teal-600)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "10px 18px",
    fontWeight: 600,
    fontSize: 14.5,
  },
  success: {
    color: "var(--teal-600)",
    fontSize: 14,
  },
  error: {
    color: "var(--red-600)",
    fontSize: 14,
  },
};
