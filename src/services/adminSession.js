/**
 * Demo access for Valeria's admin panel. This is NOT security: the PIN ships
 * with the front end. It only keeps casual visitors out of the demo. A real
 * deployment must authenticate on a server (for example Supabase Auth) and
 * check the admin role there.
 */
const KEY = 'agendo.admin.v1';
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'agendo';

export function isAdmin() {
  try {
    return window.sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function signInAdmin(pin) {
  if (pin.trim() !== ADMIN_PIN) return false;
  try {
    window.sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage blocked: the session lasts until reload */
  }
  return true;
}

export function signOutAdmin() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
