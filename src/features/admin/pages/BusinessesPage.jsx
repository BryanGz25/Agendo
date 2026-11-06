import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ExternalLink, Search } from 'lucide-react';
import { PageHeader } from '../../../shared/components/DashboardLayout';
import { Card, SimTag, inputClass } from '../../../shared/components/ui';
import { setCurrentBusiness } from '../../../services/businessRepository';
import { platformStats } from '../utils/platformStats';

const STATUS = {
  trial: { label: 'En prueba', style: 'bg-blue-soft text-blue' },
  active: { label: 'Pagando', style: 'bg-ok-soft text-ok' },
  cancelled: { label: 'No pagó', style: 'bg-line text-muted' },
};
const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'trial', label: 'En prueba' },
  { id: 'active', label: 'Pagando' },
  { id: 'cancelled', label: 'No pagó' },
];

export default function BusinessesPage() {
  const { businesses, bookings } = useOutletContext();
  const [now] = useState(() => Date.now());
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const { businesses: rows } = useMemo(
    () => platformStats({ businesses, bookings, now }),
    [businesses, bookings, now],
  );

  const shown = rows.filter(
    (b) =>
      (filter === 'all' || b.status === filter) &&
      b.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageHeader kicker="Barberías" title={`${rows.length} barberías`} />
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div
          className="inline-flex flex-wrap rounded-xl border border-line bg-card p-1"
          role="tablist"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${filter === f.id ? 'bg-night text-paper' : 'text-ink-soft'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full md:max-w-xs">
          <span className="sr-only">Buscar barbería</span>
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            className={`${inputClass} pl-11`}
            placeholder="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="px-4 py-3 font-semibold">Barbería</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Origen</th>
              <th className="px-4 py-3 font-semibold">Días</th>
              <th className="px-4 py-3 font-semibold">Citas en prueba</th>
              <th className="px-4 py-3 font-semibold">1.ª reserva ≤ 7 días</th>
              <th className="px-4 py-3">
                <span className="sr-only">Abrir</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, 200).map((b) => (
              <tr key={b.slug} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{b.name}</p>
                  {b.simulated && <SimTag className="mt-1" />}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[b.status]?.style ?? STATUS.trial.style}`}
                  >
                    {STATUS[b.status]?.label ?? 'En prueba'}
                    {b.status === 'active' && b.plan === 'annual' ? ' · anual' : ''}
                  </span>
                </td>
                <td className="px-4 py-3">{b.source === 'badge' ? 'Insignia' : 'Anuncios'}</td>
                <td className="px-4 py-3 tabular-nums">{b.daysSinceSignup}</td>
                <td className="px-4 py-3 tabular-nums">
                  <span className={b.habitual ? 'font-bold text-ok' : ''}>{b.trialBookings}</span>
                </td>
                <td className="px-4 py-3">{b.activated7d ? 'Sí' : 'No'}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/app/${b.slug}`}
                    onClick={() => setCurrentBusiness(b.slug)}
                    className="inline-flex items-center gap-1 font-semibold text-blue"
                  >
                    Ver panel <ExternalLink size={14} aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && (
          <p className="p-6 text-ink-soft">No hay barberías con ese filtro.</p>
        )}
      </Card>
    </>
  );
}
