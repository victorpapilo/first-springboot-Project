import { useEffect, useState } from "react";
import { Field, inputStyle } from "./Field";
import { api } from "../api/client";

export default function AppointmentForm({ onScheduled }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api.getPatients().then(setPatients).catch(() => {});
    api.getDoctors().then(setDoctors).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId || !doctorId) {
      setStatus({ state: "error", message: "Select a patient and a doctor." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      const appt = await api.scheduleAppointment({
        patientId,
        doctorId,
        scheduledFor,
        reason,
      });
      setStatus({ state: "success", message: `Booked ${appt.patientName} with Dr. ${appt.doctorName}.` });
      setScheduledFor("");
      setReason("");
      onScheduled?.(appt);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  if (patients.length === 0 || doctors.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: 14.5 }}>
        You need at least one patient and one doctor before you can book an appointment.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.grid}>
        <Field label="Patient">
          <select style={inputStyle} value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
            <option value="">Select a patient…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
            ))}
          </select>
        </Field>
        <Field label="Doctor">
          <select style={inputStyle} value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
            <option value="">Select a doctor…</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.fullName} — {d.specialization}</option>
            ))}
          </select>
        </Field>
        <Field label="Date and time">
          <input
            type="datetime-local"
            style={inputStyle}
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            required
          />
        </Field>
        <Field label="Reason (optional)">
          <input
            style={inputStyle}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Follow-up"
          />
        </Field>
      </div>

      <div style={styles.actions}>
        <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
          {status.state === "loading" ? "Booking…" : "Book appointment"}
        </button>
        {status.state === "success" && <span style={styles.success}>{status.message}</span>}
        {status.state === "error" && <span style={styles.error}>{status.message}</span>}
      </div>
    </form>
  );
}

const styles = {
  form: { display: "flex", flexDirection: "column", gap: 20 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  actions: { display: "flex", alignItems: "center", gap: 14 },
  submit: {
    background: "var(--teal-600)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "10px 18px",
    fontWeight: 600,
    fontSize: 14.5,
  },
  success: { color: "var(--teal-600)", fontSize: 14 },
  error: { color: "var(--red-600)", fontSize: 14 },
};
