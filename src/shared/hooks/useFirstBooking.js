import { useCallback, useEffect, useRef } from 'react';
import { getBookings, createBooking } from '../../services/businessRepository';
import { track } from '../../services/analytics';
import { useStoreValue } from './useStoreValue';
import { useToast } from '../components/Toast';
import { availableSlots } from '../utils/slots';
import { formatShortDay, formatTime } from '../utils/format';

/**
 * Watches the barbershop's bookings and celebrates the first one: the "aha"
 * moment of Parte 2. Works for a real booking made from the public page (even
 * in another tab) and for the simulated one.
 */
export function useFirstBooking(business) {
  const { notify } = useToast();
  const read = useCallback(() => (business ? getBookings(business.slug) : []), [business]);
  const bookings = useStoreValue(read);
  const previous = useRef(bookings.length);

  useEffect(() => {
    if (bookings.length > previous.current) {
      const latest = bookings.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
      const service = business.services.find((s) => s.id === latest.serviceId);
      const when = new Date(latest.startsAt);
      if (previous.current === 0) track('firstBooking');
      notify({
        title: previous.current === 0 ? '¡Tu primera reserva!' : 'Nueva reserva',
        body: `${latest.clientName} · ${service?.name ?? 'Servicio'} · ${formatShortDay(when)} ${formatTime(when)}${latest.simulated ? ' · simulado' : ''}`,
      });
    }
    previous.current = bookings.length;
  }, [bookings, business, notify]);

  const simulate = useCallback(() => {
    if (!business) return;
    const service = business.services[0];
    const taken = getBookings(business.slug).map((b) => b.startsAt);
    const firstDay = availableSlots({
      schedule: business.schedule,
      minutes: service.minutes,
      taken,
    })[0];
    if (!firstDay) return;
    createBooking({
      slug: business.slug,
      serviceId: service.id,
      startsAt: firstDay.times[0].toISOString(),
      clientName: 'Carlos M. (cliente simulado)',
      clientPhone: '50600000000',
      simulated: true,
      paid: true,
    });
  }, [business]);

  return { bookings, simulate };
}
