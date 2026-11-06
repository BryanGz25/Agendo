/** URL-safe slug from a business name plus a short random suffix. */
export function createSlug(name) {
  const base =
    String(name)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'barberia';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
