
import { useState } from "react";
import { api } from "../api/client";
import "./LoginPage.css";

export default function LoginPage({ onLogin, onShowSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({
    state: "idle",
    message: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    setStatus({ state: "loading", message: "" });

    try {
      const auth = await api.login(username, password);
      onLogin(auth);
    } catch (err) {
      setStatus({
        state: "error",
        message: err.message,
      });
    }
  }

  return (
    <div className="login">
      <aside className="login__visual" aria-hidden="true">
        <div className="login__brand">
          <div className="login__logo-wrap">
            <img
              src="/peak-hospital-logo.png"
              alt="Peak Hospital — Care, Trust, Compassion"
              className="login__logo"
            />
          </div>
        </div>

        <div className="login__message">
          <h2>Every ward, one shared record.</h2>

          <p>
            Patients, labs, pharmacy and billing stay in step,
            so the team on the next shift picks up exactly
            where you left off.
          </p>
        </div>
      </aside>

      <main className="login__panel">
        <form onSubmit={handleSubmit} className="login__form">
          <h1 className="login__title">Sign in</h1>

          <p className="login__subtitle">
            Use your hospital account to continue.
          </p>

          <label className="login__label">
            Username

            <input
              className="login__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </label>

          <label className="login__label">
            Password

            <input
              type="password"
              className="login__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            className="login__submit"
            disabled={status.state === "loading"}
          >
            {status.state === "loading"
              ? "Signing in…"
              : "Sign in"}
          </button>

          {status.state === "error" && (
            <p className="login__error" role="alert">
              {status.message}
            </p>
          )}

          {onShowSignup && (
            <p className="login__footnote">
              New here?{" "}
              <button
                type="button"
                className="login__link"
                onClick={onShowSignup}
              >
                Create an account
              </button>
            </p>
          )}

          <p className="login__footnote">
            Your access is protected by your assigned
            hospital role. Access to patient records is logged.
          </p>
        </form>
      </main>
    </div>
  );
}
