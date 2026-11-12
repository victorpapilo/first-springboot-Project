import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function MySchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [linked, setLinked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    Promise.all([api.getMyAppointments(), api.getProfile()])
      .then(([list, profile]) => {
        setAppointments(list);
        setLinked(!!profile.doctor);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatus(id, status) {
    try {
      const updated = await api.updateAppointmentStatus(id, status);
      setAppointments((list) => list.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  const sorted = [...appointments].sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
  const upcoming = sorted.filter((a) => a.status === "SCHEDULED" && new Date(a.scheduledFor) >= now);
  const earlier = sorted.filter((a) => !upcoming.includes(a)).reverse();

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>My schedule</h1>
        <p style={styles.subtitle}>Your appointments only.</p>
      </header>

      {error && <p style={styles.error} role="alert">{error}</p>}
      {!loading && !linked && (
        <p style={styles.notice}>Your login is not linked to a doctor profile yet, so no appointments can be shown. Ask an administrator to link it.</p>
      )}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Upcoming</h2>
        <Table rows={upcoming} onStatus={handleStatus} empty="No upcoming appointments." loading={loading} />
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>Earlier and cancelled</h2>
        <Table rows={earlier} onStatus={handleStatus} empty="Nothing here yet." loading={loading} />
      </section>
    </div>
  );
}

function Table({ rows, onStatus, empty, loading }) {
  return (
    <div className="scroll-x">
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>When</th>
            <th style={styles.th}>Patient</th>
            <th style={styles.th}>Reason</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {!loading && rows.length === 0 && <tr><td style={styles.empty} colSpan={4}>{empty}</td></tr>}
          {rows.map((a) => (
            <tr key={a.id}>
              <td style={styles.td}>{new Date(a.scheduledFor).toLocaleString()}</td>
              <td style={styles.td}>{a.patientName}</td>
              <td style={styles.td}>{a.reason || "—"}</td>
              <td style={styles.td}>
                <select style={styles.select} value={a.status} onChange={(e) => onStatus(a.id, e.target.value)}>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  header: { marginBottom: 28 },
  title: { fontFamily: "var(--font-display)", fontSize: 30, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", marginTop: 6, fontSize: 15 },
  section: { background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 24 },
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 16px", color: "var(--ink-900)" },
  notice: { background: "var(--amber-100)", color: "var(--amber-600)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 14, marginBottom: 20 },
  error: { color: "var(--red-600)", fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14.5 },
  th: { textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 },
  td: { padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-primary)" },
  empty: { padding: "20px 14px", color: "var(--text-muted)", textAlign: "center" },
  select: { border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontSize: 13.5, background: "var(--paper-raised)" },
};
