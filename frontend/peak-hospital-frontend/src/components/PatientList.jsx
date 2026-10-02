import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function PatientList({ refreshKey }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getPatients(search || undefined)
      .then(setPatients)
      .finally(() => setLoading(false));
  }, [search, refreshKey]);

  async function handleDelete(id) {
    if (!confirm("Remove this patient record?")) return;
    await api.deletePatient(id);
    setPatients((list) => list.filter((p) => p.id !== id));
  }

  return (
    <div>
      <input
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      <div className="scroll-x">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Visits</th>
              <th style={styles.th}>Registered</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {!loading && patients.length === 0 && (
              <tr>
                <td style={styles.empty} colSpan={6}>
                  No patients found.
                </td>
              </tr>
            )}
            {patients.map((p) => (
              <tr key={p.id}>
                <td style={styles.td}>{p.fullName}</td>
                <td style={styles.td}>{p.phoneNumber}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(p.patientType === "RECURRING" ? styles.badgeTeal : styles.badgeMuted),
                    }}
                  >
                    {p.patientType === "RECURRING" ? "Recurring" : "New"}
                  </span>
                </td>
                <td style={styles.td}>{p.totalVisits}</td>
                <td style={styles.td}>
                  {p.registrationDate ? new Date(p.registrationDate).toLocaleDateString() : "—"}
                </td>
                <td style={styles.td}>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  search: {
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    fontSize: 14.5,
    marginBottom: 16,
    width: "100%",
    maxWidth: 320,
    background: "var(--paper-raised)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14.5,
  },
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
  empty: {
    padding: "20px 14px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 500,
  },
  badgeTeal: {
    background: "var(--teal-100)",
    color: "var(--teal-600)",
  },
  badgeMuted: {
    background: "#eef1f0",
    color: "var(--text-muted)",
  },
  deleteBtn: {
    background: "transparent",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "5px 10px",
    fontSize: 13,
    color: "var(--red-600)",
  },
};
