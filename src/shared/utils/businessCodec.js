/**
 * Packs the public part of a barbershop (name, WhatsApp, services, schedule)
 * into the booking link, so the link works on any client's phone without a
 * backend. Nothing private travels in the link: no fiscal or billing data.
 */

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeBusiness(business) {
  const compact = {
    v: 1,
    n: business.name,
    w: business.whatsapp,
    s: business.services.map((s) => [s.id, s.name, s.price, s.minutes]),
    h: business.schedule.filter((d) => d.open).map((d) => [d.day, d.start, d.end]),
  };
  return toBase64Url(JSON.stringify(compact));
}

/** Returns null for anything malformed, so a broken link shows "not found". */
export function decodeBusiness(slug, encoded) {
  try {
    const data = JSON.parse(fromBase64Url(encoded));
    if (
      data.v !== 1 ||
      typeof data.n !== 'string' ||
      !Array.isArray(data.s) ||
      !Array.isArray(data.h)
    ) {
      return null;
    }
    const openDays = new Map(data.h.map(([day, start, end]) => [day, { start, end }]));
    return {
      slug,
      name: data.n.slice(0, 80),
      whatsapp: /^\d{8,15}$/.test(data.w) ? data.w : null,
      services: data.s.slice(0, 30).map(([id, name, price, minutes]) => ({
        id: String(id),
        name: String(name).slice(0, 60),
        price: Number(price) || 0,
        minutes: Math.max(10, Number(minutes) || 30),
      })),
      schedule: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        day,
        open: openDays.has(day),
        start: openDays.get(day)?.start ?? '09:00',
        end: openDays.get(day)?.end ?? '19:00',
      })),
      fromLink: true,
    };
  } catch {
    return null;
  }
}
