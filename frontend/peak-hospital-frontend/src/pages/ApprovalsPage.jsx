import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { ROLE_LABELS } from "../utils/roles";

const STATUS_LABEL = { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" };

export default function ApprovalsPage() {
  const [filter, setFilter] = useState("PENDING");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  // Per-application doctor options: { [id]: { visiting, visitingDays } }
  const [doctorOptions, setDoctorOptions] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.getStaffApplications(filter));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setOption = (id, patch) =>
    setDoctorOptions((o) => ({ ...o, [id]: { visiting: false, visitingDays: "", ...o[id], ...patch } }));

  async function handleApprove(a) {
    const who = `${a.fullName} as ${ROLE_LABELS[a.role] || a.role}`;
    if (!confirm(`Approve ${who}?\n\nCheck the license number with the issuing council first. Once approved they can sign in straight away.`)) return;
    const opts = doctorOptions[a.id] || {};
    try {
      await api.approveStaffApplication(a.id, { visiting: !!opts.visiting, visitingDays: opts.visitingDays || null });
      setMessage({ type: "success", text: `${a.fullName} approved. They can now sign in.` });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleReject(a) {
    const note = prompt(`Reject ${a.fullName}? Add a reason for your records (optional):`, "");
    if (note === null) return;
    try {
      await api.rejectStaffApplication(a.id, note);
      setMessage({ type: "success", text: `${a.fullName}'s application was rejected.` });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Staff approvals</h1>
        <p style={styles.subtitle}>
          Staff who sign up cannot sign in until you approve them. Verify each license with the issuing council before approving.
        </p>
      </header>

      <div style={styles.toolbar}>
        <select style={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All</option>
        </select>
        <button type="button" style={styles.smallBtn} onClick={load}>Refresh</button>
      </div>

      {message.text && (
        <p style={message.type === "error" ? styles.error : styles.success} role="alert">{message.text}</p>
      )}

      {loading && <p style={styles.muted}>Loading…</p>}
      {!loading && items.length === 0 && (
        <section style={styles.card}><p style={styles.muted}>Nothing here{filter === "PENDING" ? " — no one is waiting for approval." : "."}</p></section>
      )}

      {items.map((a) => {
        const opts = doctorOptions[a.id] || { visiting: false, visitingDays: "" };
        return (
          <section key={a.id} style={styles.card}>
            <div style={styles.cardHead}>
              <div>
                <h2 style={styles.name}>{a.fullName}</h2>
                <span style={styles.role}>{ROLE_LABELS[a.role] || a.role}</span>
              </div>
              <span style={{ ...styles.badge, ...(a.status === "APPROVED" ? styles.badgeTeal : a.status === "REJECTED" ? styles.badgeRed : styles.badgeAmber) }}>
                {STATUS_LABEL[a.status] || a.status}
              </span>
            </div>

            <dl style={styles.details}>
              <dt style={styles.term}>License / staff ID</dt>
              <dd style={{ ...styles.def, ...styles.mono }}>{a.licenseNumber}</dd>
              <dt style={styles.term}>Issued by</dt>
              <dd style={styles.def}>{a.licensingBody || "—"}</dd>
              {a.specialization && (<><dt style={styles.term}>Specialization</dt><dd style={styles.def}>{a.specialization}</dd></>)}
              <dt style={styles.term}>Phone</dt>
              <dd style={styles.def}>{a.phoneNumber}</dd>
              <dt style={styles.term}>Email</dt>
              <dd style={styles.def}>{a.email || "—"}</dd>
              <dt style={styles.term}>Username</dt>
              <dd style={{ ...styles.def, ...styles.mono }}>{a.username}</dd>
              <dt style={styles.term}>Applied</dt>
              <dd style={styles.def}>{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "—"}</dd>
              {a.reviewedBy && (<><dt style={styles.term}>Reviewed by</dt><dd style={styles.def}>{a.reviewedBy} on {a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString() : ""}</dd></>)}
              {a.reviewNote && (<><dt style={styles.term}>Note</dt><dd style={styles.def}>{a.reviewNote}</dd></>)}
            </dl>

            {a.status === "PENDING" && (
              <>
                {a.role === "DOCTOR" && (
                  <div style={styles.doctorOpts}>
                    <label style={styles.check}>
                      <input type="checkbox" checked={!!opts.visiting} onChange={(e) => setOption(a.id, { visiting: e.target.checked })} />
                      Visiting doctor (comes in on set days)
                    </label>
                    {opts.visiting && (
                      <input style={styles.days} placeholder="Days, e.g. Mon, Wed" value={opts.visitingDays} onChange={(e) => setOption(a.id, { visitingDays: e.target.value })} />
                    )}
                  </div>
                )}
                <div style={styles.actions}>
                  <button type="button" style={styles.approve} onClick={() => handleApprove(a)}>Approve</button>
                  <button type="button" style={styles.reject} onClick={() => handleReject(a)}>Reject</button>
                </div>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

const styles = {
  header: { marginBottom: 20 },
  title: { fontFamily: "var(--font-display)", fontSize: 30, margin: 0, color: "var(--ink-900)" },
  subtitle: { color: "var(--text-muted)", marginTop: 6, fontSize: 15, maxWidth: 640 },
  toolbar: { display: "flex", gap: 10, marginBottom: 16 },
  select: { border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "9px 12px", fontSize: 14.5, background: "var(--paper-raised)" },
  smallBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "7px 12px", fontSize: 13.5 },
  card: { background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 22, marginBottom: 16 },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  name: { fontFamily: "var(--font-display)", fontSize: 20, margin: 0, color: "var(--ink-900)" },
  role: { color: "var(--text-muted)", fontSize: 14 },
  details: { display: "grid", gridTemplateColumns: "max-content 1fr", gap: "6px 20px", margin: 0, fontSize: 14.5 },
  term: { color: "var(--text-muted)", fontSize: 13 },
  def: { margin: 0, color: "var(--text-primary)" },
  mono: { fontFamily: "ui-monospace, Menlo, Consolas, monospace" },
  doctorOpts: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 16 },
  check: { display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  days: { border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "7px 10px", fontSize: 14 },
  actions: { display: "flex", gap: 10, marginTop: 18 },
  approve: { background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "9px 18px", fontWeight: 600, fontSize: 14.5 },
  reject: { background: "transparent", color: "var(--red-600)", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "9px 18px", fontSize: 14.5 },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 500 },
  badgeTeal: { background: "var(--teal-100)", color: "var(--teal-600)" },
  badgeAmber: { background: "var(--amber-100)", color: "var(--amber-600)" },
  badgeRed: { background: "var(--red-100)", color: "var(--red-600)" },
  muted: { color: "var(--text-muted)", fontSize: 14.5, margin: 0 },
  error: { color: "var(--red-600)", fontSize: 14 },
  success: { color: "var(--teal-600)", fontSize: 14 },
};
