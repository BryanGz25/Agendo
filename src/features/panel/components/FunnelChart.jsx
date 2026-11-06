import { formatPercent } from '../../../shared/utils/format';

/** Horizontal bars: trials that finish each screen, per 100 trials. */
export default function FunnelChart({ title, steps, tone, highlightId }) {
  const bar = tone === 'today' ? 'bg-ink-soft' : 'bg-accent';
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-semibold">{title}</figcaption>
      <ul className="flex flex-col gap-2.5">
        {steps.map((s) => (
          <li key={s.id}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span
                className={s.id === highlightId ? 'font-bold text-accent-strong' : 'font-medium'}
              >
                {s.label}
              </span>
              <span className="tabular-nums text-ink-soft">
                {s.completed} de {s.reached} · pasa {formatPercent(s.passRate)}
                {s.minutes != null && ` · ${s.minutes} min`}
              </span>
            </div>
            <div className="h-3 rounded-full bg-line" aria-hidden>
              <div className={`h-3 rounded-full ${bar}`} style={{ width: `${s.completed}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
