import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
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

export default function App() {
  const [user, setUser] = useState(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("peakhospital_token");
    const storedUser = localStorage.getItem("peakhospital_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // corrupted storage, ignore
      }
    }
    setCheckedStorage(true);
  }, []);

  function handleLogin(auth) {
    localStorage.setItem("peakhospital_token", auth.token);
    const userInfo = { username: auth.username, fullName: auth.fullName, role: auth.role };
    localStorage.setItem("peakhospital_user", JSON.stringify(userInfo));
    setUser(userInfo);
  }

  function handleLogout() {
    localStorage.removeItem("peakhospital_token");
    localStorage.removeItem("peakhospital_user");
    setUser(null);
    setPage("dashboard");
  }

  function bumpRefresh() {
    setRefreshKey((k) => k + 1);
  }

  if (!checkedStorage) return null;

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div style={styles.shell}>
      <Sidebar active={page} onNavigate={setPage} user={user} onLogout={handleLogout} />
      <main style={styles.main}>
        {page === "dashboard" && <DashboardPage refreshKey={refreshKey} />}
        {page === "patients" && <PatientsPage onDataChanged={bumpRefresh} />}
        {page === "doctors" && <DoctorsPage />}
        {page === "appointments" && <AppointmentsPage />}
        {page === "checkin" && <CheckinPage onDataChanged={bumpRefresh} />}
        {page === "wards" && <WardsPage />}
        {page === "prescriptions" && <PrescriptionsPage />}
        {page === "billing" && <BillingPage />}
        {page === "pharmacy" && <PharmacyPage />}
        {page === "labtests" && <LabTestsPage />}
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
