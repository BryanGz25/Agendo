import { Clock, Scissors } from 'lucide-react';

const SERVICES = [
  { name: 'Corte', minutes: 30, price: 10 },
  { name: 'Barba', minutes: 20, price: 8 },
  { name: 'Corte con barba', minutes: 45, price: 15, active: true },
];
const TIMES = ['9:00', '9:45', '10:30', '11:15', '2:00', '2:45'];

/** Illustration of the public booking page inside a phone frame (example data). */
export default function PhoneMock() {
  return (
    <figure className="relative w-[290px] rotate-[-4deg] rounded-[2.6rem] border border-gold/40 bg-night p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
      <div className="overflow-hidden rounded-[2rem] bg-paper text-ink">
        <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-night" />
        <div className="flex items-center gap-3 px-5 pb-3 pt-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-ink text-paper">
            <Scissors size={18} aria-hidden />
          </span>
          <div>
            <p className="font-display text-lg font-black leading-tight">La Navaja</p>
            <p className="text-xs text-muted">Reserva tu cita</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${s.active ? 'border-accent bg-accent-soft' : 'border-line bg-card'}`}
            >
              <span>
                <span className="block font-semibold">{s.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock size={11} aria-hidden /> {s.minutes} min
                </span>
              </span>
              <span className="font-semibold">${s.price}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 px-4">
          {TIMES.map((t, i) => (
            <span
              key={t}
              className={`rounded-lg border py-1.5 text-center text-xs font-semibold ${i === 2 ? 'border-accent bg-accent text-white' : 'border-line bg-card'}`}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="m-4 rounded-xl bg-accent py-3 text-center text-sm font-semibold text-white">
          Reservar y pagar $15
        </div>
        <div className="mx-4 mb-5 rounded-xl bg-ink px-3 py-2.5 text-[11px] text-paper/90">
          <span className="block font-label uppercase tracking-[0.14em] text-gold">
            Reservado con Agendo
          </span>
          ¿Tienes una barbería? Prueba 14 días gratis
        </div>
      </div>
      <figcaption className="sr-only">Ejemplo de la página de reservas de una barbería</figcaption>
    </figure>
  );
}
