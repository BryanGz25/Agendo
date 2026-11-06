/**
 * Safe localStorage wrapper. Private windows or blocked storage must never
 * break the app, so every access is guarded and falls back to memory.
 */
const memory = new Map();

function getStore() {
  try {
    const probe = '__agendo_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readJSON(key, fallback) {
  try {
    const store = getStore();
    const raw = store ? store.getItem(key) : memory.get(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  const raw = JSON.stringify(value);
  try {
    const store = getStore();
    if (store) store.setItem(key, raw);
    else memory.set(key, raw);
  } catch {
    memory.set(key, raw);
  }
}

export function removeKey(key) {
  try {
    getStore()?.removeItem(key);
  } catch {
    /* ignore */
  }
  memory.delete(key);
}
