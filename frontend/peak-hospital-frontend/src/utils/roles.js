export const ROLE_LABELS = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
  NURSE: "Nurse",
  PHARMACIST: "Pharmacist",
  LAB_TECHNICIAN: "Laboratory staff",
  PATIENT: "Patient",
};

/** Shown to the admin when creating an account, so the choice of role is clear. */
export const ROLE_DESCRIPTIONS = {
  ADMIN: "Full access, including accounts, staff approvals and the audit log.",
  DOCTOR: "Sees patients, writes clinical notes, orders lab tests and prescribes. Sees their own schedule.",
  RECEPTIONIST: "Registers patients (including emergencies), books appointments, records check-ins and handles billing.",
  NURSE: "Views patients, records clinical notes and vitals, manages wards, orders lab tests.",
  PHARMACIST: "Manages medicine stock and dispensing.",
  LAB_TECHNICIAN: "Sees ordered lab tests and enters results.",
  PATIENT: "Sees only their own appointments, lab results, prescriptions and bills.",
};

/** Roles a person may ask for when they sign up themselves. They stay locked until an admin approves. */
export const STAFF_SIGNUP_ROLES = ["DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST", "LAB_TECHNICIAN"];

/** Wording for the license field on the staff sign-up form. */
export const LICENSE_HINTS = {
  DOCTOR: { label: "Medical license number", body: "Issuing council, e.g. MDCN" },
  NURSE: { label: "Nursing license number", body: "Issuing council, e.g. NMCN" },
  PHARMACIST: { label: "Pharmacist license number", body: "Issuing council, e.g. PCN" },
  LAB_TECHNICIAN: { label: "Laboratory practice license number", body: "Issuing council, e.g. MLSCN" },
  RECEPTIONIST: { label: "Staff ID or employment reference", body: "Department or employer" },
};

const ALL_STAFF = ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"];

/** Which sidebar items each role sees. The server enforces the same rules; this only hides what would be refused. */
export const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", roles: ["ADMIN", "RECEPTIONIST"] },
  { id: "emergency", label: "Emergency", roles: ALL_STAFF },
  { id: "myschedule", label: "My schedule", roles: ["DOCTOR"] },
  { id: "portal", label: "My health", roles: ["PATIENT"] },
  { id: "patients", label: "Patients", roles: ALL_STAFF },
  { id: "doctors", label: "Doctors", roles: ["ADMIN", "RECEPTIONIST"] },
  { id: "appointments", label: "Appointments", roles: ["ADMIN", "RECEPTIONIST", "NURSE"] },
  { id: "checkin", label: "Record check-in", roles: ["ADMIN", "RECEPTIONIST"] },
  { id: "clinical", label: "Clinical Records", roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { id: "labtests", label: "Lab Tests", roles: ["ADMIN", "DOCTOR", "NURSE", "LAB_TECHNICIAN"] },
  { id: "prescriptions", label: "Prescriptions", roles: ["ADMIN", "DOCTOR"] },
  { id: "wards", label: "Wards & Admissions", roles: ALL_STAFF },
  { id: "billing", label: "Billing", roles: ["ADMIN", "RECEPTIONIST"] },
  { id: "pharmacy", label: "Pharmacy", roles: ["ADMIN", "PHARMACIST"] },
  { id: "approvals", label: "Staff approvals", roles: ["ADMIN"] },
  { id: "users", label: "Users & Roles", roles: ["ADMIN"] },
  { id: "audit", label: "Audit Log", roles: ["ADMIN"] },
];

export function pagesFor(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => item.id);
}

/** The page each role lands on after signing in. */
export function defaultPageFor(role) {
  switch (role) {
    case "DOCTOR":
      return "myschedule";
    case "PATIENT":
      return "portal";
    case "LAB_TECHNICIAN":
      return "labtests";
    case "PHARMACIST":
      return "pharmacy";
    case "NURSE":
      return "patients";
    default:
      return "dashboard";
  }
}
