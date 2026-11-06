import { Check, Plus } from 'lucide-react';
import { TEMPLATES } from '../../config/caseData';
import { inputClass } from './ui';

/**
 * Editable list of services (name, price in dollars, minutes). Used by the
 * setup's template step and by the barbershop panel.
 * @param {{services:object[], onChange:(services:object[])=>void, error?:string, toggleable?:boolean}} props
 */
export default function ServicesEditor({ services, onChange, error, toggleable = true }) {
  const setService = (id, patch) =>
    onChange(services.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addService = () =>
    onChange([
      ...services,
      {
        id: `extra-${Date.now()}`,
        name: '',
        price: TEMPLATES.priceRange.min,
        minutes: 30,
        active: true,
      },
    ]);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {services.map((s) => {
          const active = s.active !== false;
          return (
            <li
              key={s.id}
              className={`rounded-2xl border p-3 transition ${active ? 'border-ink/15 bg-card' : 'border-line bg-paper opacity-70'}`}
            >
              <div className="flex items-center gap-3">
                {toggleable && (
                  <button
                    type="button"
                    onClick={() => setService(s.id, { active: !active })}
                    aria-pressed={active}
                    aria-label={
                      active ? `Quitar ${s.name || 'servicio'}` : `Activar ${s.name || 'servicio'}`
                    }
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg border-2 ${active ? 'border-accent bg-accent text-white' : 'border-line bg-card'}`}
                  >
                    {active && <Check size={18} />}
                  </button>
                )}
                <input
                  aria-label="Nombre del servicio"
                  className={`${inputClass} min-h-10 flex-1 border-transparent bg-transparent px-1 font-semibold`}
                  value={s.name}
                  placeholder="Nombre del servicio"
                  onChange={(e) => setService(s.id, { name: e.target.value })}
                />
              </div>
              <div className={`mt-2 grid grid-cols-2 gap-2 ${toggleable ? 'pl-11' : ''}`}>
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
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="text-sm font-medium text-accent-strong">
          {error}
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
