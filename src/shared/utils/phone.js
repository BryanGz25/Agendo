/**
 * WhatsApp numbers. Costa Rica numbers have 8 digits; we add the 506 country
 * code when missing. Numbers with a country code (10-15 digits) are kept.
 */
export function normalizePhone(input) {
  const digits = String(input).replace(/\D/g, '');
  if (digits.length === 8) return `506${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return digits;
  return null;
}

export function formatPhone(normalized) {
  if (!normalized) return '';
  if (normalized.startsWith('506') && normalized.length === 11) {
    return `+506 ${normalized.slice(3, 7)} ${normalized.slice(7)}`;
  }
  return `+${normalized}`;
}
