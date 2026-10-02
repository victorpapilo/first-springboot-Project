import { useEffect, useState } from "react";
import { Field, inputStyle } from "../components/Field";
import { api } from "../api/client";
import { formatNaira } from "../utils/format";

const EMPTY_ITEM = { description: "", amount: "" };

export default function BillingPage() {
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [patientId, setPatientId] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api.getPatients().then(setPatients).catch(() => {});
    api.getInvoices().then(setInvoices).catch(() => {});
  }, [refreshKey]);

  function updateItem(index, field, value) {
    setItems((list) => list.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItemRow() {
    setItems((list) => [...list, { ...EMPTY_ITEM }]);
  }

  function removeItemRow(index) {
    setItems((list) => list.filter((_, i) => i !== index));
  }

  const runningTotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId) {
      setStatus({ state: "error", message: "Select a patient first." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      const invoice = await api.createInvoice({
        patientId,
        items: items
          .filter((it) => it.description.trim() !== "")
          .map((it) => ({ description: it.description, amount: Number(it.amount) || 0 })),
      });
      setStatus({ state: "success", message: `Invoice created for ${invoice.patientName}: ${formatNaira(invoice.totalAmount)}.` });
      setItems([{ ...EMPTY_ITEM }]);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  async function handlePay(invoice) {
    const remaining = invoice.totalAmount - invoice.amountPaid;
    const input = prompt(`Amount to pay for ${invoice.patientName} (remaining ${formatNaira(remaining)}):`, remaining);
    if (!input) return;
    const amount = Number(input);
    if (!amount || amount <= 0) return;
    await api.recordPayment(invoice.id, amount);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Billing</h1>
        <p style={styles.subtitle}>Create invoices and record payments.</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>New invoice</h2>
        {patients.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14.5 }}>Register a patient first.</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <Field label="Patient">
              <select style={{ ...inputStyle, maxWidth: 320 }} required value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                <option value="">Select a patient…</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </Field>

            <div>
              <span style={styles.label}>Line items</span>
              {items.map((it, i) => (
                <div key={i} style={styles.itemRow}>
                  <input style={inputStyle} placeholder="Description (e.g. Consultation fee)" value={it.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)} />
                  <input type="number" min="0" style={inputStyle} placeholder="Amount (₦)" value={it.amount}
                    onChange={(e) => updateItem(i, "amount", e.target.value)} />
                  {items.length > 1 && (
                    <button type="button" style={styles.removeBtn} onClick={() => removeItemRow(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" style={styles.addRowBtn} onClick={addItemRow}>+ Add line item</button>
            </div>

            <div style={styles.totalLine}>
              Total: <strong>{formatNaira(runningTotal)}</strong>
            </div>

            <div style={styles.actions}>
              <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
                {status.state === "loading" ? "Creating…" : "Create invoice"}
              </button>
              {status.state === "success" && <span style={styles.success}>{status.message}</span>}
              {status.state === "error" && <span style={styles.error}>{status.message}</span>}
            </div>
          </form>
        )}
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>All invoices</h2>
        <div className="scroll-x">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Paid</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr><td style={styles.empty} colSpan={5}>No invoices yet.</td></tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={styles.td}>{inv.patientName}</td>
                  <td style={styles.td}>{formatNaira(inv.totalAmount)}</td>
                  <td style={styles.td}>{formatNaira(inv.amountPaid)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(inv.status === "PAID" ? styles.badgeTeal : inv.status === "PARTIAL" ? styles.badgeAmber : styles.badgeMuted),
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {inv.status !== "PAID" && (
                      <button style={styles.payBtn} onClick={() => handlePay(inv)}>Record payment</button>
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
  label: { fontSize: 13, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 },
  itemRow: { display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" },
  addRowBtn: { background: "transparent", border: "1px dashed var(--line)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 13.5, color: "var(--teal-600)", marginTop: 4 },
  removeBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", color: "var(--red-600)", padding: "8px 10px" },
  totalLine: { fontSize: 15, color: "var(--ink-900)" },
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
  badgeAmber: { background: "var(--amber-100)", color: "var(--amber-600)" },
  badgeMuted: { background: "#eef1f0", color: "var(--text-muted)" },
  payBtn: { background: "transparent", border: "1px solid var(--teal-500)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: 13, color: "var(--teal-600)" },
};
