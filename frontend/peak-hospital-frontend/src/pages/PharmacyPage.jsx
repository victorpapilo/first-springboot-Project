import { useEffect, useState } from "react";
import { Field, inputStyle } from "../components/Field";
import { api } from "../api/client";
import { formatNaira } from "../utils/format";

const EMPTY = { name: "", quantityInStock: "", unitPrice: "", expiryDate: "" };

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api.getMedicines().then(setMedicines).catch(() => {});
  }, [refreshKey]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });
    try {
      const payload = { ...form, quantityInStock: Number(form.quantityInStock), unitPrice: Number(form.unitPrice) };
      if (!payload.expiryDate) delete payload.expiryDate;
      const medicine = await api.addMedicine(payload);
      setStatus({ state: "success", message: `Added ${medicine.name}.` });
      setForm(EMPTY);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  async function handleRestock(medicine) {
    const input = prompt(`How many units of ${medicine.name} to add to stock?`, "10");
    if (!input) return;
    const qty = Number(input);
    if (!qty || qty <= 0) return;
    await api.restockMedicine(medicine.id, qty);
    setRefreshKey((k) => k + 1);
  }

  async function handleDispense(medicine) {
    const input = prompt(`How many units of ${medicine.name} to dispense?`, "1");
    if (!input) return;
    const qty = Number(input);
    if (!qty || qty <= 0) return;
    try {
      await api.dispenseMedicine(medicine.id, qty);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this medicine from inventory?")) return;
    await api.deleteMedicine(id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Pharmacy</h1>
        <p style={styles.subtitle}>Track medicine stock, restock, and dispense to patients.</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Add a medicine</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <Field label="Name">
              <input style={inputStyle} required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Paracetamol 500mg" />
            </Field>
            <Field label="Quantity in stock">
              <input type="number" min="0" style={inputStyle} required value={form.quantityInStock} onChange={(e) => update("quantityInStock", e.target.value)} />
            </Field>
            <Field label="Unit price (₦)">
              <input type="number" min="0" step="0.01" style={inputStyle} required value={form.unitPrice} onChange={(e) => update("unitPrice", e.target.value)} />
            </Field>
            <Field label="Expiry date (optional)">
              <input type="date" style={inputStyle} value={form.expiryDate} onChange={(e) => update("expiryDate", e.target.value)} />
            </Field>
          </div>
          <div style={styles.actions}>
            <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
              {status.state === "loading" ? "Adding…" : "Add medicine"}
            </button>
            {status.state === "success" && <span style={styles.success}>{status.message}</span>}
            {status.state === "error" && <span style={styles.error}>{status.message}</span>}
          </div>
        </form>
      </section>

      <section style={{ ...styles.section, marginTop: 24 }}>
        <h2 style={styles.sectionTitle}>Inventory</h2>
        <div className="scroll-x">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>In stock</th>
                <th style={styles.th}>Unit price</th>
                <th style={styles.th}>Expiry</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 && (
                <tr><td style={styles.empty} colSpan={5}>No medicines added yet.</td></tr>
              )}
              {medicines.map((m) => (
                <tr key={m.id}>
                  <td style={styles.td}>{m.name}</td>
                  <td style={styles.td}>
                    <span style={m.quantityInStock <= 5 ? styles.lowStock : undefined}>{m.quantityInStock}</span>
                  </td>
                  <td style={styles.td}>{formatNaira(m.unitPrice)}</td>
                  <td style={styles.td}>{m.expiryDate || "—"}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={styles.smallBtn} onClick={() => handleRestock(m)}>Restock</button>
                      <button style={styles.smallBtn} onClick={() => handleDispense(m)}>Dispense</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(m.id)}>Remove</button>
                    </div>
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 },
  actions: { display: "flex", alignItems: "center", gap: 14 },
  submit: { background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 18px", fontWeight: 600, fontSize: 14.5 },
  success: { color: "var(--teal-600)", fontSize: 14 },
  error: { color: "var(--red-600)", fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14.5 },
  th: { textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-muted)", fontWeight: 500, fontSize: 13 },
  td: { padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-primary)" },
  empty: { padding: "20px 14px", color: "var(--text-muted)", textAlign: "center" },
  lowStock: { color: "var(--red-600)", fontWeight: 600 },
  smallBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: 13 },
  deleteBtn: { background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: 13, color: "var(--red-600)" },
};
