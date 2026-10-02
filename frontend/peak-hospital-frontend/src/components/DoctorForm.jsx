import { useState } from "react";
import { Field, inputStyle } from "./Field";
import { api } from "../api/client";

const EMPTY = { fullName: "", specialization: "", phoneNumber: "", email: "" };

export default function DoctorForm({ onAdded }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });
    try {
      const doctor = await api.addDoctor(form);
      setStatus({ state: "success", message: `Added Dr. ${doctor.fullName}.` });
      setForm(EMPTY);
      onAdded?.(doctor);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.grid}>
        <Field label="Full name">
          <input
            style={inputStyle}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="e.g. Amaka Chukwu"
            required
          />
        </Field>
        <Field label="Specialization">
          <input
            style={inputStyle}
            value={form.specialization}
            onChange={(e) => update("specialization", e.target.value)}
            placeholder="e.g. Pediatrics"
            required
          />
        </Field>
        <Field label="Phone number (optional)">
          <input
            style={inputStyle}
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
          />
        </Field>
        <Field label="Email (optional)">
          <input
            type="email"
            style={inputStyle}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
      </div>

      <div style={styles.actions}>
        <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
          {status.state === "loading" ? "Adding…" : "Add doctor"}
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
