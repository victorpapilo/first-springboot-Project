
import { NAV_ITEMS, ROLE_LABELS } from "../utils/roles";

export default function Sidebar({
  active,
  onNavigate,
  user,
  onLogout,
  badges = {},
}) {
  const items = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.logoWrap}>
          <img
            src="/peak-hospital-logo.png"
            alt="Peak Hospital"
            style={styles.logo}
          />
        </div>
      </div>

      <nav style={styles.nav}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              ...styles.navItem,
              ...(active === item.id
                ? styles.navItemActive
                : {}),
            }}
          >
            <span>{item.label}</span>

            {badges[item.id] > 0 && (
              <span style={styles.badge}>
                {badges[item.id]}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div style={styles.footer}>
        {user && (
          <div style={styles.userBox}>
            <div style={styles.userName}>
              {user.fullName || user.username}
            </div>

            <div style={styles.userRole}>
              {ROLE_LABELS[user.role] || user.role}
            </div>

            <div style={styles.footerButtons}>
              <button
                onClick={() => onNavigate("account")}
                style={styles.footerBtn}
              >
                Account
              </button>

              <button
                onClick={onLogout}
                style={styles.footerBtn}
              >
                Sign out
              </button>
            </div>
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
    padding: "24px 20px",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },

  logoWrap: {
    width: "100%",
    maxWidth: 190,
    height: 105,
    background: "#f8f7f1",
    borderRadius: 12,
    padding: 6,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "left",
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#cfe0dd",
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14.5,
    fontWeight: 500,
    cursor: "pointer",
  },

  navItemActive: {
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
  },

  badge: {
    minWidth: 20,
    padding: "1px 7px",
    borderRadius: 999,
    background: "#d9822b",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    textAlign: "center",
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

  footerButtons: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  footerBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#eef5f4",
    borderRadius: "var(--radius-sm)",
    padding: "6px 12px",
    fontSize: 12.5,
    cursor: "pointer",
  },
};
