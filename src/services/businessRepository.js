import { readJSON, writeJSON, removeKey } from './storage';
import { emitChange } from './events';
import { createSlug } from '../shared/utils/slug';

/**
 * Persistence for businesses and bookings. Today it uses the browser's
 * storage so the app runs without a backend; the function signatures are the
 * contract a real API (REST or an n8n webhook) would implement.
 */
export const KEYS = {
  businesses: 'agendo.businesses.v1',
  bookings: 'agendo.bookings.v1',
  currentBusiness: 'agendo.currentBusiness.v1',
};

export const BOOKING_STATUS = {
  confirmed: 'Confirmada',
  done: 'Atendida',
  noshow: 'No llegó',
  cancelled: 'Cancelada',
};

function allBusinesses() {
  return readJSON(KEYS.businesses, {});
}

function allBookings() {
  return readJSON(KEYS.bookings, []);
}

function saveBookings(bookings) {
  writeJSON(KEYS.bookings, bookings);
  emitChange(KEYS.bookings);
}

/* ── Businesses ─────────────────────────────────────────────── */

export function getBusiness(slug) {
  return allBusinesses()[slug] ?? null;
}

export function listBusinesses() {
  return Object.values(allBusinesses()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCurrentBusiness() {
  const slug = readJSON(KEYS.currentBusiness, null);
  return slug ? getBusiness(slug) : null;
}

export function setCurrentBusiness(slug) {
  writeJSON(KEYS.currentBusiness, slug);
  emitChange(KEYS.currentBusiness);
}

export function signOutBusiness() {
  removeKey(KEYS.currentBusiness);
  emitChange(KEYS.currentBusiness);
}

/**
 * @param {{name:string, whatsapp:string, services:object[], schedule:object[], referredBy?:string|null}} data
 */
export function createBusiness(data) {
  const businesses = allBusinesses();
  let slug = createSlug(data.name);
  while (businesses[slug]) slug = createSlug(data.name);
  const business = {
    status: 'trial',
    plan: 'monthly',
    source: data.referredBy ? 'badge' : 'ads',
    billing: null,
    ...data,
    slug,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
  businesses[slug] = business;
  writeJSON(KEYS.businesses, businesses);
  if (!data.simulated) writeJSON(KEYS.currentBusiness, slug);
  emitChange(KEYS.businesses);
  return business;
}

export function updateBusiness(slug, patch) {
  const businesses = allBusinesses();
  if (!businesses[slug]) throw new Error('La barbería no existe');
  businesses[slug] = { ...businesses[slug], ...patch, slug };
  writeJSON(KEYS.businesses, businesses);
  emitChange(KEYS.businesses);
  return businesses[slug];
}

/* ── Bookings ───────────────────────────────────────────────── */

export function getBookings(slug) {
  return allBookings()
    .filter((b) => b.slug === slug)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function listAllBookings() {
  return allBookings().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBookingsByPhone(phone) {
  return allBookings()
    .filter((b) => b.clientPhone === phone)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/**
 * @param {{slug:string, serviceId:string, startsAt:string, clientName:string, clientPhone:string, simulated?:boolean}} data
 */
export function createBooking(data) {
  const bookings = allBookings();
  const taken = bookings.some(
    (b) => b.slug === data.slug && b.startsAt === data.startsAt && b.status !== 'cancelled',
  );
  if (taken) throw new Error('Ese horario ya se reservó. Elige otro.');
  const booking = {
    status: 'confirmed',
    ...data,
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

export function updateBooking(id, patch) {
  const bookings = allBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) throw new Error('La cita no existe');
  bookings[index] = { ...bookings[index], ...patch, id };
  saveBookings(bookings);
  return bookings[index];
}

/** Bulk insert used by the demo data loader. */
export function importData({ businesses, bookings }) {
  const current = allBusinesses();
  businesses.forEach((b) => {
    current[b.slug] = b;
  });
  writeJSON(KEYS.businesses, current);
  saveBookings([...allBookings(), ...bookings]);
  emitChange(KEYS.businesses);
}

export function removeSimulatedData() {
  const kept = Object.fromEntries(Object.entries(allBusinesses()).filter(([, b]) => !b.simulated));
  writeJSON(KEYS.businesses, kept);
  saveBookings(allBookings().filter((b) => !b.seeded));
  emitChange(KEYS.businesses);
}

export function resetAll() {
  Object.values(KEYS).forEach(removeKey);
  emitChange(KEYS.businesses);
}
