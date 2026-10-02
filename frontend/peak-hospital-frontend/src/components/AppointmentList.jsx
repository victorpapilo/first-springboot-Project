import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AppointmentList({ refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAppointments().then(setAppointments).finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleStatusChange(id, status) {
    const updated = await api.updateAppointmentStatus(id, status);
    setAppointments((list) => list.map((a) => (a.id === id ? updated : a)));
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor)
  );

  return (
    <div className="scroll-x">
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Patient</th>
            <th style={styles.th}>Doctor</th>
            <th style={styles.th}>When</th>
            <th style={styles.th}>Reason</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {!loading && sorted.length === 0 && (
            <tr>
              <td style={styles.empty} colSpan={5}>
                No appointments booked yet.
              </td>
            </tr>
          )}
          {sorted.map((a) => (
            <tr key={a.id}>
              <td style={styles.td}>{a.patientName}</td>
              <td style={styles.td}>Dr. {a.doctorName}</td>
              <td style={styles.td}>{new Date(a.scheduledFor).toLocaleString()}</td>
              <td style={styles.td}>{a.reason || "—"}</td>
              <td style={styles.td}>
                <select
                  value={a.status}
                  onChange={(e) => handleStatusChange(a.id, e.target.value)}
                  style={{
                    ...styles.statusSelect,
                    ...(a.status === "COMPLETED" ? styles.statusCompleted : {}),
                    ...(a.status === "CANCELLED" ? styles.statusCancelled : {}),
                  }}
                >
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
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14.5 },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    borderBottom: "1px solid var(--line)",
    color: "var(--text-muted)",
    fontWeight: 500,
    fontSize: 13,
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid var(--line)",
    color: "var(--text-primary)",
  },
  empty: { padding: "20px 14px", color: "var(--text-muted)", textAlign: "center" },
  statusSelect: {
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "5px 8px",
    fontSize: 13,
    background: "var(--paper-raised)",
  },
  statusCompleted: { color: "var(--teal-600)", borderColor: "var(--teal-500)" },
  statusCancelled: { color: "var(--red-600)", borderColor: "var(--red-600)" },
};
