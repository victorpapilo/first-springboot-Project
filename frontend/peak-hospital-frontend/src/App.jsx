import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CompleteAccountPage from "./pages/CompleteAccountPage";
import AccountPage from "./pages/AccountPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import CheckinPage from "./pages/CheckinPage";
import WardsPage from "./pages/WardsPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import BillingPage from "./pages/BillingPage";
import PharmacyPage from "./pages/PharmacyPage";
import LabTestsPage from "./pages/LabTestsPage";
import ClinicalRecordsPage from "./pages/ClinicalRecordsPage";
import AuditLogPage from "./pages/AuditLogPage";
import UsersPage from "./pages/UsersPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import EmergencyPage from "./pages/EmergencyPage";
import MySchedulePage from "./pages/MySchedulePage";
import MyPortalPage from "./pages/MyPortalPage";
import { api } from "./api/client";
import { defaultPageFor, pagesFor } from "./utils/roles";

const TOKEN_KEY = "peakhospital_token";
const USER_KEY = "peakhospital_user";

function toUserInfo(auth) {
  return {
    username: auth.username,
    fullName: auth.fullName,
    role: auth.role,
    mustChangePassword: !!auth.mustChangePassword,
  };
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [authView, setAuthView] = useState("login"); // login | signup
  const [page, setPage] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setPage(defaultPageFor(parsed.role));
      } catch {
        // corrupted storage, ignore
      }
    }
    setCheckedStorage(true);
  }, []);

  // Admins see a count of staff waiting for approval next to "Staff approvals".
  useEffect(() => {
    if (user?.role !== "ADMIN" || user.mustChangePassword) return;
    api
      .getStaffApplications("PENDING")
      .then((list) => setPendingApprovals(list.length))
      .catch(() => {});
  }, [user, page]);

  function handleLogin(auth) {
    localStorage.setItem(TOKEN_KEY, auth.token);
    const info = toUserInfo(auth);
    localStorage.setItem(USER_KEY, JSON.stringify(info));
    setUser(info);
    setPage(defaultPageFor(auth.role));
    setAuthView("login");
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setAuthView("login");
    setPage("dashboard");
  }

  // Called after someone replaces a temporary password with their own.
  // Patients get a fresh sign-in back (their username may have changed); staff just clear the flag.
  function handleAccountCompleted(auth) {
    if (auth) {
      handleLogin(auth);
      return;
    }
    const updated = { ...user, mustChangePassword: false };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  function bumpRefresh() {
    setRefreshKey((k) => k + 1);
  }

  if (!checkedStorage) return null;

  if (!user) {
    return authView === "signup" ? (
      <SignupPage onBack={() => setAuthView("login")} onLogin={handleLogin} />
    ) : (
      <LoginPage onLogin={handleLogin} onShowSignup={() => setAuthView("signup")} />
    );
  }

  if (user.mustChangePassword) {
    return <CompleteAccountPage user={user} onDone={handleAccountCompleted} onLogout={handleLogout} />;
  }

  // Only pages this role may use. Anything else falls back to the role's home page.
  const allowed = pagesFor(user.role);
  const current = page === "account" || allowed.includes(page) ? page : defaultPageFor(user.role);

  return (
    <div style={styles.shell}>
      <Sidebar
        active={current}
        onNavigate={setPage}
        user={user}
        onLogout={handleLogout}
        badges={{ approvals: pendingApprovals }}
      />
      <main style={styles.main}>
        {current === "dashboard" && <DashboardPage refreshKey={refreshKey} />}
        {current === "emergency" && <EmergencyPage />}
        {current === "myschedule" && <MySchedulePage />}
        {current === "portal" && <MyPortalPage />}
        {current === "patients" && <PatientsPage onDataChanged={bumpRefresh} />}
        {current === "doctors" && <DoctorsPage />}
        {current === "appointments" && <AppointmentsPage />}
        {current === "checkin" && <CheckinPage onDataChanged={bumpRefresh} />}
        {current === "clinical" && <ClinicalRecordsPage />}
        {current === "labtests" && <LabTestsPage />}
        {current === "prescriptions" && <PrescriptionsPage />}
        {current === "wards" && <WardsPage />}
        {current === "billing" && <BillingPage />}
        {current === "pharmacy" && <PharmacyPage />}
        {current === "approvals" && <ApprovalsPage />}
        {current === "users" && <UsersPage />}
        {current === "audit" && <AuditLogPage />}
        {current === "account" && <AccountPage />}
      </main>
    </div>
  );
}

const styles = {
  shell: {
    display: "flex",
    minHeight: "100vh",
  },
  main: {
    flex: 1,
    padding: "36px 40px",
    maxWidth: 1100,
  },
};
