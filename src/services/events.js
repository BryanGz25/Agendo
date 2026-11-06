/**
 * Change notifications across components and browser tabs. A booking made
 * on the public page in another tab reaches the barber's screen through the
 * native "storage" event; same-tab changes use a custom event.
 */
const CHANGE_EVENT = 'agendo:change';

export function emitChange(key) {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
}

export function onChange(callback) {
  const onCustom = (event) => callback(event.detail?.key);
  const onStorage = (event) => callback(event.key);
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}
