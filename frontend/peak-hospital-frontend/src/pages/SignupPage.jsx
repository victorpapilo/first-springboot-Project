import { useState } from "react";
import { api } from "../api/client";
import { LICENSE_HINTS, ROLE_LABELS, STAFF_SIGNUP_ROLES } from "../utils/roles";
import "./LoginPage.css";

const EMPTY_PATIENT = { fullName: "", phoneNumber: "", email: "", dateOfBirth: "", gender: "", address: "", username: "", password: "", confirm: "" };
const EMPTY_STAFF = { role: "DOCTOR", fullName: "", phoneNumber: "", email: "", licenseNumber: "", licensingBody: "", specialization: "", username: "", password: "", confirm: "" };

export default function SignupPage({ onBack, onLogin }) {
  const [step, setStep] = useState("choose"); // choose | patient | staff | staff-done
  const [patient, setPatient] = useState(EMPTY_PATIENT);
  const [staff, setStaff] = useState(EMPTY_STAFF);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [doneMessage, setDoneMessage] = useState("");

  const setP = (f) => (e) => setPatient((v) => ({ ...v, [f]: e.target.value }));
  const setS = (f) => (e) => setStaff((v) => ({ ...v, [f]: e.target.value }));

  async function submitPatient(e) {
    e.preventDefault();
    if (patient.password !== patient.confirm) {
      setStatus({ state: "error", message: "The two passwords do not match." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      const { confirm: _confirm, ...body } = patient;
      const auth = await api.signupPatient({ ...body, dateOfBirth: body.dateOfBirth || null });
      onLogin(auth); // patients are active straight away
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  async function submitStaff(e) {
    e.preventDefault();
    if (staff.password !== staff.confirm) {
      setStatus({ state: "error", message: "The two passwords do not match." });
      return;
    }
    setStatus({ state: "loading", message: "" });
    try {
      const { confirm: _confirm, ...body } = staff;
      const res = await api.signupStaff(body);
      setDoneMessage(res.message);
      setStep("staff-done");
      setStatus({ state: "idle", message: "" });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  const hint = LICENSE_HINTS[staff.role];

  return (
    <div className="login">
      <aside className="login__visual" aria-hidden="true">
        <div className="login__brand">
          <span className="login__mark">PH</span>
          <span className="login__brandtext">
            Peak Hospital
            <small>Admin console</small>
          </span>
        </div>
        <div className="login__message">
          <h2>Join the care team.</h2>
          <p>Patients can sign up and use their account straight away. Staff accounts are checked and approved by an administrator first.</p>
        </div>
      </aside>

      <main className="login__panel">
        {step === "choose" && (
          <div className="login__form">
            <h1 className="login__title">Create an account</h1>
            <p className="login__subtitle">Who are you signing up as?</p>
            <button type="button" style={styles.choice} onClick={() => setStep("patient")}>
              <strong>I am a patient</strong>
              <span style={styles.choiceText}>View your appointments, lab results and bills. No approval needed.</span>
            </button>
            <button type="button" style={styles.choice} onClick={() => setStep("staff")}>
              <strong>I am hospital staff</strong>
              <span style={styles.choiceText}>Doctor, nurse, receptionist, pharmacist or laboratory staff. Needs your license and admin approval.</span>
            </button>
            <p className="login__footnote">
              Already have an account?{" "}
              <button type="button" className="login__link" onClick={onBack}>Sign in</button>
            </p>
          </div>
        )}

        {step === "patient" && (
          <form onSubmit={submitPatient} className="login__form">
            <h1 className="login__title">Patient sign-up</h1>
            <p className="login__subtitle">Your account is ready as soon as you submit.</p>

            <label className="login__label">Full name
              <input className="login__input" required value={patient.fullName} onChange={setP("fullName")} autoComplete="name" />
            </label>
            <label className="login__label">Phone number
              <input className="login__input" required value={patient.phoneNumber} onChange={setP("phoneNumber")} autoComplete="tel" />
            </label>
            <label className="login__label">Email (optional)
              <input className="login__input" type="email" value={patient.email} onChange={setP("email")} autoComplete="email" />
            </label>
            <div style={styles.row}>
              <label className="login__label">Date of birth (optional)
                <input className="login__input" type="date" value={patient.dateOfBirth} onChange={setP("dateOfBirth")} />
              </label>
              <label className="login__label">Gender (optional)
                <select className="login__input" value={patient.gender} onChange={setP("gender")}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <label className="login__label">Address (optional)
              <input className="login__input" value={patient.address} onChange={setP("address")} autoComplete="street-address" />
            </label>
            <label className="login__label">Choose a username
              <input className="login__input" required value={patient.username} onChange={setP("username")} autoComplete="username" />
            </label>
            <div style={styles.row}>
              <label className="login__label">Password (8+ characters)
                <input className="login__input" type="password" required minLength={8} value={patient.password} onChange={setP("password")} autoComplete="new-password" />
              </label>
              <label className="login__label">Confirm password
                <input className="login__input" type="password" required value={patient.confirm} onChange={setP("confirm")} autoComplete="new-password" />
              </label>
            </div>

            <button type="submit" className="login__submit" disabled={status.state === "loading"}>
              {status.state === "loading" ? "Creating account…" : "Create account"}
            </button>
            {status.state === "error" && <p className="login__error" role="alert">{status.message}</p>}
            <p className="login__footnote">
              <button type="button" className="login__link" onClick={() => { setStep("choose"); setStatus({ state: "idle", message: "" }); }}>Back</button>
            </p>
          </form>
        )}

        {step === "staff" && (
          <form onSubmit={submitStaff} className="login__form">
            <h1 className="login__title">Staff sign-up</h1>
            <p className="login__subtitle">An administrator will check your license before your account is activated.</p>

            <label className="login__label">Your role
              <select className="login__input" value={staff.role} onChange={setS("role")}>
                {STAFF_SIGNUP_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </label>
            <label className="login__label">Full name
              <input className="login__input" required value={staff.fullName} onChange={setS("fullName")} autoComplete="name" />
            </label>
            <div style={styles.row}>
              <label className="login__label">Phone number
                <input className="login__input" required value={staff.phoneNumber} onChange={setS("phoneNumber")} autoComplete="tel" />
              </label>
              <label className="login__label">Email
                <input className="login__input" type="email" value={staff.email} onChange={setS("email")} autoComplete="email" />
              </label>
            </div>
            <div style={styles.row}>
              <label className="login__label">{hint.label}
                <input className="login__input" required value={staff.licenseNumber} onChange={setS("licenseNumber")} />
              </label>
              <label className="login__label">Issued by
                <input className="login__input" value={staff.licensingBody} onChange={setS("licensingBody")} placeholder={hint.body} />
              </label>
            </div>
            {staff.role === "DOCTOR" && (
              <label className="login__label">Specialization
                <input className="login__input" required value={staff.specialization} onChange={setS("specialization")} placeholder="e.g. Pediatrics" />
              </label>
            )}
            <label className="login__label">Choose a username
              <input className="login__input" required value={staff.username} onChange={setS("username")} autoComplete="username" />
            </label>
            <div style={styles.row}>
              <label className="login__label">Password (8+ characters)
                <input className="login__input" type="password" required minLength={8} value={staff.password} onChange={setS("password")} autoComplete="new-password" />
              </label>
              <label className="login__label">Confirm password
                <input className="login__input" type="password" required value={staff.confirm} onChange={setS("confirm")} autoComplete="new-password" />
              </label>
            </div>

            <button type="submit" className="login__submit" disabled={status.state === "loading"}>
              {status.state === "loading" ? "Submitting…" : "Submit for approval"}
            </button>
            {status.state === "error" && <p className="login__error" role="alert">{status.message}</p>}
            <p className="login__footnote">
              <button type="button" className="login__link" onClick={() => { setStep("choose"); setStatus({ state: "idle", message: "" }); }}>Back</button>
            </p>
          </form>
        )}

        {step === "staff-done" && (
          <div className="login__form">
            <h1 className="login__title">Application received</h1>
            <p className="login__subtitle">{doneMessage}</p>
            <button type="button" className="login__submit" onClick={onBack}>Back to sign in</button>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  choice: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    textAlign: "left",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    padding: "16px 18px",
    fontSize: 15.5,
    color: "var(--ink-900)",
  },
  choiceText: { color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.45 },
  row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 },
};
