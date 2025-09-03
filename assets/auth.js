import { supabase, isSupabaseConfigured } from './supabase.js';

// Local fallback (when Supabase is not configured)
const AUTH_KEY = 'cc_auth_cuba';

function localIsAuthed() {
  try { return !!JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return false; }
}
function localLogin(email) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, token: 'local-demo', ts: Date.now() }));
}
function localLogout() {
  localStorage.removeItem(AUTH_KEY);
}
function localCurrentUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}

// Auth helpers (Supabase-first, fallback local)
export async function isAuthed() {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    return !!data?.session;
  }
  return localIsAuthed();
}

export function requireAuth() {
  // async but fire-and-forget is fine in module scripts
  (async () => {
    const ok = await isAuthed();
    if (!ok) location.replace('login.html');
  })();
}

export async function login(email, password) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }
  // Fallback local demo
  localLogin(email);
  return { error: null };
}

export async function register(email, password) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }
  // Fallback: just simulate
  return { data: { user: { email } }, error: null };
}

export async function logout() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    localLogout();
  }
  location.replace('login.html');
}

export async function currentUserEmail() {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    return data?.user?.email || null;
  }
  return localCurrentUser()?.email || null;
}
