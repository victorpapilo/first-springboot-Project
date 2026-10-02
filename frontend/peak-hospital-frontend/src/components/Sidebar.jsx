const NAV_ITEMS = [
  { id: "dashboard", label: "Overview" },
  { id: "patients", label: "Patients" },
  { id: "doctors", label: "Doctors" },
  { id: "appointments", label: "Appointments" },
  { id: "checkin", label: "Record check-in" },
  { id: "wards", label: "Wards & Admissions" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "billing", label: "Billing" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "labtests", label: "Lab Tests" },
];

export default function Sidebar({ active, onNavigate, user, onLogout }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandMark}>PH</span>
        <div>
          <div style={styles.brandName}>Peak Hospital</div>
          <div style={styles.brandSub}>Admin console</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              ...styles.navItem,
              ...(active === item.id ? styles.navItemActive : {}),
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div style={styles.footer}>
        {user && (
          <div style={styles.userBox}>
            <div style={styles.userName}>{user.fullName || user.username}</div>
            <div style={styles.userRole}>{user.role}</div>
            <button onClick={onLogout} style={styles.logoutBtn}>Sign out</button>
          </div>
        )}
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: "var(--ink-900)",
    color: "#eef5f4",
    display: "flex",
    flexDirection: "column",
    padding: "28px 20px",
    minHeight: "100vh",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: "var(--radius-sm)",
    background: "var(--teal-500)",
    color: "#0f2a2e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 14,
  },
  brandName: {
    fontFamily: "var(--font-display)",
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: 12.5,
    color: "#9fb8b4",
    marginTop: 2,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navItem: {
    textAlign: "left",
    background: "transparent",
    border: "none",
    color: "#cfe0dd",
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14.5,
    fontWeight: 500,
  },
  navItemActive: {
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
  },
  footer: {
    marginTop: "auto",
    fontSize: 12.5,
    color: "#7d9793",
    lineHeight: 1.5,
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  userBox: {
    paddingTop: 16,
  },
  userName: {
    color: "#eef5f4",
    fontWeight: 600,
    fontSize: 13.5,
  },
  userRole: {
    color: "#9fb8b4",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#eef5f4",
    borderRadius: "var(--radius-sm)",
    padding: "6px 12px",
    fontSize: 12.5,
  },
};
