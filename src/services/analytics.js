import { readJSON, writeJSON, removeKey } from './storage';
import { emitChange } from './events';

/**
 * Onboarding funnel events. Each step is recorded once per session id so the
 * owner panel can count how many people pass each screen. In production the
 * same calls would go to an analytics endpoint.
 */
const KEY = 'agendo.funnel.v1';
const SESSION_KEY = 'agendo.session.v1';

export const FUNNEL_STEPS = [
  { id: 'landing', label: 'Vio la promesa' },
  { id: 'business', label: 'Nombre y WhatsApp' },
  { id: 'services', label: 'Servicios' },
  { id: 'schedule', label: 'Horario' },
  { id: 'shared', label: 'Compartió el link' },
  { id: 'firstBooking', label: 'Primera reserva' },
];

function sessionId() {
  let id = readJSON(SESSION_KEY, null);
  if (!id) {
    id = crypto.randomUUID?.() ?? String(Date.now());
    writeJSON(SESSION_KEY, id);
  }
  return id;
}

export function newSession() {
  removeKey(SESSION_KEY);
  return sessionId();
}

export function track(step, meta = {}) {
  const events = readJSON(KEY, []);
  const session = sessionId();
  if (events.some((e) => e.session === session && e.step === step)) return;
  events.push({ session, step, at: new Date().toISOString(), ...meta });
  writeJSON(KEY, events);
  emitChange(KEY);
}

/** Unique sessions per step, in funnel order. */
export function funnelCounts() {
  const events = readJSON(KEY, []);
  return FUNNEL_STEPS.map((step) => ({
    ...step,
    count: new Set(events.filter((e) => e.step === step.id).map((e) => e.session)).size,
  }));
}

/** Seconds from landing to a step, averaged across sessions. */
export function averageSecondsTo(step) {
  const events = readJSON(KEY, []);
  const bySession = new Map();
  events.forEach((e) => {
    const entry = bySession.get(e.session) ?? {};
    entry[e.step] = new Date(e.at).getTime();
    bySession.set(e.session, entry);
  });
  const durations = [...bySession.values()]
    .filter((s) => s.landing && s[step])
    .map((s) => (s[step] - s.landing) / 1000);
  if (!durations.length) return null;
  return durations.reduce((a, b) => a + b, 0) / durations.length;
}

export function referralCount() {
  return readJSON(KEY, []).filter((e) => e.step === 'landing' && e.ref).length;
}

export function resetFunnel() {
  removeKey(KEY);
  removeKey(SESSION_KEY);
  emitChange(KEY);
}
