const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("peakhospital_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401 && !path.startsWith("/auth/")) {
    localStorage.removeItem("peakhospital_token");
    localStorage.removeItem("peakhospital_user");
    window.location.reload();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // response had no JSON body, keep the default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // --- Auth ---
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  register: (user) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(user) }),

  // --- Dashboard ---
  getStats: () => request("/dashboard/stats"),

  // --- Patients ---
  getPatients: (name) =>
    request(`/patients${name ? `?name=${encodeURIComponent(name)}` : ""}`),

  registerPatient: (patient) =>
    request("/patients", { method: "POST", body: JSON.stringify(patient) }),

  updatePatient: (id, patient) =>
    request(`/patients/${id}`, { method: "PUT", body: JSON.stringify(patient) }),

  deletePatient: (id) =>
    request(`/patients/${id}`, { method: "DELETE" }),

  // --- Visits ---
  getVisits: () => request("/visits"),

  recordVisit: (visit) =>
    request("/visits", { method: "POST", body: JSON.stringify(visit) }),

  // --- Doctors ---
  getDoctors: () => request("/doctors"),

  addDoctor: (doctor) =>
    request("/doctors", { method: "POST", body: JSON.stringify(doctor) }),

  deleteDoctor: (id) =>
    request(`/doctors/${id}`, { method: "DELETE" }),

  // --- Appointments ---
  getAppointments: () => request("/appointments"),

  scheduleAppointment: (appointment) =>
    request("/appointments", { method: "POST", body: JSON.stringify(appointment) }),

  updateAppointmentStatus: (id, status) =>
    request(`/appointments/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

  cancelAppointment: (id) =>
    request(`/appointments/${id}/cancel`, { method: "PUT" }),

  // --- Wards & Admissions ---
  getWards: () => request("/wards"),

  addWard: (ward) =>
    request("/wards", { method: "POST", body: JSON.stringify(ward) }),

  getWardOccupancy: (id) => request(`/wards/${id}/occupancy`),

  deleteWard: (id) => request(`/wards/${id}`, { method: "DELETE" }),

  getAdmissions: () => request("/admissions"),

  admitPatient: (admission) =>
    request("/admissions", { method: "POST", body: JSON.stringify(admission) }),

  dischargePatient: (id) =>
    request(`/admissions/${id}/discharge`, { method: "PUT" }),

  // --- Prescriptions ---
  getPrescriptions: () => request("/prescriptions"),

  createPrescription: (prescription) =>
    request("/prescriptions", { method: "POST", body: JSON.stringify(prescription) }),

  // --- Billing ---
  getInvoices: () => request("/invoices"),

  createInvoice: (invoice) =>
    request("/invoices", { method: "POST", body: JSON.stringify(invoice) }),

  recordPayment: (id, amount) =>
    request(`/invoices/${id}/pay`, { method: "PUT", body: JSON.stringify({ amount }) }),

  // --- Pharmacy ---
  getMedicines: () => request("/medicines"),

  addMedicine: (medicine) =>
    request("/medicines", { method: "POST", body: JSON.stringify(medicine) }),

  restockMedicine: (id, quantity) =>
    request(`/medicines/${id}/restock`, { method: "PUT", body: JSON.stringify({ quantity }) }),

  dispenseMedicine: (id, quantity) =>
    request(`/medicines/${id}/dispense`, { method: "PUT", body: JSON.stringify({ quantity }) }),

  deleteMedicine: (id) => request(`/medicines/${id}`, { method: "DELETE" }),

  // --- Lab tests ---
  getLabTests: () => request("/lab-tests"),

  orderLabTest: (test) =>
    request("/lab-tests", { method: "POST", body: JSON.stringify(test) }),

  completeLabTest: (id, result) =>
    request(`/lab-tests/${id}/complete`, { method: "PUT", body: JSON.stringify({ result }) }),
    // --- Clinical records ---
  getClinicalRecords: (patientId) =>
    request(`/clinical-records/patient/${encodeURIComponent(patientId)}`),

  createClinicalRecord: (record) =>
    request("/clinical-records", { method: "POST", body: JSON.stringify(record) }),

  // --- Audit log (admin only) ---
  getAuditLogs: (patientId, page = 0, size = 50) =>
    request(
      `/audit-logs?page=${page}&size=${size}${patientId ? `&patientId=${encodeURIComponent(patientId)}` : ""}`
    ),

  // --- Sign up (public) ---
  signupPatient: (data) =>
    request("/auth/signup/patient", { method: "POST", body: JSON.stringify(data) }),

  signupStaff: (data) =>
    request("/auth/signup/staff", { method: "POST", body: JSON.stringify(data) }),

  // --- Staff approvals (admin only) ---
  getStaffApplications: (status = "PENDING") =>
    request(`/staff-applications?status=${encodeURIComponent(status)}`),

  approveStaffApplication: (id, details = {}) =>
    request(`/staff-applications/${id}/approve`, { method: "POST", body: JSON.stringify(details) }),

  rejectStaffApplication: (id, note) =>
    request(`/staff-applications/${id}/reject`, { method: "POST", body: JSON.stringify({ note }) }),

  // --- My account ---
  getProfile: () => request("/me"),

  changePassword: (currentPassword, newPassword) =>
    request("/me/password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) }),

  completeAccount: (data) =>
    request("/me/complete-account", { method: "PUT", body: JSON.stringify(data) }),

  getMyAppointments: () => request("/me/appointments"),
  getMyLabTests: () => request("/me/lab-tests"),
  getMyInvoices: () => request("/me/invoices"),
  getMyPrescriptions: () => request("/me/prescriptions"),

  // --- Users & roles (admin only) ---
  getUsers: (scope = "staff") => request(`/users?scope=${encodeURIComponent(scope)}`),

  createUser: (user) =>
    request("/users", { method: "POST", body: JSON.stringify(user) }),

  changeUserRole: (id, role) =>
    request(`/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),

  setUserActive: (id, active) =>
    request(`/users/${id}/active`, { method: "PUT", body: JSON.stringify({ active }) }),

  resetUserPassword: (id) => request(`/users/${id}/reset-password`, { method: "POST" }),

  // --- Patient logins (admin or receptionist) ---
  createPortalAccount: (patientId) =>
    request("/portal-accounts", { method: "POST", body: JSON.stringify({ patientId }) }),

  // --- Emergency desk ---
  registerEmergency: (data) =>
    request("/emergency/register", { method: "POST", body: JSON.stringify(data) }),

  getEmergencyQueue: () => request("/emergency/queue"),
};
