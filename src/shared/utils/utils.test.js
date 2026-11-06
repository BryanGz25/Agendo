import { describe, expect, it } from 'vitest';
import { normalizePhone, formatPhone } from './phone';
import { createSlug } from './slug';
import { availableSlots } from './slots';

describe('phone', () => {
  it('adds the Costa Rica code to 8-digit numbers', () => {
    expect(normalizePhone('8888-1234')).toBe('50688881234');
    expect(formatPhone('50688881234')).toBe('+506 8888 1234');
  });
  it('rejects numbers that are too short', () => {
    expect(normalizePhone('1234')).toBeNull();
  });
});

describe('slug', () => {
  it('removes accents and symbols', () => {
    expect(createSlug('La Navaja Peluquería!')).toMatch(/^la-navaja-peluqueria-[a-z0-9]{1,4}$/);
  });
});

describe('slots', () => {
  const schedule = [{ day: 1, open: true, start: '09:00', end: '10:00' }];
  const monday = new Date(2026, 10, 9, 7, 0); // Monday 9 Nov 2026, 07:00

  it('splits the day by service duration', () => {
    const slots = availableSlots({ schedule, minutes: 30, taken: [], from: monday, days: 1 });
    expect(slots[0].times.map((t) => t.getHours() * 60 + t.getMinutes())).toEqual([540, 570]);
  });

  it('skips taken slots and closed days', () => {
    const taken = [new Date(2026, 10, 9, 9, 0).toISOString()];
    const slots = availableSlots({ schedule, minutes: 30, taken, from: monday, days: 2 });
    expect(slots).toHaveLength(1);
    expect(slots[0].times).toHaveLength(1);
  });
});
