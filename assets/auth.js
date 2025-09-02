// Simple localStorage-based session for demo
export const AUTH_KEY = 'cc_auth_cuba';
export function isAuthed() {
  try {
    return !!JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return false;
  }
}
export function requireAuth() {
  if(!isAuthed()) {
    location.replace('login.html');
  }
}
export function login(email, token) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, token, ts: Date.now() }));
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
  location.replace('login.html');
}
export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}