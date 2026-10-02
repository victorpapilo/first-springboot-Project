import { useEffect, useState } from "react";
import { Field, inputStyle } from "../components/Field";
import { api } from "../api/client";

export default function WardsPage() {
  const [wards, setWards] = useState([]);
  const [occupancy, setOccupancy] = useState({});
  const [patients, setPatients] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [wardForm, setWardForm] = useState({ name: "", description: "", capacity: "" });
  const [wardStatus, setWardStatus] = useState({ state: "idle", message: "" });

  const [admitForm, setAdmitForm] = useState({ patientId: "", wardId: "", reason: "" });
  const [admitStatus, setAdmitStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api.getWards().then(setWards).catch(() => {});
    api.getPatients().then(setPatients).catch(() => {});
    api.getAdmissions().then(setAdmissions).catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    wards.forEach((w) => {
      api.getWardOccupancy(w.id).then((o) =>
        setOccupancy((prev) => ({ ...prev, [w.id]: o }))
      );
    });
  }, [wards]);

  async function handleAddWard(e) {
    e.preventDefault();
    setWardStatus({ state: "loading", message: "" });
    try {
      await api.addWard({ ...wardForm, capacity: Number(wardForm.capacity) });
      setWardStatus({ state: "success", message: "Ward added." });
      setWardForm({ name: "", description: "", capacity: "" });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setWardStatus({ state: "error", message: err.message });
    }
  }

  async function handleAdmit(e) {
    e.preventDefault();
    setAdmitStatus({ state: "loading", message: "" });
    try {
      const admission = await api.admitPatient(admitForm);
      setAdmitStatus({ state: "success", message: `Admitted ${admission.patientName} to ${admission.wardName}, bed ${admission.bedNumber}.` });
      setAdmitForm({ patientId: "", wardId: "", reason: "" });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAdmitStatus({ state: "error", message: err.message });
    }
  }

  async function handleDischarge(id) {
    await api.dischargePatient(id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Wards & Admissions</h1>
        <p style={styles.subtitle}>Manage ward capacity and admit or discharge patients.</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Add a ward</h2>
        <form onSubmit={handleAddWard} style={styles.form}>
          <div style={styles.grid}>
            <Field label="Ward name">
              <input style={inputStyle} required value={wardForm.name}
                onChange={(e) => setWardForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. General Ward" />
            </Field>
            <Field label="Bed capacity">
              <input type="number" min="1" style={inputStyle} required value={wardForm.capacity}
                onChange={(e) => setWardForm((f) => ({ ...f, capacity: e.target.value }))} />
            </Field>
            <Field label="Description (optional)">
              <input style={inputStyle} value={wardForm.description}
                onChange={(e) => setWardForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
          </div>
          <div style={styles.actions}>
            <button type="submit" style={styles.submit} disabled={wardStatus.state === "loading"}>
              {wardStatus.state === "loading" ? "Adding…" : "Add ward"}
            </button>
            {wardStatus.state === "success" && <span style={styles.success}>{wardStatus.message}</span>}
            {wardStatus.state === "error" && <span style={styles.error}>{wardStatus.message}</span>}
          </div>
        </form>
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>Wards</h2>
        <div className="scroll-x">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Capacity</th>
                <th style={styles.th}>Occupied</th>
                <th style={styles.th}>Available</th>
              </tr>
            </thead>
            <tbody>
              {wards.length === 0 && (
                <tr><td style={styles.empty} colSpan={4}>No wards added yet.</td></tr>
              )}
              {wards.map((w) => (
                <tr key={w.id}>
                  <td style={styles.td}>{w.name}</td>
                  <td style={styles.td}>{w.capacity}</td>
                  <td style={styles.td}>{occupancy[w.id]?.occupied ?? "…"}</td>
                  <td style={styles.td}>{occupancy[w.id]?.available ?? "…"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>Admit a patient</h2>
        {patients.length === 0 || wards.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14.5 }}>
            You need at least one patient and one ward before admitting someone.
          </p>
        ) : (
          <form onSubmit={handleAdmit} style={styles.form}>
            <div style={styles.grid}>
              <Field label="Patient">
                <select style={inputStyle} required value={admitForm.patientId}
                  onChange={(e) => setAdmitForm((f) => ({ ...f, patientId: e.target.value }))}>
                  <option value="">Select a patient…</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </Field>
              <Field label="Ward">
                <select style={inputStyle} required value={admitForm.wardId}
                  onChange={(e) => setAdmitForm((f) => ({ ...f, wardId: e.target.value }))}>
                  <option value="">Select a ward…</option>
                  {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
              <Field label="Reason for admission">
                <input style={inputStyle} required value={admitForm.reason}
                  onChange={(e) => setAdmitForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Observation" />
              </Field>
            </div>
            <div style={styles.actions}>
              <button type="submit" style={styles.submit} disabled={admitStatus.state === "loading"}>
                {admitStatus.state === "loading" ? "Admitting…" : "Admit patient"}
              </button>
              {admitStatus.state === "success" && <span style={styles.success}>{admitStatus.message}</span>}
              {admitStatus.state === "error" && <span style={styles.error}>{admitStatus.message}</span>}
            </div>
          </form>
        )}
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>Admissions</h2>
        <div className="scroll-x">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Ward</th>
                <th style={styles.th}>Bed</th>
                <th style={styles.th}>Admitted</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {admissions.length === 0 && (
                <tr><td style={styles.empty} colSpan={6}>No admissions yet.</td></tr>
              )}
              {admissions.map((a) => (
                <tr key={a.id}>
                  <td style={styles.td}>{a.patientName}</td>
                  <td style={styles.td}>{a.wardName}</td>
                  <td style={styles.td}>{a.bedNumber}</td>
                  <td style={styles.td}>{new Date(a.admissionDate).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(a.status === "ADMITTED" ? styles.badgeTeal : styles.badgeMuted) }}>
                      {a.status === "ADMITTED" ? "Admitted" : "Discharged"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {a.status === "ADMITTED" && (
                      <button style={styles.deleteBtn} onClick={() => handleDischarge(a.id)}>Discharge</button>
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
  deleteBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: 13, color: "var(--red-600)" },
};
