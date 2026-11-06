import { describe, expect, it } from 'vitest';
import { CURRENT_FUNNEL } from '../../../config/caseData';
import {
  badgeLoop,
  cacPaid,
  compareScenarios,
  findBottlenecks,
  ltv24,
  stepRates,
  trialOutcomes,
} from './growthModel';

describe('current funnel (Parte 2)', () => {
  it('computes the pass rate of each screen', () => {
    const rates = stepRates(CURRENT_FUNNEL).map((s) => Number((s.passRate * 100).toFixed(1)));
    expect(rates).toEqual([74, 94.6, 92.9, 95.4, 48.4]);
  });

  it('finds sharing as the biggest loss and services as the slowest screen', () => {
    const { mostLost, slowest } = findBottlenecks(CURRENT_FUNNEL);
    expect(mostLost.id).toBe('share');
    expect(mostLost.lost).toBe(32);
    expect(slowest.id).toBe('services');
    expect(slowest.minutes).toBe(12);
  });
});

describe('trial outcomes', () => {
  it('reproduces today: 38 booked, 22 habitual, 13.88 % pay (Parte 1 says 14 %)', () => {
    const today = trialOutcomes({ configured: 62, shared: 30 });
    expect(today.booked).toBeCloseTo(38, 6);
    expect(today.habitual).toBeCloseTo(22, 6);
    expect(today.payRate).toBeCloseTo(0.1388, 6);
  });

  it('never shares more trials than configured', () => {
    expect(trialOutcomes({ configured: 50, shared: 80 }).shared).toBe(50);
  });

  it('keeps retention at 6 months between the two case rates', () => {
    const { retention6m } = trialOutcomes({ configured: 62, shared: 30 });
    expect(retention6m).toBeGreaterThan(0.35);
    expect(retention6m).toBeLessThan(0.8);
  });
});

describe('unit economics (Parte 1)', () => {
  it('gives CAC paid of $180 with the 14 % conversion', () => {
    expect(cacPaid({ payRate: 0.14 }).cac).toBeCloseTo(180, 6);
  });

  it('gives LTV at 24 months of $251.39', () => {
    expect(ltv24()).toBeCloseTo(251.39, 2);
  });

  it('handles zero clients without dividing by zero', () => {
    expect(cacPaid({ payRate: 0 }).cac).toBe(Infinity);
  });
});

describe('scenarios', () => {
  it('lowers CAC paid when more trials reach their first booking', () => {
    const { today, next } = compareScenarios({ newConfigured: 85, newShared: 60 });
    expect(next.payRate).toBeGreaterThan(today.payRate);
    expect(next.cac).toBeLessThan(today.cac);
    expect(next.cac).toBeCloseTo(124.04, 1);
  });

  it('measures the badge conversion today', () => {
    const loop = badgeLoop({ conversion: 0.0002 });
    expect(loop.visits).toBe(287500);
    expect(loop.newTrials).toBeCloseTo(57.5, 6);
  });
});
