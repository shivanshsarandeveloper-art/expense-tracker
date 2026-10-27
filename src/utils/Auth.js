
const USERS_KEY = "expense_tracker_users";
const SESSION_KEY = "expense_tracker_session";

export function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const result = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(result))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function registerUser(name, email, password) {
  const users = getUsers();
  email = email.trim().toLowerCase();

  if (users.some((user) => user.email === email)) {
    throw new Error("Email already registered!");
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email,
    passwordHash: await hashPassword(password),
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
}

export async function loginUser(email, password) {
  email = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const user = getUsers().find(
    (item) => item.email === email && item.passwordHash === passwordHash
  );

  if (!user) throw new Error("Invalid email or password!");

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ id: user.id, name: user.name, email: user.email })
  );
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}
