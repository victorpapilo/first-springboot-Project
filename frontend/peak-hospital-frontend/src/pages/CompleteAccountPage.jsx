import { useEffect, useState } from "react";
import { api } from "../api/client";

/**
 * Shown right after signing in with a temporary password.
 *  - Patients (for example emergency patients): finish their own account and real details.
 *  - Staff given a temporary password by an admin: choose their own password.
 */
export default function CompleteAccountPage({ user, onDone, onLogout }) {
  const isPatient = user.role === "PATIENT";
  const [form, setForm] = useState({
    currentPassword: "", fullName: "", phoneNumber: "", email: "", dateOfBirth: "",
    gender: "", address: "", newUsername: "", newPassword: "", confirm: "",
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    if (!isPatient) return;
    api.getProfile().then((p) => {
      const patient = p.patient;
      if (!patient) return;
      setForm((f) => ({
        ...f,
        fullName: patient.fullName?.startsWith("Unknown Patient") ? "" : patient.fullName || "",
        phoneNumber: patient.phoneNumber === "Not provided" ? "" : patient.phoneNumber || "",
        email: patient.email || "",
        gender: patient.gender || "",
        address: patient.address || "",
        dateOfBirth: patient.dateOfBirth || "",
      }));
    }).catch(() => {});
  }, [isPatient]);

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setStatus({ state: "error", message: "The two new passwords do not match." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      if (isPatient) {
        const auth = await api.completeAccount({
          currentPassword: form.currentPassword,
          newUsername: form.newUsername,
          newPassword: form.newPassword,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          email: form.email,
          dateOfBirth: form.dateOfBirth || null,
          gender: form.gender,
          address: form.address,
        });
        onDone(auth);
      } else {
        await api.changePassword(form.currentPassword, form.newPassword);
        onDone(null);
      }
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  return (
    <div style={styles.shell}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>{isPatient ? "Complete your account" : "Choose your own password"}</h1>
        <p style={styles.subtitle}>
          {isPatient
            ? "You signed in with a temporary password. Confirm your details and choose your own sign-in. Your records from this visit stay linked to you."
            : "You signed in with a temporary password. Choose a new one to continue."}
        </p>

        <Label text={isPatient ? "Temporary password (from your slip)" : "Current password"}>
          <input style={styles.input} type="password" required value={form.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" />
        </Label>

        {isPatient && (
          <>
            <Label text="Full name"><input style={styles.input} required value={form.fullName} onChange={set("fullName")} autoComplete="name" /></Label>
            <div style={styles.row}>
              <Label text="Phone number"><input style={styles.input} required value={form.phoneNumber} onChange={set("phoneNumber")} autoComplete="tel" /></Label>
              <Label text="Email (optional)"><input style={styles.input} type="email" value={form.email} onChange={set("email")} autoComplete="email" /></Label>
            </div>
            <div style={styles.row}>
              <Label text="Date of birth"><input style={styles.input} type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} /></Label>
              <Label text="Gender">
                <select style={styles.input} value={form.gender} onChange={set("gender")}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Label>
            </div>
            <Label text="Address (optional)"><input style={styles.input} value={form.address} onChange={set("address")} autoComplete="street-address" /></Label>
            <Label text="Choose your own username"><input style={styles.input} required value={form.newUsername} onChange={set("newUsername")} autoComplete="username" /></Label>
          </>
        )}

        <div style={styles.row}>
          <Label text="New password (8+ characters)">
            <input style={styles.input} type="password" required minLength={8} value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" />
          </Label>
          <Label text="Confirm new password">
            <input style={styles.input} type="password" required value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </Label>
        </div>

        <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
          {status.state === "loading" ? "Saving…" : "Save and continue"}
        </button>
        {status.state === "error" && <p style={styles.error} role="alert">{status.message}</p>}
        <button type="button" style={styles.link} onClick={onLogout}>Sign out</button>
      </form>
    </div>
  );
}

function Label({ text, children }) {
  return (
    <label style={styles.label}>
      {text}
      {children}
    </label>
  );
}

const styles = {
  shell: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "var(--paper)" },
  card: {
    background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-card)", padding: "32px 30px", width: "100%", maxWidth: 560,
    display: "flex", flexDirection: "column", gap: 14,
  },
  title: { fontFamily: "var(--font-display)", fontSize: 26, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", fontSize: 14.5, margin: "0 0 6px", lineHeight: 1.5 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-muted)" },
  input: { border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: 14.5, background: "var(--paper-raised)", color: "var(--text-primary)" },
  row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 },
  submit: { background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "11px 18px", fontWeight: 600, fontSize: 14.5, marginTop: 6 },
  error: { color: "var(--red-600)", fontSize: 13.5, margin: 0 },
  link: { background: "none", border: "none", color: "var(--text-muted)", fontSize: 13.5, textDecoration: "underline", alignSelf: "flex-start", padding: 0 },
};
