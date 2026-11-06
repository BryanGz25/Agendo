import { useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getBookings, getBusiness } from '../../../services/businessRepository';
import { useStoreValue } from '../../../shared/hooks/useStoreValue';

/** Business and bookings for a slug, kept in sync with storage. */
export function useStudioData(slug) {
  const readBusiness = useCallback(() => getBusiness(slug), [slug]);
  const readBookings = useCallback(() => getBookings(slug), [slug]);
  const business = useStoreValue(readBusiness);
  const bookings = useStoreValue(readBookings);
  return { business, bookings };
}

/** Inside the panel pages: the data provided by StudioLayout. */
export function useStudio() {
  return useOutletContext();
}

const DAY = 86400000;

/** Numbers for the barber's home screen. */
export function useStudioStats(business, bookings, now) {
  return useMemo(() => {
    const live = bookings.filter((b) => b.status !== 'cancelled');
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = startOfToday.getTime() + DAY;
    const weekAgo = now - 7 * DAY;
    const priceOf = (b) => business?.services.find((s) => s.id === b.serviceId)?.price ?? 0;

    const today = live.filter((b) => {
      const t = new Date(b.startsAt).getTime();
      return t >= startOfToday.getTime() && t < endOfToday;
    });
    const upcoming = live.filter(
      (b) => new Date(b.startsAt).getTime() >= now - 3600000 && b.status === 'confirmed',
    );
    const lastWeek = live.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= weekAgo;
    });
    const clients = new Set(live.map((b) => b.clientPhone));
    const trialEnd = new Date(business?.createdAt ?? now).getTime() + 14 * DAY;
    const inTrial = live.filter((b) => new Date(b.createdAt).getTime() <= trialEnd);
    const noShows = bookings.filter((b) => b.status === 'noshow').length;

    return {
      today,
      upcoming,
      weekCount: lastWeek.length,
      weekRevenue: lastWeek.reduce((sum, b) => sum + priceOf(b), 0),
      totalRevenue: live.reduce((sum, b) => sum + priceOf(b), 0),
      clients: clients.size,
      trialBookings: inTrial.length,
      daysLeft: Math.max(0, Math.ceil((trialEnd - now) / DAY)),
      noShows,
      priceOf,
    };
  }, [business, bookings, now]);
}
