import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, FileText, Link2, MessageCircle, Target } from 'lucide-react';
import { Button, Card, SimTag } from '../../shared/components/ui';
import NotFound from '../../shared/components/NotFound';
import { getBusiness, updateBusiness } from '../../services/businessRepository';
import { useStoreValue } from '../../shared/hooks/useStoreValue';
import { TEMPLATES, TRIAL_OUTCOMES } from '../../config/caseData';
import { bookingUrl, whatsappUrl } from '../../shared/utils/links';
import { formatDay, formatMoney, formatTime } from '../../shared/utils/format';
import { useFirstBooking } from '../../shared/hooks/useFirstBooking';
import { shareMessage } from '../../shared/utils/messages';
import BillingForm from './components/BillingForm';

const DAY = 86400000;

/** The barber's home during the trial: bookings, progress to habit, billing later. */
export default function AgendaPage() {
  const { slug } = useParams();
  const read = useCallback(() => getBusiness(slug), [slug]);
  const business = useStoreValue(read);
  const { bookings, simulate } = useFirstBooking(business);
  const [editingBilling, setEditingBilling] = useState(false);
  const [now] = useState(() => Date.now());

  if (!business) return <NotFound />;

  const elapsed = Math.floor((now - new Date(business.createdAt).getTime()) / DAY);
  const daysLeft = Math.max(0, TEMPLATES.trialDays - elapsed);
  const goal = TRIAL_OUTCOMES.habitualThreshold;
  const progress = Math.min(1, bookings.length / goal);
  const upcoming = bookings.filter((b) => new Date(b.startsAt).getTime() >= now - 3600000);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pb-10 pt-6">
      <header>
        <p className="text-sm font-semibold text-muted">Prueba gratis · quedan {daysLeft} días</p>
        <h1 className="font-display text-3xl font-extrabold">{business.name}</h1>
      </header>

      <Card className="p-4">
        <p className="flex items-center gap-2 font-semibold">
          <Target size={18} className="text-accent" aria-hidden /> {bookings.length} de {goal} citas
          en la prueba
        </p>
        <div
          className="mt-2 h-2 rounded-full bg-line"
          role="progressbar"
          aria-valuenow={bookings.length}
          aria-valuemin={0}
          aria-valuemax={goal}
        >
          <div
            className="h-2 rounded-full bg-accent transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Con {goal} citas tu agenda ya trabaja sola. Compartir el link es lo que más las trae.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          as="a"
          href={whatsappUrl(shareMessage(business))}
          target="_blank"
          rel="noreferrer"
          variant="whatsapp"
        >
          <MessageCircle size={18} aria-hidden /> Compartir
        </Button>
        <Button
          as="a"
          href={bookingUrl(business)}
          target="_blank"
          rel="noreferrer"
          variant="outline"
        >
          <Link2 size={18} aria-hidden /> Mi página
        </Button>
      </div>

      <section aria-labelledby="upcoming">
        <h2 id="upcoming" className="mb-2 flex items-center gap-2 font-semibold">
          <CalendarDays size={18} aria-hidden /> Próximas citas
        </h2>
        {upcoming.length === 0 ? (
          <Card className="border-dashed p-4 text-ink-soft">
            Todavía no hay citas. Manda tu link por WhatsApp a 5 clientes de confianza.
            <Button variant="ghost" size="sm" className="mt-2" onClick={simulate}>
              Simular una reserva <SimTag />
            </Button>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((b) => {
              const service = business.services.find((s) => s.id === b.serviceId);
              const when = new Date(b.startsAt);
              return (
                <li key={b.id}>
                  <Card className="flex items-center justify-between gap-2 p-3">
                    <div>
                      <p className="font-semibold first-letter:uppercase">
                        {formatDay(when)} · {formatTime(when)}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {b.clientName} · {service?.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-ok">
                        Pagado {formatMoney(service?.price ?? 0)}
                      </span>
                      {b.simulated && <SimTag />}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Card className="p-4">
        <p className="flex items-center gap-2 font-semibold">
          <FileText size={18} aria-hidden /> Datos de cobro
        </p>
        {editingBilling ? (
          <div className="mt-3">
            <BillingForm
              initial={business.billing}
              onSave={(billing) => {
                updateBusiness(business.slug, { billing });
                setEditingBilling(false);
              }}
              onCancel={() => setEditingBilling(false)}
            />
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-soft">
              {business.billing
                ? `Listo: ${business.billing.legalName}.`
                : 'Los necesitamos solo para facturarte cuando termine la prueba. Puedes hacerlo después.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setEditingBilling(true)}
            >
              {business.billing ? 'Editar' : 'Completar ahora'}
            </Button>
          </>
        )}
      </Card>

      <Link to="/" className="mt-2 text-center text-sm font-semibold text-muted underline">
        Crear otra barbería
      </Link>
    </main>
  );
}
