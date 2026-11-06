import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, MessageCircle, Smartphone, Wallet } from 'lucide-react';
import { Button } from '../../shared/components/ui';
import { track, newSession } from '../../services/analytics';
import { getBusiness } from '../../services/businessRepository';

const BENEFITS = [
  { icon: MessageCircle, text: 'Tus clientes reservan desde un link de WhatsApp o Instagram' },
  { icon: Wallet, text: 'Cobras por adelantado: menos citas perdidas' },
  { icon: CalendarCheck, text: 'Recordatorio automático antes de cada cita' },
];

/**
 * Screen 1. Starts with the same promise as the ad ("Más clientes para tu
 * barbería") and asks for nothing. `?ref=<slug>` marks visitors that came from
 * another barbershop's badge, which closes the loop.
 */
export default function LandingPage() {
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const referrer = ref ? getBusiness(ref) : null;

  // One funnel session per visit. The ref guard keeps React StrictMode's
  // double effect in development from counting the visit twice.
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    newSession();
    track('landing', ref ? { ref } : {});
  }, [ref]);

  const startLink = ref ? `/empezar?ref=${encodeURIComponent(ref)}` : '/empezar';

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <span className="font-display text-2xl font-extrabold tracking-tight">agendo</span>
        <span className="text-sm font-medium text-muted">14 días gratis · sin tarjeta</span>
      </header>

      <section className="mt-10 flex-1 animate-slide-in">
        {referrer && (
          <p className="mb-4 inline-flex rounded-full bg-blue-soft px-3 py-1 text-sm font-semibold text-blue">
            Viste Agendo en {referrer.name}
          </p>
        )}
        <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight">
          Más clientes para tu barbería.
          <span className="block text-accent">Desde hoy.</span>
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Arma tu página de reservas en menos de 5 minutos desde el celular y compártela por
          WhatsApp.
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-2xl bg-card p-3.5">
              <span className="rounded-xl bg-accent-soft p-2 text-accent">
                <Icon size={20} aria-hidden />
              </span>
              <span className="font-medium">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="sticky bottom-4 mt-8 flex flex-col gap-3">
        <Button as={Link} to={startLink} size="lg" className="w-full">
          Crear mi página de reservas
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted">
          <Smartphone size={16} aria-hidden /> 3 pasos · solo nombre y WhatsApp para empezar
        </p>
      </div>
      <footer className="mt-6 text-center text-xs text-muted">
        Prototipo del Caso B · Agendo ·{' '}
        <Link to="/panel" className="font-semibold underline">
          Panel de Valeria
        </Link>
      </footer>
    </main>
  );
}
