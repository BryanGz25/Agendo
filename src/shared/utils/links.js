import { encodeBusiness } from './businessCodec';

/** Absolute URLs for sharing. VITE_PUBLIC_URL wins over the current origin. */
export function appUrl(path = '') {
  const configured = import.meta.env.VITE_PUBLIC_URL;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const root = configured ? configured.replace(/\/$/, '') : `${window.location.origin}${base}`;
  return `${root}/${path.replace(/^\//, '')}`;
}

/** Public booking link. The hash carries the shop data and never reaches a server. */
export function bookingUrl(business) {
  return appUrl(`b/${business.slug}#d=${encodeBusiness(business)}`);
}

export function signupUrl(refSlug) {
  return appUrl(refSlug ? `?ref=${encodeURIComponent(refSlug)}` : '');
}

/** wa.me link: with a phone it opens that chat, without one it opens the contact picker. */
export function whatsappUrl(text, phone) {
  const target = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${target}?text=${encodeURIComponent(text)}`;
}
