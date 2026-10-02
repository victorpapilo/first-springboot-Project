import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function DoctorList({ refreshKey }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getDoctors().then(setDoctors).finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleDelete(id) {
    if (!confirm("Remove this doctor?")) return;
    await api.deleteDoctor(id);
    setDoctors((list) => list.filter((d) => d.id !== id));
  }

  return (
    <div className="scroll-x">
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Specialization</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {!loading && doctors.length === 0 && (
            <tr>
              <td style={styles.empty} colSpan={4}>
                No doctors added yet.
              </td>
            </tr>
          )}
          {doctors.map((d) => (
            <tr key={d.id}>
              <td style={styles.td}>Dr. {d.fullName}</td>
              <td style={styles.td}>{d.specialization}</td>
              <td style={styles.td}>{d.phoneNumber || "—"}</td>
              <td style={styles.td}>
                <button style={styles.deleteBtn} onClick={() => handleDelete(d.id)}>
                  Remove
                </button>
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
  deleteBtn: {
    background: "transparent",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "5px 10px",
    fontSize: 13,
    color: "var(--red-600)",
  },
};
