import { AssumptionTag } from '../../../shared/components/ui';
import { formatPercentFine } from '../../../shared/utils/format';

const CONTROLS = [
  { key: 'business', label: 'Terminan nombre y WhatsApp' },
  { key: 'services', label: 'Terminan servicios' },
  { key: 'schedule', label: 'Terminan horario (página lista)' },
  { key: 'share', label: 'Comparten el link el primer día' },
];

/** The team's target for the new setup. Every value is an assumption. */
export default function TargetControls({ target, setTarget, reset }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Meta del nuevo flujo, de cada 100 trials</h3>
        <AssumptionTag />
      </div>
      {CONTROLS.map(({ key, label }) => (
        <label key={key} className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between font-medium">
            {label} <span className="tabular-nums font-bold">{target[key]}</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={target[key]}
            onChange={(e) => setTarget({ [key]: Number(e.target.value) })}
            className="accent-[var(--color-accent)]"
          />
        </label>
      ))}
      <label className="flex flex-col gap-1 text-sm">
        <span className="flex justify-between font-medium">
          Visitas de la insignia que empiezan un trial
          <span className="tabular-nums font-bold">
            {formatPercentFine(target.badgeConversion)}
          </span>
        </span>
        <input
          type="range"
          min="0"
          max="0.001"
          step="0.00001"
          value={target.badgeConversion}
          onChange={(e) => setTarget({ badgeConversion: Number(e.target.value) })}
          className="accent-[var(--color-accent)]"
        />
      </label>
      <button type="button" onClick={reset} className="self-start text-sm font-semibold text-blue">
        Volver a la meta propuesta
      </button>
    </div>
  );
}
