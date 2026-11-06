import { useMemo, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { PageHeader } from '../../../shared/components/DashboardLayout';
import { Card, inputClass } from '../../../shared/components/ui';
import { formatDay, formatMoney0 } from '../../../shared/utils/format';
import { formatPhone } from '../../../shared/utils/phone';
import { whatsappUrl } from '../../../shared/utils/links';
import { useStudio } from '../hooks/useStudio';

/** Clients built from bookings: visits, spend and last visit. */
export default function StudioClients() {
  const { business, bookings } = useStudio();
  const [query, setQuery] = useState('');

  const clients = useMemo(() => {
    const map = new Map();
    bookings
      .filter((b) => b.status !== 'cancelled')
      .forEach((b) => {
        const price = business.services.find((s) => s.id === b.serviceId)?.price ?? 0;
        const entry = map.get(b.clientPhone) ?? {
          phone: b.clientPhone,
          name: b.clientName,
          visits: 0,
          spent: 0,
          last: b.startsAt,
          simulated: b.simulated,
        };
        entry.visits += 1;
        entry.spent += price;
        if (b.startsAt > entry.last) entry.last = b.startsAt;
        map.set(b.clientPhone, entry);
      });
    return [...map.values()].sort((a, b) => b.visits - a.visits);
  }, [bookings, business]);

  const shown = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query.replace(/\D/g, '')),
  );

  return (
    <>
      <PageHeader kicker="Clientes" title={`${clients.length} clientes`} />
      <label className="relative mb-6 block max-w-md">
        <span className="sr-only">Buscar cliente</span>
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          className={`${inputClass} pl-11`}
          placeholder="Buscar por nombre o WhatsApp"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {shown.length === 0 ? (
        <Card className="border-dashed p-6 text-ink-soft">
          Tus clientes aparecen aquí cuando reservan.
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Visitas</th>
                <th className="px-4 py-3 font-semibold">Gastado</th>
                <th className="px-4 py-3 font-semibold">Última cita</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.phone} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-muted">{formatPhone(c.phone)}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{c.visits}</td>
                  <td className="px-4 py-3 tabular-nums">{formatMoney0(c.spent)}</td>
                  <td className="px-4 py-3 first-letter:uppercase">
                    {formatDay(new Date(c.last))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={whatsappUrl(
                        `Hola ${c.name.replace(/ \(simulado\)$/, '')}, ¿te agendo tu próximo corte? Reserva aquí.`,
                        c.phone,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-whatsapp"
                      aria-label={`Escribir a ${c.name}`}
                    >
                      <MessageCircle size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
