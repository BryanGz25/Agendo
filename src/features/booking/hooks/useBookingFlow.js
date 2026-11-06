import { useCallback, useMemo, useState } from 'react';
import { createBooking, getBookings } from '../../../services/businessRepository';
import { availableSlots } from '../../../shared/utils/slots';
import { normalizePhone } from '../../../shared/utils/phone';

/** State of the client's booking: service → time → contact → done. */
export function useBookingFlow(business) {
  const [serviceId, setServiceId] = useState(null);
  const [startsAt, setStartsAt] = useState(null);
  const [contact, setContact] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);
  const [version, setVersion] = useState(0);

  const service = business?.services.find((s) => s.id === serviceId) ?? null;

  const slots = useMemo(() => {
    if (!business || !service) return [];
    const taken = getBookings(business.slug).map((b) => b.startsAt);
    return availableSlots({ schedule: business.schedule, minutes: service.minutes, taken });
    // version forces a refresh after a failed attempt on a taken slot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, service, version]);

  const chooseService = useCallback((id) => {
    setServiceId(id);
    setStartsAt(null);
  }, []);

  const confirm = useCallback(() => {
    const found = {};
    if (contact.name.trim().length < 2) found.name = 'Escribe tu nombre.';
    const phone = normalizePhone(contact.phone);
    if (!phone) found.phone = 'Escribe un WhatsApp válido (8 dígitos).';
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      const created = createBooking({
        slug: business.slug,
        serviceId,
        startsAt,
        clientName: contact.name.trim(),
        clientPhone: phone,
        simulated: false,
        paid: true,
      });
      setBooking(created);
    } catch (error) {
      setErrors({ slot: error.message });
      setStartsAt(null);
      setVersion((v) => v + 1);
    }
  }, [business, serviceId, startsAt, contact]);

  return {
    service,
    slots,
    startsAt,
    contact,
    errors,
    booking,
    chooseService,
    chooseTime: setStartsAt,
    setContact: (patch) => setContact((c) => ({ ...c, ...patch })),
    confirm,
  };
}
