import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PageHeader } from '../../../shared/components/DashboardLayout';
import { Button, Card, Field, inputClass } from '../../../shared/components/ui';
import { createBooking } from '../../../services/businessRepository';
import { availableSlots } from '../../../shared/utils/slots';
import { normalizePhone } from '../../../shared/utils/phone';
import { formatDay, formatShortDay, formatTime } from '../../../shared/utils/format';
import { useStudio } from '../hooks/useStudio';
import BookingRow from '../components/BookingRow';

const TABS = [
  { id: 'upcoming', label: 'Próximas' },
  { id: 'past', label: 'Pasadas' },
  { id: 'all', label: 'Todas' },
];

function dayKey(date) {
  return new Date(date).toDateString();
}

/** Walk-in or phone booking added by the barber. */
function NewBookingForm({ business, bookings, onDone }) {
  const [serviceId, setServiceId] = useState(business.services[0]?.id);
  const service = business.services.find((s) => s.id === serviceId);
  const days = useMemo(
    () =>
      availableSlots({
        schedule: business.schedule,
        minutes: service?.minutes ?? 30,
        taken: bookings.filter((b) => b.status !== 'cancelled').map((b) => b.startsAt),
        days: 14,
      }),
    [business, service, bookings],
  );
  const [dayIndex, setDayIndex] = useState(0);
  const [startsAt, setStartsAt] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!startsAt || name.trim().length < 2 || !normalized) {
      setError('Elige la hora y escribe el nombre y un WhatsApp válido.');
      return;
    }
    try {
      createBooking({
        slug: business.slug,
        serviceId,
        startsAt,
        clientName: name.trim(),
        clientPhone: normalized,
        paid: false,
        source: 'manual',
      });
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card className="mb-6 p-5">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black">Nueva cita</h2>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg p-1 text-muted"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <Field id="nb-service" label="Servicio">
          <select
            id="nb-service"
            className={inputClass}
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setStartsAt('');
            }}
          >
            {business.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.minutes} min · ${s.price}
              </option>
            ))}
          </select>
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-semibold">Día y hora</p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {days.map((d, i) => (
              <button
                key={d.date.toISOString()}
                type="button"
                onClick={() => {
                  setDayIndex(i);
                  setStartsAt('');
                }}
                aria-pressed={i === dayIndex}
                className={`shrink-0 rounded-xl border px-3 py-1.5 text-sm font-semibold capitalize ${i === dayIndex ? 'border-night bg-night text-paper' : 'border-line bg-card'}`}
              >
                {formatShortDay(d.date)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {days[dayIndex]?.times.map((t) => (
              <button
                key={t.toISOString()}
                type="button"
                onClick={() => setStartsAt(t.toISOString())}
                aria-pressed={startsAt === t.toISOString()}
                className={`min-h-10 rounded-lg border text-sm font-semibold ${startsAt === t.toISOString() ? 'border-accent bg-accent text-white' : 'border-line bg-card'}`}
              >
                {formatTime(t)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="nb-name" label="Nombre del cliente">
            <input
              id="nb-name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field id="nb-phone" label="WhatsApp">
            <input
              id="nb-phone"
              className={inputClass}
              inputMode="tel"
              placeholder="8888 1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-accent-strong">
            {error}
          </p>
        )}
        <Button type="submit" variant="dark">
          Guardar cita
        </Button>
      </form>
    </Card>
  );
}

export default function StudioAgenda() {
  const { business, bookings } = useStudio();
  const [tab, setTab] = useState('upcoming');
  const [adding, setAdding] = useState(false);
  const [now] = useState(() => Date.now());
  const serviceOf = (b) => business.services.find((s) => s.id === b.serviceId);

  const filtered = bookings.filter((b) => {
    const t = new Date(b.startsAt).getTime();
    if (tab === 'upcoming') return t >= now - 3600000;
    if (tab === 'past') return t < now - 3600000;
    return true;
  });
  const ordered = tab === 'past' ? [...filtered].reverse() : filtered;
  const groups = ordered.reduce((acc, b) => {
    const key = dayKey(b.startsAt);
    (acc[key] ??= []).push(b);
    return acc;
  }, {});

  return (
    <>
      <PageHeader kicker="Agenda" title="Tus citas">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={16} aria-hidden /> Nueva cita
        </Button>
      </PageHeader>

      {adding && (
        <NewBookingForm business={business} bookings={bookings} onDone={() => setAdding(false)} />
      )}

      <div className="mb-6 inline-flex rounded-xl border border-line bg-card p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === t.id ? 'bg-night text-paper' : 'text-ink-soft'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {Object.keys(groups).length === 0 ? (
        <Card className="border-dashed p-6 text-ink-soft">No hay citas en esta vista.</Card>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(groups).map(([key, list]) => (
            <section key={key}>
              <h2 className="mb-3 font-label text-sm uppercase tracking-[0.18em] text-muted first-letter:uppercase">
                {formatDay(new Date(key))} · {list.length} {list.length === 1 ? 'cita' : 'citas'}
              </h2>
              <ul className="flex flex-col gap-2">
                {list.map((b) => (
                  <BookingRow key={b.id} booking={b} service={serviceOf(b)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
