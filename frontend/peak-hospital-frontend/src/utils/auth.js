const USER_KEY = "peakhospital_user";

/** The signed-in person as saved by App.jsx at login (username, fullName, role, mustChangePassword). */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

/** True when the signed-in person has any of the given roles. */
export function hasRole(...roles) {
  const user = getUser();
  return !!user && roles.includes(user.role);
}
