/**
 * Data from "Caso B · Agendo" (Parte 1 y Parte 2). Every number here is
 * quoted from the case PDF; nothing in this file is an assumption.
 * Assumptions live in ASSUMPTIONS below and are labelled as such in the UI.
 */

/** Parte 2 · "Cómo funciona hoy", per 100 trials. */
export const CURRENT_FUNNEL = [
  {
    id: 'fiscal',
    label: 'Datos fiscales',
    asks: 'Cédula jurídica, razón social, régimen y dirección fiscal',
    reached: 100,
    completed: 74,
    minutes: 4,
  },
  {
    id: 'business',
    label: 'Datos del negocio',
    asks: 'Dirección, foto del local y redes',
    reached: 74,
    completed: 70,
    minutes: 3,
  },
  {
    id: 'services',
    label: 'Servicios',
    asks: '9 servicios cargados uno por uno',
    reached: 70,
    completed: 65,
    minutes: 12,
  },
  {
    id: 'schedule',
    label: 'Horarios',
    asks: 'Horario de cada barbero para cada día',
    reached: 65,
    completed: 62,
    minutes: 9,
  },
  {
    id: 'share',
    label: 'Compartir el link',
    asks: 'Buscar el link en Configuración › Mi página',
    reached: 62,
    completed: 30,
    minutes: null,
  },
];

/** Parte 2 · "Lo que pasa después, en los 14 días de prueba". */
export const TRIAL_OUTCOMES = {
  bookedRateIfShared: 27 / 30,
  bookedRateIfNotShared: 11 / 32,
  habitualToday: 22,
  payRate: {
    notConfigured: 0.01,
    configuredNoBooking: 0.05,
    bookedNotHabitual: 0.15,
    habitual: 0.45,
  },
  activeAt6Months: { habitual: 0.8, others: 0.35 },
  habitualThreshold: 20,
};

/** Parte 1 · unit economics and acquisition costs. */
export const UNIT_ECONOMICS = {
  monthlyPrice: 25,
  annualPrice: 240,
  grossMargin: 0.78,
  monthlyChurn: 0.06,
  ltvHorizonMonths: 24,
  adSpend: 10000,
  adTrials: 500,
  sellerSalary: 1200,
  sellerCapacity: 500,
  commissionPerClient: 20,
  organicClientsPerMonth: 50,
  part1ConversionRate: 0.14,
  part1CacPaid: 180,
  part1CacBlended: 105,
};

/** Parte 2 · badge ("Reservado con Agendo"). */
export const BADGE = {
  activeBusinesses: 1150,
  visitsPerBookingPage: 250,
  newBusinessesPerMonth: 8,
};

/** Parte 2 · otros datos used to build the templates. */
export const TEMPLATES = {
  services: [
    { id: 'corte', name: 'Corte', price: 10, minutes: 30 },
    { id: 'barba', name: 'Barba', price: 8, minutes: 20 },
    { id: 'combo', name: 'Corte con barba', price: 15, minutes: 45 },
  ],
  priceRange: { min: 8, max: 15 },
  week: [
    { day: 1, label: 'Lunes', short: 'Lun', open: true },
    { day: 2, label: 'Martes', short: 'Mar', open: true },
    { day: 3, label: 'Miércoles', short: 'Mié', open: true },
    { day: 4, label: 'Jueves', short: 'Jue', open: true },
    { day: 5, label: 'Viernes', short: 'Vie', open: true },
    { day: 6, label: 'Sábado', short: 'Sáb', open: true },
    { day: 0, label: 'Domingo', short: 'Dom', open: false },
  ],
  defaultHours: { start: '09:00', end: '19:00' },
  trialDays: 14,
};

/**
 * Team assumptions (SUPUESTO). Editable in the owner panel.
 * - newConfigured: moving fiscal data to the end of the trial removes the
 *   26-trial loss of screen 1; we keep a 15-point loss for the remaining
 *   3 short steps.
 * - newShared: sharing is offered inside the flow with the message ready.
 * - badgeConversion: share of badge visits that start a trial once the
 *   badge links to the sign-up page (today it links nowhere).
 */
export const ASSUMPTIONS = {
  newConfigured: 85,
  newShared: 60,
  newMinutes: { business: 1, services: 1, schedule: 1 },
  badgeConversion: 0.0002,
};
