import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader, Stat } from '../../../shared/components/DashboardLayout';
import { Card, SimTag } from '../../../shared/components/ui';
import { BOOKING_STATUS } from '../../../services/businessRepository';
import { formatDay, formatMoney0, formatPercent, formatTime } from '../../../shared/utils/format';

export default function BookingsPage() {
  const { businesses, bookings } = useOutletContext();
  const bySlug = useMemo(() => new Map(businesses.map((b) => [b.slug, b])), [businesses]);

  const live = bookings.filter((b) => b.status !== 'cancelled');
  const past = bookings.filter((b) => b.status === 'done' || b.status === 'noshow');
  const noShowRate = past.length
    ? bookings.filter((b) => b.status === 'noshow').length / past.length
    : null;
  const revenue = live.reduce((sum, b) => {
    const shop = bySlug.get(b.slug);
    return sum + (shop?.services.find((s) => s.id === b.serviceId)?.price ?? 0);
  }, 0);

  return (
    <>
      <PageHeader kicker="Reservas" title="Todas las reservas" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat tone="dark" label="Reservas" value={live.length} />
        <Stat
          label="Cobrado por adelantado"
          value={formatMoney0(revenue)}
          hint="Lo que pagaron los clientes a las barberías"
        />
        <Stat
          label="No llegaron"
          value={noShowRate == null ? '—' : formatPercent(noShowRate)}
          hint="Antes de Agendo: cerca del 20 %"
        />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Barbería</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Servicio</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 150).map((b) => {
              const shop = bySlug.get(b.slug);
              const service = shop?.services.find((s) => s.id === b.serviceId);
              const when = new Date(b.startsAt);
              return (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 first-letter:uppercase">
                    {formatDay(when)} · {formatTime(when)}
                  </td>
                  <td className="px-4 py-3 font-semibold">{shop?.name ?? b.slug}</td>
                  <td className="px-4 py-3">
                    {b.clientName} {b.simulated && <SimTag className="ml-1" />}
                  </td>
                  <td className="px-4 py-3">{service?.name ?? '—'}</td>
                  <td className="px-4 py-3">{BOOKING_STATUS[b.status ?? 'confirmed']}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="p-6 text-ink-soft">Todavía no hay reservas.</p>}
        {bookings.length > 150 && (
          <p className="p-4 text-sm text-muted">
            Se muestran las 150 más recientes de {bookings.length}.
          </p>
        )}
      </Card>
    </>
  );
}
