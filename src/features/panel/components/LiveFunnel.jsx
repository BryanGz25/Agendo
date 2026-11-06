import { useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  averageSecondsTo,
  funnelCounts,
  referralCount,
  resetFunnel,
} from '../../../services/analytics';
import { useStoreValue } from '../../../shared/hooks/useStoreValue';
import { Card, SimTag } from '../../../shared/components/ui';
import { formatNumber } from '../../../shared/utils/format';

/**
 * Real events from this browser: every pass through the prototype counts.
 * Useful in the demo and when another team tests the flow.
 */
export default function LiveFunnel() {
  const read = useCallback(
    () => ({
      counts: funnelCounts(),
      seconds: averageSecondsTo('schedule'),
      refs: referralCount(),
    }),
    [],
  );
  const { counts, seconds, refs } = useStoreValue(read);
  const top = Math.max(1, counts[0]?.count ?? 0);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Recorridos de prueba en este dispositivo</h3>
        <SimTag>Demo</SimTag>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {counts.map((c) => (
          <li key={c.id} className="flex items-center gap-3 text-sm">
            <span className="w-36 shrink-0">{c.label}</span>
            <div className="h-2.5 flex-1 rounded-full bg-line" aria-hidden>
              <div
                className="h-2.5 rounded-full bg-blue"
                style={{ width: `${(c.count / top) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right font-semibold tabular-nums">{c.count}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ink-soft">
        Tiempo promedio hasta tener la página lista:{' '}
        <strong>{seconds == null ? 'sin datos' : `${formatNumber(seconds / 60)} min`}</strong>
        {' · '}Llegaron por la insignia: <strong>{refs}</strong>
      </p>
      <button
        type="button"
        onClick={resetFunnel}
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-muted"
      >
        <RotateCcw size={14} aria-hidden /> Reiniciar conteo
      </button>
    </Card>
  );
}
