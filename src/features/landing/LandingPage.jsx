import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  Check,
  Menu,
  MessageCircle,
  Scissors,
  Wallet,
  X,
} from 'lucide-react';
import Brand from '../../shared/components/Brand';
import { track, newSession } from '../../services/analytics';
import { getBusiness } from '../../services/businessRepository';
import { UNIT_ECONOMICS } from '../../config/caseData';
import SceneBackground from './components/SceneBackground';
import PhoneMock from './components/PhoneMock';
import { useReveal } from './hooks/useReveal';

const NAV = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#tus-clientes', label: 'Tus clientes' },
  { href: '#precios', label: 'Precios' },
];

const STEPS = [
  {
    n: '01',
    title: 'Tu barbería',
    text: 'Nombre y WhatsApp. Nada de cédula jurídica ni régimen fiscal para empezar.',
  },
  {
    n: '02',
    title: 'Tus servicios',
    text: 'Corte, barba y corte con barba ya vienen cargados. Ajustas el precio con un toque.',
  },
  {
    n: '03',
    title: 'Tu horario',
    text: 'Lunes a sábado de 9 a 7, listo. Cierras un día o cambias la hora si quieres.',
  },
];

const MARQUEE = [
  'Corte',
  'Barba',
  'Corte con barba',
  'Reservas por WhatsApp',
  'Cobro por adelantado',
  'Recordatorios',
];

function CtaLink({ to, children, variant = 'gold', className = '' }) {
  const styles = {
    gold: 'bg-gold text-night hover:bg-[#d8b33a]',
    ghost: 'border border-paper/30 text-paper hover:border-gold hover:text-gold',
  };
  const Tag = to.startsWith('#') ? 'a' : Link;
  const target = to.startsWith('#') ? { href: to } : { to };
  return (
    <Tag
      {...target}
      className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-full px-7 font-label text-base font-medium uppercase tracking-[0.12em] transition ${styles[variant]} ${className}`}
    >
      {children}
    </Tag>
  );
}

/**
 * Marketing site. Starts with the ad's promise ("Más clientes para tu
 * barbería") over a scroll-driven 3D barbershop scene. `?ref=<slug>` marks
 * visitors that came from another barbershop's badge.
 */
export default function LandingPage() {
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const referrer = ref ? getBusiness(ref) : null;
  const scope = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useReveal(scope);

  // One funnel session per visit; the ref guard ignores StrictMode's double effect.
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    newSession();
    track('landing', ref ? { ref } : {});
  }, [ref]);

  const startLink = ref ? `/empezar?ref=${encodeURIComponent(ref)}` : '/empezar';

  return (
    <div ref={scope} className="relative text-paper">
      <SceneBackground />

      <header className="fixed inset-x-0 top-0 z-30 border-b border-paper/10 bg-night/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-label text-sm uppercase tracking-[0.14em] text-paper/80 hover:text-gold"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/ingresar"
              className="font-label text-sm uppercase tracking-[0.14em] text-paper/80 hover:text-gold"
            >
              Ingresar
            </Link>
            <CtaLink to={startLink} className="min-h-10 px-5 text-sm">
              Probar gratis
            </CtaLink>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <nav
            className="flex flex-col gap-1 border-t border-paper/10 px-4 pb-4 md:hidden"
            aria-label="Móvil"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 font-label uppercase tracking-[0.14em]"
              >
                {item.label}
              </a>
            ))}
            <Link to="/ingresar" className="py-3 font-label uppercase tracking-[0.14em]">
              Ingresar a mi barbería
            </Link>
            <CtaLink to={startLink} className="mt-2">
              Probar 14 días gratis
            </CtaLink>
          </nav>
        )}
      </header>

      <main>
        {/* HERO — asymmetric 7/5 */}
        <section className="mx-auto grid min-h-dvh max-w-7xl grid-cols-12 items-center px-4 pb-16 pt-28 md:px-8">
          <div className="col-span-12 md:col-span-7">
            {referrer && (
              <p className="mb-5 inline-flex rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 font-label text-sm uppercase tracking-[0.12em] text-gold">
                Viste Agendo en {referrer.name}
              </p>
            )}
            <p className="font-label text-sm uppercase tracking-[0.32em] text-gold">
              Reservas · Cobros · Recordatorios
            </p>
            <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.95] tracking-tight">
              Más clientes
              <br />
              para tu <em className="text-gold">barbería.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-paper/80 md:text-xl">
              Arma tu página de reservas en menos de 5 minutos desde el celular. Tus clientes
              reservan y pagan por adelantado desde un link de WhatsApp.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CtaLink to={startLink}>
                Crear mi página gratis <ArrowRight size={18} aria-hidden />
              </CtaLink>
              <CtaLink to="#como-funciona" variant="ghost">
                Ver cómo funciona
              </CtaLink>
            </div>
            <p className="mt-5 text-sm text-paper/60">
              14 días gratis · sin tarjeta · sin datos fiscales
            </p>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="overflow-hidden border-y border-gold/25 bg-night/60 py-4" aria-hidden>
          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 motion-reduce:animate-none">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-10 font-display text-2xl italic text-paper/80"
              >
                {item}
                <Scissors size={18} className="text-gold" />
              </span>
            ))}
          </div>
        </div>

        {/* PROBLEM — big number breaking the grid */}
        <section className="mx-auto grid max-w-7xl grid-cols-12 gap-y-10 px-4 py-28 md:px-8 md:py-40">
          <div className="col-span-12 md:col-span-5 md:col-start-7" data-reveal>
            <p className="font-label text-sm uppercase tracking-[0.3em] text-gold">
              Así nació Agendo
            </p>
            <p className="mt-4 font-display text-[clamp(6rem,18vw,13rem)] font-black leading-none text-paper">
              <span data-count="20">20</span>
              <span className="text-gold">%</span>
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              de las citas se perdían porque el cliente no llegaba.
            </h2>
            <p className="mt-5 text-lg text-paper/75">
              Pasaba en La Navaja, la barbería donde empezó todo. Con reserva desde un link,
              recordatorio por WhatsApp y cobro por adelantado, las ausencias bajaron casi a cero.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS — symmetric, numbered */}
        <section
          id="como-funciona"
          className="scroll-mt-16 border-t border-paper/10 bg-night/70 py-24 backdrop-blur-sm md:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid grid-cols-12 items-end gap-6" data-reveal>
              <h2 className="col-span-12 font-display text-4xl font-black md:col-span-7 md:text-6xl">
                Tu página lista en <em className="text-gold">3 pasos.</em>
              </h2>
              <p className="col-span-12 text-lg text-paper/70 md:col-span-4 md:col-start-9">
                Antes eran 4 pantallas y 28 minutos. Ahora son 3 pasos con todo precargado, y al
                terminar te damos el link para mandarlo por WhatsApp.
              </p>
            </div>
            <ol
              className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-paper/10 bg-paper/10 md:grid-cols-3"
              data-reveal-group
            >
              {STEPS.map((s) => (
                <li key={s.n} className="flex flex-col gap-4 bg-night-soft/95 p-8 md:p-10">
                  <span className="font-display text-6xl font-black italic text-gold/90">
                    {s.n}
                  </span>
                  <h3 className="font-label text-xl uppercase tracking-[0.12em]">{s.title}</h3>
                  <p className="text-paper/70">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CLIENT VIEW — asymmetric 5/7 with phone */}
        <section
          id="tus-clientes"
          className="mx-auto grid max-w-7xl scroll-mt-16 grid-cols-12 items-center gap-y-12 px-4 py-28 md:px-8 md:py-40"
        >
          <div className="col-span-12 flex justify-center md:col-span-5" data-reveal>
            <PhoneMock />
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7" data-reveal>
            <p className="font-label text-sm uppercase tracking-[0.3em] text-gold">
              Lo que ven tus clientes
            </p>
            <h2 className="mt-4 font-display text-4xl font-black md:text-6xl">
              Reservan en un minuto. <em className="text-gold">Pagan antes de llegar.</em>
            </h2>
            <ul className="mt-8 flex flex-col gap-5" data-reveal-group>
              {[
                {
                  icon: MessageCircle,
                  text: 'Abren tu link desde WhatsApp o Instagram, sin bajar ninguna app.',
                },
                { icon: Wallet, text: 'Eligen servicio, día y hora, y pagan por adelantado.' },
                {
                  icon: BellRing,
                  text: 'Les llega un recordatorio antes de la cita, y a ti el aviso de cada reserva.',
                },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-4 text-lg text-paper/85">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
                    <Icon size={18} aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <p className="mt-10 border-l-2 border-gold pl-5 text-paper/75">
              <strong className="text-paper">27 de cada 30</strong> barberías que comparten su link
              el primer día reciben una reserva durante la prueba.
            </p>
          </div>
        </section>

        {/* LOOP — stats band */}
        <section className="border-y border-gold/25 bg-gold text-night">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-12 md:px-8">
            <h2 className="font-display text-4xl font-black md:col-span-5 md:text-5xl" data-reveal>
              Cada cita trae a la próxima barbería.
            </h2>
            <dl className="grid grid-cols-2 gap-8 md:col-span-6 md:col-start-7" data-reveal-group>
              <div>
                <dt className="font-label text-sm uppercase tracking-[0.2em] text-night/70">
                  Barberías que ya usan Agendo
                </dt>
                <dd className="font-display text-5xl font-black" data-count="1150">
                  1150
                </dd>
              </div>
              <div>
                <dt className="font-label text-sm uppercase tracking-[0.2em] text-night/70">
                  Ciudades
                </dt>
                <dd className="font-display text-5xl font-black" data-count="9">
                  9
                </dd>
              </div>
              <div>
                <dt className="font-label text-sm uppercase tracking-[0.2em] text-night/70">
                  Visitas al mes a cada página
                </dt>
                <dd className="font-display text-5xl font-black" data-count="250">
                  250
                </dd>
              </div>
              <div>
                <dt className="font-label text-sm uppercase tracking-[0.2em] text-night/70">
                  NPS de los clientes
                </dt>
                <dd className="font-display text-5xl font-black" data-count="61">
                  61
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* PRICING — symmetric */}
        <section id="precios" className="scroll-mt-16 bg-night/80 py-24 backdrop-blur-sm md:py-32">
          <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
            <p className="font-label text-sm uppercase tracking-[0.3em] text-gold" data-reveal>
              Precios
            </p>
            <h2 className="mt-4 font-display text-4xl font-black md:text-6xl" data-reveal>
              Prueba 14 días. <em className="text-gold">Paga si te sirve.</em>
            </h2>
            <div className="mt-14 grid gap-6 text-left md:grid-cols-2" data-reveal-group>
              {[
                {
                  name: 'Mensual',
                  price: `$${UNIT_ECONOMICS.monthlyPrice}`,
                  per: 'al mes',
                  note: 'Cancelas cuando quieras.',
                },
                {
                  name: 'Anual',
                  price: `$${UNIT_ECONOMICS.annualPrice}`,
                  per: 'al año',
                  note: 'Equivale a $20 al mes: dos meses gratis.',
                  featured: true,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-3xl border p-8 md:p-10 ${plan.featured ? 'border-gold bg-gold/10' : 'border-paper/15 bg-night-soft/80'}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-label text-xl uppercase tracking-[0.14em]">{plan.name}</h3>
                    {plan.featured && (
                      <span className="rounded-full bg-gold px-3 py-1 font-label text-xs uppercase tracking-[0.14em] text-night">
                        Ahorra $60
                      </span>
                    )}
                  </div>
                  <p className="mt-6 font-display text-6xl font-black">
                    {plan.price}
                    <span className="ml-2 font-sans text-lg font-medium text-paper/60">
                      {plan.per}
                    </span>
                  </p>
                  <p className="mt-2 text-paper/70">{plan.note}</p>
                  <ul className="mt-8 flex flex-col gap-3 text-paper/85">
                    {[
                      'Página de reservas con tu link',
                      'Cobro por adelantado',
                      'Recordatorios por WhatsApp',
                      'Agenda y clientes en tu panel',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <Check size={18} className="text-gold" aria-hidden /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA — asymmetric */}
        <section className="mx-auto grid max-w-7xl grid-cols-12 px-4 py-28 md:px-8 md:py-40">
          <div className="col-span-12 md:col-span-8 md:col-start-3 md:text-center" data-reveal>
            <CalendarCheck size={40} className="text-gold md:mx-auto" aria-hidden />
            <h2 className="mt-6 font-display text-5xl font-black md:text-7xl">
              Tu primera reserva puede entrar <em className="text-gold">hoy.</em>
            </h2>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row md:justify-center">
              <CtaLink to={startLink}>
                Crear mi página gratis <ArrowRight size={18} aria-hidden />
              </CtaLink>
              <CtaLink to="/ingresar" variant="ghost">
                Ya tengo cuenta
              </CtaLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-paper/10 bg-night">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-paper/60 md:flex-row md:items-center md:justify-between md:px-8">
          <Brand />
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Pie de página">
            <Link to="/ingresar" className="hover:text-gold">
              Panel de mi barbería
            </Link>
            <Link to="/mis-citas" className="hover:text-gold">
              Mis citas
            </Link>
            <Link to="/admin" className="hover:text-gold">
              Administración
            </Link>
          </nav>
          <p>Prototipo del Caso B · Agendo. Caso ficticio con fines educativos.</p>
        </div>
      </footer>
    </div>
  );
}
