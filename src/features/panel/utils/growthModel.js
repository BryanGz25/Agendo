import { CURRENT_FUNNEL, TRIAL_OUTCOMES, UNIT_ECONOMICS, BADGE } from '../../../config/caseData';

/**
 * Step-to-step pass rate for a funnel.
 * @param {{reached:number, completed:number}[]} steps
 */
export function stepRates(steps) {
  return steps.map((step) => ({
    ...step,
    passRate: step.reached === 0 ? 0 : step.completed / step.reached,
    lost: step.reached - step.completed,
  }));
}

/** The step that loses the most trials and the one that takes the most time. */
export function findBottlenecks(steps) {
  const rated = stepRates(steps);
  const mostLost = rated.reduce((a, b) => (b.lost > a.lost ? b : a));
  const timed = rated.filter((s) => s.minutes != null);
  const slowest = timed.reduce((a, b) => (b.minutes > a.minutes ? b : a));
  return { mostLost, slowest };
}

/**
 * Trial outcomes per 100 trials, following the rules of Parte 2.
 * Habitual use keeps today's ratio over booked trials (22 of 38) unless given.
 * @param {{configured:number, shared:number, habitualPerBooked?:number}} input
 */
export function trialOutcomes({ configured, shared, habitualPerBooked }) {
  const { bookedRateIfShared, bookedRateIfNotShared, payRate, activeAt6Months } = TRIAL_OUTCOMES;
  const safeShared = Math.min(shared, configured);
  const booked =
    safeShared * bookedRateIfShared + (configured - safeShared) * bookedRateIfNotShared;
  const ratio = habitualPerBooked ?? todayHabitualPerBooked();
  const habitual = booked * ratio;

  const groups = {
    notConfigured: 100 - configured,
    configuredNoBooking: configured - booked,
    bookedNotHabitual: booked - habitual,
    habitual,
  };
  const paying =
    groups.notConfigured * payRate.notConfigured +
    groups.configuredNoBooking * payRate.configuredNoBooking +
    groups.bookedNotHabitual * payRate.bookedNotHabitual +
    groups.habitual * payRate.habitual;

  const payingHabitual = groups.habitual * payRate.habitual;
  const activeAt6 =
    payingHabitual * activeAt6Months.habitual + (paying - payingHabitual) * activeAt6Months.others;

  return {
    configured,
    shared: safeShared,
    booked,
    habitual,
    groups,
    payRate: paying / 100,
    retention6m: paying === 0 ? 0 : activeAt6 / paying,
  };
}

/** Today: 38 of 100 trials get a booking and 22 reach habitual use. */
export function todayHabitualPerBooked() {
  const shared = CURRENT_FUNNEL.at(-1).completed;
  const configured = CURRENT_FUNNEL.at(-1).reached;
  const booked =
    shared * TRIAL_OUTCOMES.bookedRateIfShared +
    (configured - shared) * TRIAL_OUTCOMES.bookedRateIfNotShared;
  return TRIAL_OUTCOMES.habitualToday / booked;
}

/**
 * CAC paid, as defined in Parte 1: ads + sellers + commissions over ad clients.
 * @param {{payRate:number, adSpend?:number, trials?:number}} input
 */
export function cacPaid({
  payRate,
  adSpend = UNIT_ECONOMICS.adSpend,
  trials = UNIT_ECONOMICS.adTrials,
}) {
  const { sellerSalary, sellerCapacity, commissionPerClient } = UNIT_ECONOMICS;
  const clients = trials * payRate;
  if (clients <= 0) return { clients: 0, sellers: 0, totalCost: adSpend, cac: Infinity };
  const sellers = trials === 0 ? 0 : Math.ceil(trials / sellerCapacity);
  const totalCost = adSpend + sellers * sellerSalary + clients * commissionPerClient;
  return { clients, sellers, totalCost, cac: totalCost / clients };
}

/** 24-month LTV on margin (Parte 1): sum of monthly margin while the client stays. */
export function ltv24() {
  const { monthlyPrice, grossMargin, monthlyChurn, ltvHorizonMonths } = UNIT_ECONOMICS;
  const margin = monthlyPrice * grossMargin;
  let total = 0;
  for (let m = 0; m < ltvHorizonMonths; m += 1) total += margin * (1 - monthlyChurn) ** m;
  return total;
}

/** Badge loop: how many new businesses the badge brings each month. */
export function badgeLoop({ conversion, activeBusinesses = BADGE.activeBusinesses }) {
  const visits = activeBusinesses * BADGE.visitsPerBookingPage;
  const todayConversion = BADGE.newBusinessesPerMonth / visits;
  return {
    visits,
    todayConversion,
    todayTrials: BADGE.newBusinessesPerMonth,
    newTrials: visits * conversion,
  };
}

/** Full comparison used by the owner panel. */
export function compareScenarios({ newConfigured, newShared }) {
  const today = trialOutcomes({
    configured: CURRENT_FUNNEL.at(-1).reached,
    shared: CURRENT_FUNNEL.at(-1).completed,
  });
  const next = trialOutcomes({ configured: newConfigured, shared: newShared });
  return {
    today: { ...today, ...cacPaid({ payRate: today.payRate }) },
    next: { ...next, ...cacPaid({ payRate: next.payRate }) },
  };
}
