import { useState } from 'react';
import { Button, Field, inputClass } from '../../../shared/components/ui';

const FIELDS = [
  { id: 'taxId', label: 'Cédula jurídica o física', placeholder: '3-101-123456' },
  { id: 'legalName', label: 'Razón social', placeholder: 'La Navaja S.A.' },
  { id: 'taxRegime', label: 'Régimen fiscal', placeholder: 'Tradicional o simplificado' },
  { id: 'taxAddress', label: 'Dirección fiscal', placeholder: 'Provincia, cantón, distrito' },
];

/**
 * Fiscal data, moved from screen 1 to the end of the trial (Parte 2, punto 5).
 * It is only needed to bill the shop when the 14 days end.
 */
export default function BillingForm({ initial, onSave, onCancel }) {
  const [values, setValues] = useState(
    () => initial ?? Object.fromEntries(FIELDS.map((f) => [f.id, ''])),
  );
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (FIELDS.some((f) => !values[f.id].trim())) {
      setError('Completa los cuatro datos para poder facturarte.');
      return;
    }
    onSave(Object.fromEntries(FIELDS.map((f) => [f.id, values[f.id].trim()])));
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {FIELDS.map((f) => (
        <Field key={f.id} id={f.id} label={f.label}>
          <input
            id={f.id}
            className={inputClass}
            placeholder={f.placeholder}
            value={values[f.id]}
            onChange={(e) => {
              setValues((v) => ({ ...v, [f.id]: e.target.value }));
              setError('');
            }}
          />
        </Field>
      ))}
      {error && (
        <p role="alert" className="text-sm font-medium text-accent-strong">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="dark" className="flex-1">
          Guardar datos de cobro
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Después
        </Button>
      </div>
      <p className="text-xs text-muted">
        Estos datos se guardan solo en este navegador (prototipo).
      </p>
    </form>
  );
}
