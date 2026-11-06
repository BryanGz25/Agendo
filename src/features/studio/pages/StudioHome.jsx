import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MessageCircle, Scissors, Sparkles, Target } from 'lucide-react';
import { PageHeader, Stat } from '../../../shared/components/DashboardLayout';
import { Button, Card, SimTag } from '../../../shared/components/ui';
import { TRIAL_OUTCOMES } from '../../../config/caseData';
import { formatDay, formatMoney0 } from '../../../shared/utils/format';
import { whatsappUrl } from '../../../shared/utils/links';
import { shareMessage } from '../../../shared/utils/messages';
import { useStudio, useStudioStats } from '../hooks/useStudio';
import BookingRow from '../components/BookingRow';

export default function StudioHome() {
  const { business, bookings, simulate } = useStudio();
  const [now] = useState(() => Date.now());
  const stats = useStudioStats(business, bookings, now);
  const goal = TRIAL_OUTCOMES.habitualThreshold;
  const progress = Math.min(1, stats.trialBookings / goal);
  const next = stats.upcoming.slice(0, 4);
  const serviceOf = (b) => business.services.find((s) => s.id === b.serviceId);

  return (
    <>
      <PageHeader
        kicker={formatDay(new Date(now))}
        title={`Hola, ${business.name.split(' · ')[0]}`}
      >
        <Button
          as="a"
          href={whatsappUrl(shareMessage(business))}
          target="_blank"
          rel="noreferrer"
          variant="whatsapp"
          size="sm"
        >
          <MessageCircle size={16} aria-hidden /> Compartir mi link
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Citas hoy" value={stats.today.length} tone="dark" />
        <Stat label="Reservas en 7 días" value={stats.weekCount} />
        <Stat
          label="Cobrado en 7 días"
          value={formatMoney0(stats.weekRevenue)}
          hint="Pagado por adelantado"
        />
        <Stat
          label="Clientes"
          value={stats.clients}
          hint={stats.noShows ? `${stats.noShows} no llegaron` : 'Sin ausencias'}
        />
      </div>

      {business.status === 'trial' && (
        <Card className="mt-6 overflow-hidden">
          <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="flex items-center gap-2 font-label text-sm uppercase tracking-[0.18em] text-gold-strong">
                <Target size={16} aria-hidden /> Prueba gratis · quedan {stats.daysLeft} días
              </p>
              <p className="mt-2 font-display text-2xl font-black">
                {stats.trialBookings >= goal
                  ? `¡${stats.trialBookings} citas! Tu agenda ya trabaja sola`
                  : `${stats.trialBookings} de ${goal} citas en tu prueba`}
              </p>
              <p className="mt-1 text-ink-soft">
                Con {goal} citas tu agenda ya trabaja sola. Lo que más las trae es mandar tu link
                por WhatsApp a tus clientes de confianza.
              </p>
            </div>
            <Button as={Link} to="mi-pagina" variant="dark">
              Compartir mi página <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
          <div
            className="h-2 bg-line"
            role="progressbar"
            aria-valuenow={stats.trialBookings}
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-label="Avance de la prueba"
          >
            <div className="h-2 bg-gold transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </Card>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl font-black">Próximas citas</h2>
            <Link to="agenda" className="text-sm font-semibold text-blue">
              Ver agenda
            </Link>
          </div>
          {next.length === 0 ? (
            <Card className="border-dashed p-6 text-ink-soft">
              <p>Todavía no hay citas próximas. Manda tu link a 5 clientes de confianza.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={simulate}>
                <Sparkles size={16} aria-hidden /> Simular una reserva <SimTag />
              </Button>
            </Card>
          ) : (
            <ul className="flex flex-col gap-2">
              {next.map((b) => (
                <BookingRow key={b.id} booking={b} service={serviceOf(b)} />
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-black">Ajustes rápidos</h2>
          {[
            {
              to: 'servicios',
              icon: Scissors,
              title: 'Servicios y precios',
              text: `${business.services.length} servicios activos`,
            },
            {
              to: 'horario',
              icon: Clock,
              title: 'Horario',
              text: `${business.schedule.filter((d) => d.open).length} días abiertos`,
            },
          ].map(({ to, icon: Icon, title, text }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition hover:border-gold"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-night text-gold">
                <Icon size={20} aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="text-sm text-muted">{text}</span>
              </span>
              <ArrowRight size={18} className="text-muted" aria-hidden />
            </Link>
          ))}
          <Stat
            label="Cobrado desde que empezaste"
            value={formatMoney0(stats.totalRevenue)}
            tone="gold"
          />
        </div>
      </section>
    </>
  );
}
