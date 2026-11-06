import { readJSON, writeJSON, removeKey } from './storage';
import { emitChange } from './events';
import { createSlug } from '../shared/utils/slug';

/**
 * Persistence for businesses and bookings. Today it uses the browser's
 * storage so the prototype runs without a backend; the function signatures
 * are the contract a real API (REST or n8n webhook) would implement.
 */
export const KEYS = {
  businesses: 'agendo.businesses.v1',
  bookings: 'agendo.bookings.v1',
  currentBusiness: 'agendo.currentBusiness.v1',
};

function allBusinesses() {
  return readJSON(KEYS.businesses, {});
}

export function getBusiness(slug) {
  return allBusinesses()[slug] ?? null;
}

export function getCurrentBusiness() {
  const slug = readJSON(KEYS.currentBusiness, null);
  return slug ? getBusiness(slug) : null;
}

/**
 * @param {{name:string, whatsapp:string, services:object[], schedule:object[], referredBy?:string|null}} data
 */
export function createBusiness(data) {
  const businesses = allBusinesses();
  let slug = createSlug(data.name);
  while (businesses[slug]) slug = createSlug(data.name);
  const business = {
    ...data,
    slug,
    createdAt: new Date().toISOString(),
    billing: null,
  };
  businesses[slug] = business;
  writeJSON(KEYS.businesses, businesses);
  writeJSON(KEYS.currentBusiness, slug);
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

export function getBookings(slug) {
  const bookings = readJSON(KEYS.bookings, []);
  return bookings
    .filter((b) => b.slug === slug)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/**
 * @param {{slug:string, serviceId:string, startsAt:string, clientName:string, clientPhone:string, simulated?:boolean}} data
 */
export function createBooking(data) {
  const bookings = readJSON(KEYS.bookings, []);
  const taken = bookings.some((b) => b.slug === data.slug && b.startsAt === data.startsAt);
  if (taken) throw new Error('Ese horario ya se reservó. Elige otro.');
  const booking = {
    ...data,
    id: crypto.randomUUID?.() ?? String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  writeJSON(KEYS.bookings, bookings);
  emitChange(KEYS.bookings);
  return booking;
}

export function resetAll() {
  Object.values(KEYS).forEach(removeKey);
  emitChange(KEYS.businesses);
}
