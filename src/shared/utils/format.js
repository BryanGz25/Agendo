const money = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 2,
});
const money0 = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
});
const number1 = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 1 });
const percent1 = new Intl.NumberFormat('es-CR', { style: 'percent', maximumFractionDigits: 1 });

export const formatMoney = (value) => (Number.isFinite(value) ? money.format(value) : '—');
export const formatMoney0 = (value) => (Number.isFinite(value) ? money0.format(value) : '—');
export const formatNumber = (value) => (Number.isFinite(value) ? number1.format(value) : '—');
const percentFine = new Intl.NumberFormat('es-CR', { style: 'percent', maximumFractionDigits: 4 });
export const formatPercentFine = (value) =>
  Number.isFinite(value) ? percentFine.format(value) : '—';
export const formatPercent = (value) => (Number.isFinite(value) ? percent1.format(value) : '—');

const dayFormat = new Intl.DateTimeFormat('es-CR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const shortDayFormat = new Intl.DateTimeFormat('es-CR', { weekday: 'short', day: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('es-CR', { hour: 'numeric', minute: '2-digit' });

export const formatDay = (date) => dayFormat.format(date);
export const formatShortDay = (date) => shortDayFormat.format(date);
export const formatTime = (date) => timeFormat.format(date);
