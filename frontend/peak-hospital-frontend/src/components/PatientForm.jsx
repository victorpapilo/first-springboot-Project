import { useState } from "react";
import { Field, inputStyle } from "./Field";
import { api } from "../api/client";

const EMPTY = {
  fullName: "",
  phoneNumber: "",
  email: "",
  address: "",
  gender: "",
  dateOfBirth: "",
};

export default function PatientForm({ onRegistered }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });
    try {
      const payload = { ...form };
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      const patient = await api.registerPatient(payload);
      setStatus({ state: "success", message: `Registered ${patient.fullName}.` });
      setForm(EMPTY);
      onRegistered?.(patient);
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
            required
          />
        </Field>
        <Field label="Phone number">
          <input
            style={inputStyle}
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
            required
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
        <Field label="Gender (optional)">
          <input
            style={inputStyle}
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          />
        </Field>
        <Field label="Date of birth (optional)">
          <input
            type="date"
            style={inputStyle}
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
          />
        </Field>
        <Field label="Address (optional)">
          <input
            style={inputStyle}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </Field>
      </div>

      <div style={styles.actions}>
        <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
          {status.state === "loading" ? "Registering…" : "Register patient"}
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
