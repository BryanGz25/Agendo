import { ArrowRight, CalendarCheck } from 'lucide-react';
import { signupUrl } from '../../../shared/utils/links';

/**
 * The loop. Today the badge only shows the name and links nowhere (8 new
 * barbershops a month out of ~287,500 visits). Now it speaks to the barbers
 * among the clients and carries the referrer, so the sign-up knows its origin.
 */
export default function AgendoBadge({ slug }) {
  return (
    <a
      href={signupUrl(slug)}
      className="group flex items-center gap-3 rounded-2xl bg-ink p-4 text-paper transition hover:bg-ink-soft"
    >
      <span className="rounded-xl bg-paper/10 p-2">
        <CalendarCheck size={22} aria-hidden />
      </span>
      <span className="flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-paper/70">
          Reservado con Agendo
        </span>
        <span className="block font-semibold">
          ¿Tienes una barbería? Recibe más clientes. Prueba 14 días gratis
        </span>
      </span>
      <ArrowRight size={20} className="transition group-hover:translate-x-1" aria-hidden />
    </a>
  );
}
