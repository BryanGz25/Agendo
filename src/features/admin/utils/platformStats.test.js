import { describe, expect, it } from 'vitest';
import { platformStats } from './platformStats';
import { buildDemoData } from '../../../services/demoSeed';

const now = new Date(2026, 10, 6, 12).getTime();
const DAY = 86400000;

describe('platformStats', () => {
  it('counts statuses, MRR and activation', () => {
    const businesses = [
      {
        slug: 'a',
        createdAt: new Date(now - 30 * DAY).toISOString(),
        status: 'active',
        plan: 'monthly',
        source: 'ads',
      },
      {
        slug: 'b',
        createdAt: new Date(now - 20 * DAY).toISOString(),
        status: 'active',
        plan: 'annual',
        source: 'badge',
      },
      {
        slug: 'c',
        createdAt: new Date(now - 3 * DAY).toISOString(),
        status: 'trial',
        plan: 'monthly',
        source: 'ads',
      },
    ];
    const bookings = [
      { slug: 'c', createdAt: new Date(now - 2 * DAY).toISOString(), status: 'confirmed' },
    ];
    const stats = platformStats({ businesses, bookings, now });
    expect(stats.active).toBe(2);
    expect(stats.trial).toBe(1);
    expect(stats.mrr).toBe(45);
    expect(stats.fromBadge).toBe(1);
    // "a" signed up 30 days ago, outside the 30-day window: 1 of 2.
    expect(stats.activation7d).toBeCloseTo(0.5, 6);
  });

  it('demo data keeps the case proportions (about 62 % configure, 22 % habitual)', () => {
    const { businesses } = buildDemoData({ count: 2000, now: new Date(now) });
    const configured = businesses.filter((b) => b.stage !== 'abandoned').length / 2000;
    const habitual = businesses.filter((b) => b.stage === 'habitual').length / 2000;
    expect(configured).toBeGreaterThan(0.58);
    expect(configured).toBeLessThan(0.66);
    expect(habitual).toBeGreaterThan(0.19);
    expect(habitual).toBeLessThan(0.25);
  });
});
