import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, MessageCircle, Scissors } from 'lucide-react';
import { Button, Card, Field, SimTag, inputClass } from '../../shared/components/ui';
import NotFound from '../../shared/components/NotFound';
import { getBusiness } from '../../services/businessRepository';
import { decodeBusiness } from '../../shared/utils/businessCodec';
import { whatsappUrl } from '../../shared/utils/links';
import { formatDay, formatMoney, formatShortDay, formatTime } from '../../shared/utils/format';
import { useBookingFlow } from './hooks/useBookingFlow';
import AgendoBadge from './components/AgendoBadge';

function useBusinessFromRoute() {
  const { slug } = useParams();
  const { hash } = useLocation();
  return useMemo(() => {
    const local = getBusiness(slug);
    if (local) return local;
    const encoded = new URLSearchParams(hash.replace(/^#/, '')).get('d');
    return encoded ? decodeBusiness(slug, encoded) : null;
  }, [slug, hash]);
}

/** What the barbershop's clients see when they open the shared link. */
export default function PublicBookingPage() {
  const business = useBusinessFromRoute();
  const flow = useBookingFlow(business);
  const [dayIndex, setDayIndex] = useState(0);

  if (!business) return <NotFound title="Esta página de reservas no existe" />;

  if (flow.booking) {
    const when = new Date(flow.booking.startsAt);
    const text = `Hola ${business.name}, reservé ${flow.service.name} para el ${formatDay(when)} a las ${formatTime(when)}. Soy ${flow.booking.clientName}.`;
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pb-8 pt-8">
        <section className="animate-slide-in text-center">
          <CheckCircle2 size={56} className="mx-auto text-ok" aria-hidden />
          <h1 className="mt-3 font-display text-3xl font-extrabold">¡Cita reservada!</h1>
          <p className="mt-2 text-lg text-ink-soft">
            {flow.service.name} en {business.name}
            <br />
            <span className="font-semibold text-ink">
              {formatDay(when)} · {formatTime(when)}
            </span>
          </p>
        </section>
        <Card className="flex items-center justify-between p-4">
          <span>Pagado por adelantado {formatMoney(flow.service.price)}</span>
          <SimTag />
        </Card>
        {business.whatsapp && (
          <Button
            as="a"
            href={whatsappUrl(text, business.whatsapp)}
            target="_blank"
            rel="noreferrer"
            variant="whatsapp"
            size="lg"
          >
            <MessageCircle size={20} aria-hidden /> Avisar a la barbería por WhatsApp
          </Button>
        )}
        <p className="flex items-center justify-center gap-2 text-center text-sm text-muted">
          Te llegará un recordatorio antes de la cita. <SimTag />
        </p>
        <div className="mt-auto">
          <AgendoBadge slug={business.slug} />
        </div>
      </main>
    );
  }

  const day = flow.slots[Math.min(dayIndex, Math.max(flow.slots.length - 1, 0))];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pb-8 pt-6">
      <header className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-ink text-paper">
          <Scissors size={22} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold leading-tight">{business.name}</h1>
          <p className="text-sm text-muted">Reserva tu cita en menos de un minuto</p>
        </div>
      </header>

      <section aria-labelledby="services-title">
        <h2 id="services-title" className="mb-2 font-semibold">
          1. Elige el servicio
        </h2>
        <div className="flex flex-col gap-2">
          {business.services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                flow.chooseService(s.id);
                setDayIndex(0);
              }}
              aria-pressed={flow.service?.id === s.id}
              className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left transition ${flow.service?.id === s.id ? 'border-accent bg-accent-soft' : 'border-line bg-card'}`}
            >
              <span>
                <span className="block font-semibold">{s.name}</span>
                <span className="flex items-center gap-1 text-sm text-muted">
                  <Clock size={14} aria-hidden /> {s.minutes} min
                </span>
              </span>
              <span className="font-semibold">{formatMoney(s.price)}</span>
            </button>
          ))}
        </div>
      </section>

      {flow.service && (
        <section aria-labelledby="time-title" className="animate-slide-in">
          <h2 id="time-title" className="mb-2 font-semibold">
            2. Elige día y hora
          </h2>
          {flow.errors.slot && (
            <p role="alert" className="mb-2 text-sm font-medium text-accent-strong">
              {flow.errors.slot}
            </p>
          )}
          {flow.slots.length === 0 ? (
            <p className="text-ink-soft">No quedan horarios libres esta semana.</p>
          ) : (
            <>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
                {flow.slots.map((d, i) => (
                  <button
                    key={d.date.toISOString()}
                    type="button"
                    onClick={() => {
                      setDayIndex(i);
                      flow.chooseTime(null);
                    }}
                    aria-pressed={i === dayIndex}
                    className={`shrink-0 rounded-xl border px-4 py-2 font-semibold capitalize ${i === dayIndex ? 'border-ink bg-ink text-paper' : 'border-line bg-card'}`}
                  >
                    {formatShortDay(d.date)}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {day?.times.map((t) => (
                  <button
                    key={t.toISOString()}
                    type="button"
                    onClick={() => flow.chooseTime(t.toISOString())}
                    aria-pressed={flow.startsAt === t.toISOString()}
                    className={`min-h-11 rounded-xl border font-semibold ${flow.startsAt === t.toISOString() ? 'border-accent bg-accent text-white' : 'border-line bg-card'}`}
                  >
                    {formatTime(t)}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {flow.startsAt && (
        <form
          className="flex animate-slide-in flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            flow.confirm();
          }}
          noValidate
        >
          <h2 className="font-semibold">3. Tus datos</h2>
          <Field id="client-name" label="Nombre" error={flow.errors.name}>
            <input
              id="client-name"
              className={inputClass}
              autoComplete="name"
              value={flow.contact.name}
              onChange={(e) => flow.setContact({ name: e.target.value })}
            />
          </Field>
          <Field
            id="client-phone"
            label="WhatsApp"
            hint="Para mandarte el recordatorio."
            error={flow.errors.phone}
          >
            <input
              id="client-phone"
              className={inputClass}
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="8888 1234"
              value={flow.contact.phone}
              onChange={(e) => flow.setContact({ phone: e.target.value })}
            />
          </Field>
          <Button type="submit" size="lg">
            Reservar y pagar {formatMoney(flow.service.price)}
          </Button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted">
            <SimTag /> En este prototipo el pago no se cobra.
          </p>
        </form>
      )}

      <footer className="mt-auto pt-6">
        <AgendoBadge slug={business.slug} />
      </footer>
    </main>
  );
}
