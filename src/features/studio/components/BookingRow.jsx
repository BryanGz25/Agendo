import { Check, MessageCircle, UserX, X } from 'lucide-react';
import { BOOKING_STATUS, updateBooking } from '../../../services/businessRepository';
import { SimTag } from '../../../shared/components/ui';
import { formatMoney, formatTime } from '../../../shared/utils/format';
import { formatPhone } from '../../../shared/utils/phone';
import { whatsappUrl } from '../../../shared/utils/links';

const STATUS_STYLE = {
  confirmed: 'bg-blue-soft text-blue',
  done: 'bg-ok-soft text-ok',
  noshow: 'bg-warn-soft text-warn',
  cancelled: 'bg-line text-muted line-through',
};

/** One appointment with quick actions for the barber. */
export default function BookingRow({ booking, service, actions = true }) {
  const when = new Date(booking.startsAt);
  const set = (status) => updateBooking(booking.id, { status });

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex w-20 shrink-0 flex-col">
        <span className="font-display text-xl font-black tabular-nums">{formatTime(when)}</span>
        <span className="text-xs text-muted">{service?.minutes ?? 30} min</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{booking.clientName}</p>
        <p className="text-sm text-ink-soft">
          {service?.name ?? 'Servicio'} · {formatMoney(service?.price ?? 0)} pagado
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[booking.status ?? 'confirmed']}`}
          >
            {BOOKING_STATUS[booking.status ?? 'confirmed']}
          </span>
          {booking.simulated && <SimTag />}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap gap-1.5">
          <a
            href={whatsappUrl(
              `Hola ${booking.clientName.replace(/ \(simulado\)$/, '')}, te escribo de tu cita.`,
              booking.clientPhone,
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-line text-whatsapp hover:border-whatsapp"
            aria-label={`Escribir a ${booking.clientName} por WhatsApp (${formatPhone(booking.clientPhone)})`}
          >
            <MessageCircle size={18} />
          </a>
          {booking.status === 'confirmed' && (
            <>
              <button
                type="button"
                onClick={() => set('done')}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-line text-ok hover:border-ok"
                aria-label="Marcar como atendida"
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                onClick={() => set('noshow')}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-line text-warn hover:border-warn"
                aria-label="Marcar que no llegó"
              >
                <UserX size={18} />
              </button>
              <button
                type="button"
                onClick={() => set('cancelled')}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-line text-accent hover:border-accent"
                aria-label="Cancelar cita"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
