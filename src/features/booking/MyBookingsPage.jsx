import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, MessageCircle, X } from 'lucide-react';
import Brand from '../../shared/components/Brand';
import { Button, Card, Field, SimTag, inputClass } from '../../shared/components/ui';
import {
  BOOKING_STATUS,
  getBookingsByPhone,
  getBusiness,
  updateBooking,
} from '../../services/businessRepository';
import { useStoreValue } from '../../shared/hooks/useStoreValue';
import { normalizePhone } from '../../shared/utils/phone';
import { bookingUrl, whatsappUrl } from '../../shared/utils/links';
import { formatDay, formatMoney, formatTime } from '../../shared/utils/format';

const KEY = 'agendo.clientPhone.v1';

function savedPhone() {
  try {
    return window.localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * Panel for the barbershops' clients: their bookings on this device, with
 * cancel and "book again". In production the phone would be verified with a
 * WhatsApp code before showing anything.
 */
export default function MyBookingsPage() {
  const [phone, setPhone] = useState(savedPhone);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const read = useCallback(() => (phone ? getBookingsByPhone(phone) : []), [phone]);
  const bookings = useStoreValue(read);
  const [now] = useState(() => Date.now());

  const submit = (e) => {
    e.preventDefault();
    const normalized = normalizePhone(input);
    if (!normalized) {
      setError('Escribe un WhatsApp válido (8 dígitos).');
      return;
    }
    try {
      window.localStorage.setItem(KEY, normalized);
    } catch {
      /* ignore */
    }
    setPhone(normalized);
  };

  const upcoming = bookings.filter(
    (b) => new Date(b.startsAt).getTime() >= now - 3600000 && b.status === 'confirmed',
  );
  const history = bookings.filter((b) => !upcoming.includes(b)).reverse();

  return (
    <div className="min-h-dvh bg-paper">
      <header className="bg-night">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Brand />
          <span className="font-label text-xs uppercase tracking-[0.2em] text-gold">Mis citas</span>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        {!phone ? (
          <Card className="p-6">
            <h1 className="font-display text-3xl font-black">Tus citas en un lugar</h1>
            <p className="mt-2 text-ink-soft">Escribe el WhatsApp con el que reservaste.</p>
            <form onSubmit={submit} className="mt-5 flex flex-col gap-4" noValidate>
              <Field id="my-phone" label="WhatsApp" error={error}>
                <input
                  id="my-phone"
                  className={inputClass}
                  inputMode="tel"
                  placeholder="8888 1234"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError('');
                  }}
                />
              </Field>
              <Button type="submit" variant="dark">
                Ver mis citas
              </Button>
            </form>
          </Card>
        ) : (
          <>
            <div className="flex items-end justify-between gap-3">
              <h1 className="font-display text-3xl font-black">Mis citas</h1>
              <button
                type="button"
                className="text-sm font-semibold text-muted underline"
                onClick={() => {
                  setPhone('');
                  try {
                    window.localStorage.removeItem(KEY);
                  } catch {
                    /* ignore */
                  }
                }}
              >
                Cambiar número
              </button>
            </div>

            <section aria-labelledby="next">
              <h2
                id="next"
                className="mb-3 font-label text-sm uppercase tracking-[0.18em] text-muted"
              >
                Próximas
              </h2>
              {upcoming.length === 0 ? (
                <Card className="border-dashed p-5 text-ink-soft">No tienes citas próximas.</Card>
              ) : (
                <ul className="flex flex-col gap-3">
                  {upcoming.map((b) => {
                    const shop = getBusiness(b.slug);
                    const service = shop?.services.find((s) => s.id === b.serviceId);
                    const when = new Date(b.startsAt);
                    return (
                      <li key={b.id}>
                        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-night text-gold">
                            <CalendarCheck size={22} aria-hidden />
                          </span>
                          <div className="flex-1">
                            <p className="font-display text-xl font-black first-letter:uppercase">
                              {formatDay(when)} · {formatTime(when)}
                            </p>
                            <p className="text-ink-soft">
                              {service?.name} en {shop?.name ?? 'la barbería'} ·{' '}
                              {formatMoney(service?.price ?? 0)} pagado
                            </p>
                            {b.simulated && <SimTag className="mt-1" />}
                          </div>
                          <div className="flex gap-2">
                            {shop?.whatsapp && (
                              <a
                                href={whatsappUrl(
                                  `Hola ${shop.name}, te escribo por mi cita.`,
                                  shop.whatsapp,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex size-11 items-center justify-center rounded-xl border border-line text-whatsapp"
                                aria-label="Escribir a la barbería"
                              >
                                <MessageCircle size={18} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => updateBooking(b.id, { status: 'cancelled' })}
                              className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-line px-3 text-sm font-semibold text-accent"
                            >
                              <X size={16} aria-hidden /> Cancelar
                            </button>
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {history.length > 0 && (
              <section aria-labelledby="history">
                <h2
                  id="history"
                  className="mb-3 font-label text-sm uppercase tracking-[0.18em] text-muted"
                >
                  Historial
                </h2>
                <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-card">
                  {history.map((b) => {
                    const shop = getBusiness(b.slug);
                    const service = shop?.services.find((s) => s.id === b.serviceId);
                    return (
                      <li key={b.id} className="flex items-center justify-between gap-3 p-4">
                        <div>
                          <p className="font-semibold first-letter:uppercase">
                            {formatDay(new Date(b.startsAt))}
                          </p>
                          <p className="text-sm text-ink-soft">
                            {service?.name} · {shop?.name} ·{' '}
                            {BOOKING_STATUS[b.status ?? 'confirmed']}
                          </p>
                        </div>
                        {shop && (
                          <a
                            href={bookingUrl(shop)}
                            className="shrink-0 text-sm font-semibold text-blue"
                          >
                            Reservar de nuevo
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
        <Link to="/" className="text-center text-sm font-semibold text-muted underline">
          Ir a Agendo
        </Link>
      </main>
    </div>
  );
}
