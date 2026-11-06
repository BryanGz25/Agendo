import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Trash2 } from 'lucide-react';
import { PageHeader, Stat } from '../../../shared/components/DashboardLayout';
import { Button, Card, SimTag } from '../../../shared/components/ui';
import { formatMoney0, formatNumber, formatPercent } from '../../../shared/utils/format';
import { hasDemoData, loadDemoData } from '../../../services/demoSeed';
import { removeSimulatedData } from '../../../services/businessRepository';
import { platformStats } from '../utils/platformStats';

/** Stacked weekly bars: sign-ups from ads (dark) and from the badge (gold). */
function SignupChart({ weeks }) {
  const max = Math.max(1, ...weeks.map((w) => w.ads + w.badge));
  return (
    <figure>
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">Registros por semana (últimas 8)</span>
        <span className="flex gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-night" /> Anuncios
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-gold" /> Insignia
          </span>
        </span>
      </figcaption>
      <div
        className="flex h-48 items-end gap-2 sm:gap-3"
        role="img"
        aria-label={`Registros por semana: ${weeks.map((w) => w.ads + w.badge).join(', ')}`}
      >
        {weeks.map((w, i) => (
          <div key={w.week} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs font-semibold tabular-nums text-ink-soft">
              {w.ads + w.badge}
            </span>
            <div
              className="flex w-full flex-col justify-end overflow-hidden rounded-t-md"
              style={{ height: `${((w.ads + w.badge) / max) * 100}%` }}
            >
              <div className="bg-gold" style={{ flex: w.badge }} />
              <div className="bg-night" style={{ flex: w.ads }} />
            </div>
            <span className="text-[11px] text-muted">
              {i === weeks.length - 1 ? 'Esta' : `-${weeks.length - 1 - i}`}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export default function OverviewPage() {
  const { businesses, bookings } = useOutletContext();
  const [now] = useState(() => Date.now());
  const stats = useMemo(
    () => platformStats({ businesses, bookings, now }),
    [businesses, bookings, now],
  );
  const demo = hasDemoData();

  return (
    <>
      <PageHeader kicker="Resumen" title="Agendo hoy">
        {demo ? (
          <Button variant="outline" size="sm" onClick={removeSimulatedData}>
            <Trash2 size={16} aria-hidden /> Quitar datos simulados
          </Button>
        ) : (
          <Button size="sm" onClick={loadDemoData}>
            <Database size={16} aria-hidden /> Cargar datos de demostración
          </Button>
        )}
      </PageHeader>

      {demo && (
        <p className="-mt-4 mb-6 flex items-center gap-2 text-sm text-muted">
          <SimTag /> Hay 100 barberías simuladas con las proporciones del caso (62 de 100
          configuran, 22 llegan a uso habitual).
        </p>
      )}

      {stats.total === 0 ? (
        <Card className="border-dashed p-8 text-center">
          <p className="font-display text-2xl font-black">Todavía no hay barberías</p>
          <p className="mt-2 text-ink-soft">
            Crea una desde el registro o carga los datos de demostración.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              tone="dark"
              label="Barberías"
              value={formatNumber(stats.total)}
              hint={`${stats.trial} en prueba · ${stats.active} pagando`}
            />
            <Stat
              label="Ingreso mensual (MRR)"
              value={formatMoney0(stats.mrr)}
              hint="Anuales prorrateados a $20"
            />
            <Stat
              tone="gold"
              label="Primera reserva en 7 días"
              value={stats.activation7d == null ? '—' : formatPercent(stats.activation7d)}
              hint="Número de la semana · registros de 30 días"
            />
            <Stat
              label="Conversión a pago"
              value={stats.conversion == null ? '—' : formatPercent(stats.conversion)}
              hint="De las pruebas que terminaron"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Llegan a uso habitual"
              value={stats.habitualRate == null ? '—' : formatPercent(stats.habitualRate)}
              hint="20+ citas en la prueba"
            />
            <Stat
              label="Llegaron por la insignia"
              value={stats.fromBadge}
              hint="Cuestan $0 en anuncios"
            />
            <Stat label="Reservas en 7 días" value={formatNumber(stats.weekBookings)} />
            <Stat
              label="No pagaron al terminar"
              value={stats.cancelled}
              hint="Pruebas que no siguieron"
            />
          </div>

          <Card className="mt-6 p-5">
            <SignupChart weeks={stats.signupsByWeek} />
          </Card>
        </>
      )}
    </>
  );
}
