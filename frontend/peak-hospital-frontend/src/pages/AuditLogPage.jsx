import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const PAGE_SIZE = 50;

function prettyAction(action) {
  if (!action) return "";
  const text = action.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function AuditLogPage() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [page, setPage] = useState(0);
  const [logs, setLogs] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [status, setStatus] = useState({ state: "loading", message: "" });

  useEffect(() => {
    api.getPatients().then(setPatients).catch(() => {});
  }, []);

  const patientNames = useMemo(
    () => Object.fromEntries(patients.map((p) => [p.id, p.fullName])),
    [patients]
  );

  useEffect(() => {
    let cancelled = false;
    setStatus({ state: "loading", message: "" });
    api
      .getAuditLogs(patientId, page, PAGE_SIZE)
      .then((data) => {
        if (cancelled) return;
        setLogs(data);
        setStatus({ state: "ready", message: "" });
      })
      .catch((err) => {
        if (cancelled) return;
        setLogs([]);
        setStatus({ state: "error", message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [patientId, page, reloadKey]);

  return (
    <div>
      <h1 style={styles.title}>Audit Log</h1>
      <p style={styles.subtitle}>Who viewed or changed patient records, and when. Visible to admins only.</p>

      <section style={styles.card}>
        <div style={styles.toolbar}>
          <select
            style={styles.input}
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All patients</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </select>
          <button type="button" style={styles.secondary} onClick={() => setReloadKey((k) => k + 1)}>
            Refresh
          </button>
        </div>

        {status.state === "error" && (
          <p style={styles.error} role="alert">
            {status.message}
          </p>
        )}
        {status.state === "loading" && <p style={styles.muted}>Loading…</p>}

        {status.state === "ready" && logs.length === 0 && (
          <p style={styles.muted}>No activity recorded yet.</p>
        )}

        {logs.length > 0 && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>When</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>IP address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={styles.td}>{log.username}</td>
                    <td style={styles.td}>{prettyAction(log.action)}</td>
                    <td style={styles.td}>{patientNames[log.patientId] || log.patientId || "—"}</td>
                    <td style={styles.td}>{log.ipAddress || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.pager}>
          <button
            type="button"
            style={styles.secondary}
            disabled={page === 0 || status.state === "loading"}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span style={styles.muted}>Page {page + 1}</span>
          <button
            type="button"
            style={styles.secondary}
            disabled={logs.length < PAGE_SIZE || status.state === "loading"}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

const styles = {
  title: { fontFamily: "var(--font-display)", fontSize: 32, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", margin: "6px 0 24px" },
  card: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-card)",
    padding: "24px 26px",
    marginBottom: 24,
  },
  toolbar: { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  input: {
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    fontSize: 14.5,
    minWidth: 240,
    fontFamily: "inherit",
  },
  secondary: {
    background: "transparent",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "9px 16px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "var(--text-muted)",
    fontWeight: 500,
    borderBottom: "1px solid var(--line)",
    whiteSpace: "nowrap",
  },
  td: { padding: "10px 12px", borderBottom: "1px solid var(--line)", verticalAlign: "top" },
  pager: { display: "flex", alignItems: "center", gap: 14, marginTop: 18 },
  muted: { color: "var(--text-muted)", fontSize: 14 },
  error: { color: "var(--red-600)", fontSize: 14 },
};