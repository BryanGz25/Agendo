import { Check, Plus } from 'lucide-react';
import { TEMPLATES } from '../../../config/caseData';
import { inputClass } from '../../../shared/components/ui';

/**
 * Template instead of a blank form: 90 % of barbershops offer these three
 * services and the most common prices are $8 to $15 (Parte 2). Durations are
 * a team assumption and editable.
 */
export default function StepServices({ data, errors, update }) {
  const setService = (id, patch) =>
    update({ services: data.services.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const addService = () =>
    update({
      services: [
        ...data.services,
        {
          id: `extra-${Date.now()}`,
          name: '',
          price: TEMPLATES.priceRange.min,
          minutes: 30,
          active: true,
        },
      ],
    });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl font-extrabold leading-tight">
          Tus servicios ya están listos
        </h1>
        <p className="mt-2 text-ink-soft">
          Son los que ofrece casi toda barbería. Ajusta el precio si quieres y sigue.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {data.services.map((s) => (
          <li
            key={s.id}
            className={`rounded-2xl border p-3 transition ${s.active ? 'border-ink/20 bg-card' : 'border-line bg-paper opacity-70'}`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setService(s.id, { active: !s.active })}
                aria-pressed={s.active}
                aria-label={
                  s.active ? `Quitar ${s.name || 'servicio'}` : `Activar ${s.name || 'servicio'}`
                }
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg border-2 ${s.active ? 'border-accent bg-accent text-white' : 'border-line bg-card'}`}
              >
                {s.active && <Check size={18} />}
              </button>
              <input
                aria-label="Nombre del servicio"
                className={`${inputClass} min-h-10 flex-1 border-transparent bg-transparent px-1 font-semibold`}
                value={s.name}
                placeholder="Nombre del servicio"
                onChange={(e) => setService(s.id, { name: e.target.value })}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 pl-11">
              <label className="flex items-center gap-1.5 text-sm text-muted">
                $
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  aria-label={`Precio de ${s.name || 'servicio'} en dólares`}
                  className={`${inputClass} min-h-10 px-2`}
                  value={s.price}
                  onChange={(e) => setService(s.id, { price: Number(e.target.value) })}
                />
              </label>
              <label className="flex items-center gap-1.5 text-sm text-muted">
                <input
                  type="number"
                  inputMode="numeric"
                  min="10"
                  step="5"
                  aria-label={`Duración de ${s.name || 'servicio'} en minutos`}
                  className={`${inputClass} min-h-10 px-2`}
                  value={s.minutes}
                  onChange={(e) => setService(s.id, { minutes: Number(e.target.value) })}
                />
                min
              </label>
            </div>
          </li>
        ))}
      </ul>
      {errors.services && (
        <p role="alert" className="text-sm font-medium text-accent-strong">
          {errors.services}
        </p>
      )}
      <button
        type="button"
        onClick={addService}
        className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-2 font-semibold text-blue"
      >
        <Plus size={18} aria-hidden /> Agregar otro servicio
      </button>
    </div>
  );
}
