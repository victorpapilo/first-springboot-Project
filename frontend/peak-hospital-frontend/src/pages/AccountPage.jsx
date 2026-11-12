import { useState } from "react";
import { api } from "../api/client";
import { getUser } from "../utils/auth";
import { ROLE_LABELS } from "../utils/roles";

export default function AccountPage() {
  const user = getUser();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setStatus({ state: "error", message: "The two new passwords do not match." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      await api.changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setStatus({ state: "success", message: "Password changed." });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>My account</h1>
        <p style={styles.subtitle}>{user?.fullName || user?.username} · {ROLE_LABELS[user?.role] || user?.role}</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Change password</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Current password
            <input style={styles.input} type="password" required value={form.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" />
          </label>
          <label style={styles.label}>New password (8+ characters)
            <input style={styles.input} type="password" required minLength={8} value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" />
          </label>
          <label style={styles.label}>Confirm new password
            <input style={styles.input} type="password" required value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </label>
          <div style={styles.actions}>
            <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
              {status.state === "loading" ? "Saving…" : "Change password"}
            </button>
            {status.state === "success" && <span style={styles.success}>{status.message}</span>}
            {status.state === "error" && <span style={styles.error} role="alert">{status.message}</span>}
          </div>
        </form>
      </section>
    </div>
  );
}

const styles = {
  header: { marginBottom: 28 },
  title: { fontFamily: "var(--font-display)", fontSize: 30, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", marginTop: 6, fontSize: 15 },
  section: { background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 24, maxWidth: 480 },
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 16px", color: "var(--ink-900)" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-muted)" },
  input: { border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: 14.5, background: "var(--paper-raised)", color: "var(--text-primary)" },
  actions: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  submit: { background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 18px", fontWeight: 600, fontSize: 14.5 },
  success: { color: "var(--teal-600)", fontSize: 14 },
  error: { color: "var(--red-600)", fontSize: 14 },
};
