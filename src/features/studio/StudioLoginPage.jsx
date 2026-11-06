import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import Brand from '../../shared/components/Brand';
import { Button, Card, Field, SimTag, inputClass } from '../../shared/components/ui';
import { getBookings, listBusinesses, setCurrentBusiness } from '../../services/businessRepository';
import { loadDemoData } from '../../services/demoSeed';
import { useStoreValue } from '../../shared/hooks/useStoreValue';
import { normalizePhone } from '../../shared/utils/phone';

/**
 * Sign-in for barbershops. Without a backend there are no passwords: a shop
 * is found by its WhatsApp among the shops created on this device. A real
 * deployment would send a one-time code to that WhatsApp.
 */
export default function StudioLoginPage() {
  const navigate = useNavigate();
  const read = useCallback(() => listBusinesses(), []);
  const businesses = useStoreValue(read);
  const own = businesses.filter((b) => !b.simulated);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const open = (slug) => {
    setCurrentBusiness(slug);
    navigate(`/app/${slug}`);
  };

  const submit = (e) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    const found = businesses.find((b) => b.whatsapp === normalized);
    if (!found) {
      setError('No encontramos una barbería con ese WhatsApp en este dispositivo.');
      return;
    }
    open(found.slug);
  };

  const openDemo = () => {
    loadDemoData();
    // The simulated shop with the most upcoming bookings shows the panel best.
    const upcoming = (slug) =>
      getBookings(slug).filter((b) => b.status === 'confirmed' && new Date(b.startsAt) > new Date())
        .length;
    const demo = listBusinesses()
      .filter((b) => b.simulated)
      .sort((a, b) => upcoming(b.slug) - upcoming(a.slug))[0];
    if (demo) open(demo.slug);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-night text-paper">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Brand />
        <Link to="/empezar" className="font-label text-sm uppercase tracking-[0.14em] text-gold">
          Crear barbería
        </Link>
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-4 pb-16 md:grid-cols-2">
        <div>
          <p className="font-label text-sm uppercase tracking-[0.3em] text-gold">
            Panel de tu barbería
          </p>
          <h1 className="mt-4 font-display text-5xl font-black leading-tight">
            Tu agenda, tus clientes y tu link, <em className="text-gold">en un lugar.</em>
          </h1>
        </div>
        <Card className="p-6 text-ink">
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <Field id="login-phone" label="Tu WhatsApp" error={error}>
              <input
                id="login-phone"
                className={inputClass}
                inputMode="tel"
                placeholder="8888 1234"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
              />
            </Field>
            <Button type="submit" variant="dark">
              Entrar <ArrowRight size={16} aria-hidden />
            </Button>
          </form>

          {own.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-2 text-sm font-semibold text-muted">Barberías en este dispositivo</p>
              <ul className="flex flex-col gap-2">
                {own.map((b) => (
                  <li key={b.slug}>
                    <button
                      type="button"
                      onClick={() => open(b.slug)}
                      className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-3 text-left hover:border-gold"
                    >
                      <Store size={18} className="text-gold-strong" aria-hidden />
                      <span className="flex-1 font-semibold">{b.name}</span>
                      <ArrowRight size={16} className="text-muted" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 border-t border-line pt-5">
            <Button variant="outline" className="w-full" onClick={openDemo}>
              Entrar a una barbería de demostración <SimTag />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
