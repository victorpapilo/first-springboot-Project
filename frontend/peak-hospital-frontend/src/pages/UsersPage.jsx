import { useCallback, useEffect, useState } from "react";
import { Field, inputStyle } from "../components/Field";
import CredentialSlip from "../components/CredentialSlip";
import { api } from "../api/client";
import { getUser } from "../utils/auth";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "../utils/roles";

const CREATABLE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "PHARMACIST", "LAB_TECHNICIAN", "PATIENT"];
const SWITCHABLE_ROLES = ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "PHARMACIST", "LAB_TECHNICIAN"];
const EMPTY_FORM = { role: "RECEPTIONIST", fullName: "", username: "", doctorId: "", patientId: "" };

function statusOf(u) {
  if (u.approvalStatus === "PENDING") return { label: "Awaiting approval", tone: "amber" };
  if (!u.active) return { label: "Deactivated", tone: "red" };
  if (u.mustChangePassword) return { label: "Awaiting first sign-in", tone: "muted" };
  return { label: "Active", tone: "teal" };
}

export default function UsersPage() {
  const me = getUser();
  const [tab, setTab] = useState("staff");
  const [staff, setStaff] = useState([]);
  const [patientLogins, setPatientLogins] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slip, setSlip] = useState(null);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const load = useCallback(async () => {
    try {
      const [s, p, d, pts] = await Promise.all([
        api.getUsers("staff"),
        api.getUsers("patients"),
        api.getDoctors(),
        api.getPatients(),
      ]);
      setStaff(s);
      setPatientLogins(p);
      setDoctors(d);
      setPatients(pts);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const linkedDoctorIds = new Set(staff.map((u) => u.doctorId).filter(Boolean));
  const linkedPatientIds = new Set(patientLogins.map((u) => u.patientId).filter(Boolean));
  const freeDoctors = doctors.filter((d) => !linkedDoctorIds.has(d.id));
  const freePatients = patients.filter((p) => !linkedPatientIds.has(p.id));

  async function handleCreate(e) {
    e.preventDefault();
    setStatus({ state: "saving", message: "" });
    try {
      const result = await api.createUser({
        username: form.username,
        fullName: form.fullName,
        role: form.role,
        doctorId: form.role === "DOCTOR" ? form.doctorId : null,
        patientId: form.role === "PATIENT" ? form.patientId : null,
      });
      setSlip({
        title: "New account created",
        name: result.user.fullName,
        username: result.user.username,
        password: result.temporaryPassword,
        expiresAt: result.user.expiresAt,
        note: "This password is shown only once. Hand it to the person directly.",
      });
      setForm(EMPTY_FORM);
      setStatus({ state: "idle", message: "" });
      await load();
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  async function act(fn) {
    setStatus({ state: "idle", message: "" });
    try {
      await fn();
      await load();
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  const handleRole = (u, role) => act(() => api.changeUserRole(u.id, role));
  const handleActive = (u) => act(() => api.setUserActive(u.id, !u.active));

  async function handleReset(u) {
    if (!confirm(`Reset the password for ${u.fullName || u.username}? Their current password will stop working.`)) return;
    try {
      const result = await api.resetUserPassword(u.id);
      setSlip({
        title: "Password reset",
        name: result.user.fullName,
        username: result.user.username,
        password: result.temporaryPassword,
        expiresAt: result.user.expiresAt,
        note: "This password is shown only once. Hand it to the person directly.",
      });
      await load();
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  const rows = tab === "staff" ? staff : patientLogins;

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Users &amp; Roles</h1>
        <p style={styles.subtitle}>Create accounts and control who can do what. Staff who sign up themselves appear under Staff approvals.</p>
      </header>

      {slip && <CredentialSlip {...slip} onClose={() => setSlip(null)} />}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Create an account</h2>
        <form onSubmit={handleCreate} style={styles.form}>
          <div style={styles.grid}>
            <Field label="Role">
              <select style={inputStyle} value={form.role} onChange={update("role")}>
                {CREATABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </Field>

            {form.role === "DOCTOR" && (
              <Field label="Doctor profile">
                <select style={inputStyle} required value={form.doctorId} onChange={update("doctorId")}>
                  <option value="">Select a doctor…</option>
                  {freeDoctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.fullName}</option>)}
                </select>
              </Field>
            )}
            {form.role === "PATIENT" && (
              <Field label="Patient record">
                <select style={inputStyle} required value={form.patientId} onChange={update("patientId")}>
                  <option value="">Select a patient…</option>
                  {freePatients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </Field>
            )}
            {form.role !== "DOCTOR" && form.role !== "PATIENT" && (
              <Field label="Full name">
                <input style={inputStyle} required value={form.fullName} onChange={update("fullName")} />
              </Field>
            )}

            <Field label="Username">
              <input style={inputStyle} required value={form.username} onChange={update("username")} placeholder="e.g. nurse.ada" />
            </Field>
          </div>

          <p style={styles.hint}>{ROLE_DESCRIPTIONS[form.role]}</p>
          {form.role === "DOCTOR" && freeDoctors.length === 0 && (
            <p style={styles.hint}>Every doctor already has a login. Add the doctor on the Doctors page first.</p>
          )}

          <div style={styles.actions}>
            <button type="submit" style={styles.submit} disabled={status.state === "saving"}>
              {status.state === "saving" ? "Creating…" : "Create account"}
            </button>
            <span style={styles.muted}>A one-time password is generated for you to hand over.</span>
          </div>
        </form>
      </section>

      {status.state === "error" && <p style={styles.error} role="alert">{status.message}</p>}

      <section style={{ ...styles.section, marginTop: 24 }}>
        <div style={styles.tabs}>
          <button type="button" style={{ ...styles.tab, ...(tab === "staff" ? styles.tabActive : {}) }} onClick={() => setTab("staff")}>
            Staff ({staff.length})
          </button>
          <button type="button" style={{ ...styles.tab, ...(tab === "patients" ? styles.tabActive : {}) }} onClick={() => setTab("patients")}>
            Patients ({patientLogins.length})
          </button>
        </div>

        <div className="scroll-x">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td style={styles.empty} colSpan={5}>No accounts here yet.</td></tr>
              )}
              {rows.map((u) => {
                const st = statusOf(u);
                const isMe = u.username === me?.username;
                const pending = u.approvalStatus === "PENDING";
                const canSwitch = u.role !== "PATIENT" && !isMe && !pending;
                return (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.fullName || "—"}{isMe && <span style={styles.muted}> (you)</span>}</td>
                    <td style={{ ...styles.td, fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}>{u.username}</td>
                    <td style={styles.td}>
                      {canSwitch ? (
                        <select style={styles.roleSelect} value={u.role} onChange={(e) => handleRole(u, e.target.value)}>
                          {SWITCHABLE_ROLES.filter((r) => r !== "DOCTOR" || u.doctorId || u.role === "DOCTOR").map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      ) : (
                        ROLE_LABELS[u.role] || u.role
                      )}
                    </td>
                    <td style={styles.td}><span style={{ ...styles.badge, ...badgeTone[st.tone] }}>{st.label}</span></td>
                    <td style={styles.td}>
                      {pending ? (
                        <span style={styles.muted}>Review under Staff approvals</span>
                      ) : (
                        <div style={styles.rowActions}>
                          <button type="button" style={styles.smallBtn} onClick={() => handleReset(u)}>Reset password</button>
                          {!isMe && (
                            <button type="button" style={styles.smallBtn} onClick={() => handleActive(u)}>
                              {u.active ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const badgeTone = {
  teal: { background: "var(--teal-100)", color: "var(--teal-600)" },
  amber: { background: "var(--amber-100)", color: "var(--amber-600)" },
  red: { background: "var(--red-100)", color: "var(--red-600)" },
  muted: { background: "#eef1f0", color: "var(--text-muted)" },
};

const styles = {
  header: { marginBottom: 28 },
  title: { fontFamily: "var(--font-display)", fontSize: 30, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", marginTop: 6, fontSize: 15 },
  section: { background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 24 },
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 16px", color: "var(--ink-900)" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
  hint: { margin: 0, fontSize: 13.5, color: "var(--text-muted)" },
  actions: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  submit: { background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 18px", fontWeight: 600, fontSize: 14.5 },
  muted: { color: "var(--text-muted)", fontSize: 13 },
  error: { color: "var(--red-600)", fontSize: 14, margin: "16px 0 0" },
  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  tab: { background: "transparent", border: "1px solid var(--line)", borderRadius: 999, padding: "6px 14px", fontSize: 14 },
  tabActive: { background: "var(--teal-100)", color: "var(--teal-600)", borderColor: "var(--teal-600)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14.5 },
  th: { textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 },
  td: { padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-primary)", verticalAlign: "middle" },
  empty: { padding: "20px 14px", color: "var(--text-muted)", textAlign: "center" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" },
  roleSelect: { border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontSize: 13.5, background: "var(--paper-raised)" },
  rowActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  smallBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: 13 },
};
