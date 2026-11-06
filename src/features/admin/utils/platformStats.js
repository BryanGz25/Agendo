import { TEMPLATES, UNIT_ECONOMICS } from '../../../config/caseData';

const DAY = 86400000;

/**
 * Platform numbers for the admin overview, computed from the stored shops and
 * bookings. "Activation" is the case's aha: a first booking within 7 days.
 * @param {{businesses:object[], bookings:object[], now:number}} input
 */
export function platformStats({ businesses, bookings, now }) {
  const bySlug = new Map();
  bookings
    .filter((b) => b.status !== 'cancelled')
    .forEach((b) => {
      const list = bySlug.get(b.slug) ?? [];
      list.push(b);
      bySlug.set(b.slug, list);
    });

  const enriched = businesses.map((business) => {
    const list = bySlug.get(business.slug) ?? [];
    const created = new Date(business.createdAt).getTime();
    const trialEnd = created + TEMPLATES.trialDays * DAY;
    const firstBooking = list.reduce(
      (min, b) => Math.min(min, new Date(b.createdAt).getTime()),
      Infinity,
    );
    const inTrial = list.filter((b) => new Date(b.createdAt).getTime() <= trialEnd).length;
    return {
      ...business,
      bookingCount: list.length,
      trialBookings: inTrial,
      activated7d: firstBooking - created <= 7 * DAY,
      habitual: inTrial >= 20,
      daysSinceSignup: Math.floor((now - created) / DAY),
    };
  });

  const count = (fn) => enriched.filter(fn).length;
  const active = enriched.filter((b) => b.status === 'active');
  const mrr = active.reduce(
    (sum, b) =>
      sum + (b.plan === 'annual' ? UNIT_ECONOMICS.annualPrice / 12 : UNIT_ECONOMICS.monthlyPrice),
    0,
  );
  const finished = enriched.filter((b) => b.status !== 'trial');
  const last30 = enriched.filter((b) => b.daysSinceSignup < 30);
  const weekBookings = bookings.filter((b) => now - new Date(b.createdAt).getTime() < 7 * DAY);

  return {
    businesses: enriched,
    total: enriched.length,
    trial: count((b) => b.status === 'trial'),
    active: active.length,
    cancelled: count((b) => b.status === 'cancelled'),
    mrr,
    conversion: finished.length ? active.length / finished.length : null,
    activation7d: last30.length ? last30.filter((b) => b.activated7d).length / last30.length : null,
    habitualRate: enriched.length ? count((b) => b.habitual) / enriched.length : null,
    fromBadge: count((b) => b.source === 'badge'),
    weekBookings: weekBookings.length,
    signupsByWeek: weeklySignups(enriched, now),
  };
}

/** Sign-ups per week for the last 8 weeks, oldest first. */
export function weeklySignups(businesses, now, weeks = 8) {
  const buckets = Array.from({ length: weeks }, (_, i) => ({ week: i, ads: 0, badge: 0 }));
  businesses.forEach((b) => {
    const age = Math.floor((now - new Date(b.createdAt).getTime()) / (7 * DAY));
    if (age < 0 || age >= weeks) return;
    const bucket = buckets[weeks - 1 - age];
    if (b.source === 'badge') bucket.badge += 1;
    else bucket.ads += 1;
  });
  return buckets;
}
