import { TEMPLATES, TRIAL_OUTCOMES } from '../config/caseData';
import { createSlug } from '../shared/utils/slug';
import { importData, listBusinesses } from './businessRepository';

/**
 * Demo data for the admin panel. Every record is flagged `simulated` and the
 * UI labels it. The proportions follow the case so the panel tells the same
 * story as the PDF: of 100 trials, 62 configure, 30 share on day one, 38 get a
 * booking and 22 reach habitual use (20+ bookings in 14 days).
 */
const NAMES = [
  'La Navaja',
  'Barbería El Patrón',
  'Corte Fino',
  'Don Bigote',
  'The Barber Club',
  'Navaja de Oro',
  'Barbería Central',
  'Estilo Urbano',
  'El Rincón del Barbero',
  'Fade Masters',
  'Barbería Los Hermanos',
  'Tijeras y Café',
  'Clásicos',
  'La Esquina',
  'Barba Negra',
  'Kings Cut',
  'Barbería San José',
  'El Filo',
  'Brocha y Navaja',
  'Mr. Fade',
];
const CLIENTS = [
  'Andrés',
  'Luis',
  'Kevin',
  'Jorge',
  'Daniel',
  'Esteban',
  'Marco',
  'José',
  'Pablo',
  'Diego',
  'Fabián',
  'Ricardo',
  'Mauricio',
  'Allan',
  'Bryan',
  'Josué',
  'Carlos',
  'Gabriel',
];
const CITIES = [
  'San José',
  'Heredia',
  'Alajuela',
  'Cartago',
  'Liberia',
  'Pérez Zeledón',
  'Limón',
  'Puntarenas',
  'Grecia',
];

/** Small deterministic PRNG so the demo looks the same on every load. */
function random(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

const DAY = 86400000;

export function buildDemoData({ count = 100, now = new Date(), seed = 2026 } = {}) {
  const rand = random(seed);
  const businesses = [];
  const bookings = [];

  for (let i = 0; i < count; i += 1) {
    const daysAgo = Math.floor(rand() * 60);
    const createdAt = new Date(now.getTime() - daysAgo * DAY - rand() * DAY);
    const name = `${pick(rand, NAMES)} · ${pick(rand, CITIES)}`;
    const source = rand() < 0.08 ? 'badge' : 'ads';

    // Stage reached, in the case proportions (per 100 trials).
    const roll = rand() * 100;
    const stage =
      roll < 22 ? 'habitual' : roll < 38 ? 'booked' : roll < 62 ? 'configured' : 'abandoned';
    const shared = stage === 'habitual' || stage === 'booked' ? rand() < 27 / 38 : rand() < 3 / 24;

    const payChance = {
      habitual: TRIAL_OUTCOMES.payRate.habitual,
      booked: TRIAL_OUTCOMES.payRate.bookedNotHabitual,
      configured: TRIAL_OUTCOMES.payRate.configuredNoBooking,
      abandoned: TRIAL_OUTCOMES.payRate.notConfigured,
    }[stage];
    const trialOver = daysAgo >= TEMPLATES.trialDays;
    const status = !trialOver ? 'trial' : rand() < payChance ? 'active' : 'cancelled';

    const business = {
      slug: createSlug(name),
      name,
      city: name.split(' · ')[1],
      whatsapp: `5068${String(Math.floor(rand() * 9999999)).padStart(7, '0')}`,
      services: TEMPLATES.services.map((s) => ({ ...s })),
      schedule: TEMPLATES.week.map(({ day, open }) => ({ day, open, ...TEMPLATES.defaultHours })),
      createdAt: createdAt.toISOString(),
      status,
      plan: status === 'active' && rand() < 0.1 ? 'annual' : 'monthly',
      source,
      stage,
      sharedFirstDay: shared,
      billing: status === 'active' ? { legalName: `${name.split(' · ')[0]} (simulado)` } : null,
      simulated: true,
    };
    businesses.push(business);

    const count14 =
      stage === 'habitual'
        ? 20 + Math.floor(rand() * 25)
        : stage === 'booked'
          ? 1 + Math.floor(rand() * 12)
          : 0;
    for (let b = 0; b < count14; b += 1) {
      const start = new Date(createdAt.getTime() + (1 + Math.floor(rand() * 20)) * DAY);
      start.setHours(9 + Math.floor(rand() * 9), rand() < 0.5 ? 0 : 30, 0, 0);
      const service = pick(rand, business.services);
      const past = start.getTime() < now.getTime();
      bookings.push({
        id: `seed-${i}-${b}`,
        slug: business.slug,
        serviceId: service.id,
        startsAt: start.toISOString(),
        clientName: `${pick(rand, CLIENTS)} (simulado)`,
        clientPhone: `5067${String(Math.floor(rand() * 9999999)).padStart(7, '0')}`,
        status: past ? (rand() < 0.04 ? 'noshow' : 'done') : 'confirmed',
        paid: true,
        createdAt: new Date(start.getTime() - rand() * 3 * DAY).toISOString(),
        simulated: true,
        seeded: true,
      });
    }
  }
  return { businesses, bookings };
}

export function hasDemoData() {
  return listBusinesses().some((b) => b.simulated);
}

export function loadDemoData() {
  if (hasDemoData()) return;
  importData(buildDemoData());
}
