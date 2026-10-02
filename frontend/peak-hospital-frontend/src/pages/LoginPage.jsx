import { useState } from "react";
import { api } from "../api/client";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });
    try {
      const auth = await api.login(username, password);
      onLogin(auth);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  return (
    <div style={styles.shell}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.brandMark}>PH</div>
        <h1 style={styles.title}>Peak Hospital</h1>
        <p style={styles.subtitle}>Sign in to the admin console.</p>

        <label style={styles.label}>
          Username
          <input
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" style={styles.submit} disabled={status.state === "loading"}>
          {status.state === "loading" ? "Signing in…" : "Sign in"}
        </button>

        {status.state === "error" && <p style={styles.error}>{status.message}</p>}

        <p style={styles.hint}>
          First time running this? Use <strong>admin</strong> / <strong>admin123</strong> — the
          backend seeds this account automatically. Change the password afterward.
        </p>
      </form>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--paper)",
    padding: 20,
  },
  card: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-card)",
    padding: "36px 32px",
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: "var(--radius-sm)",
    background: "var(--teal-500)",
    color: "#0f2a2e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 4,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    margin: 0,
    color: "var(--ink-900)",
  },
  subtitle: {
    color: "var(--text-muted)",
    fontSize: 14.5,
    margin: "0 0 10px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-muted)",
  },
  input: {
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    fontSize: 14.5,
  },
  submit: {
    background: "var(--teal-600)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "11px 18px",
    fontWeight: 600,
    fontSize: 14.5,
    marginTop: 6,
  },
  error: {
    color: "var(--red-600)",
    fontSize: 13.5,
    margin: 0,
  },
  hint: {
    fontSize: 12.5,
    color: "var(--text-muted)",
    lineHeight: 1.5,
    marginTop: 4,
  },
};
