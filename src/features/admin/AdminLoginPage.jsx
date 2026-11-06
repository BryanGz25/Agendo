import { useState } from 'react';
import { Lock } from 'lucide-react';
import Brand from '../../shared/components/Brand';
import { Button, Card, Field, inputClass } from '../../shared/components/ui';
import { ADMIN_PIN, signInAdmin } from '../../services/adminSession';

export default function AdminLoginPage({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (signInAdmin(pin)) onSuccess();
    else setError('PIN incorrecto.');
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-night px-4 text-paper">
      <Brand />
      <Card className="w-full max-w-sm p-6 text-ink">
        <p className="flex items-center gap-2 font-label text-sm uppercase tracking-[0.2em] text-gold-strong">
          <Lock size={16} aria-hidden /> Administración
        </p>
        <h1 className="mt-2 font-display text-3xl font-black">Panel de Valeria</h1>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
          <Field
            id="admin-pin"
            label="PIN de acceso"
            error={error}
            hint={`Acceso de demostración. PIN: ${ADMIN_PIN}`}
          >
            <input
              id="admin-pin"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
            />
          </Field>
          <Button type="submit" variant="dark">
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
}
