import { TEMPLATES } from '../../config/caseData';
import { inputClass } from './ui';

/**
 * Weekly schedule for the whole shop (open/closed and hours per day).
 * @param {{schedule:object[], onChange:(schedule:object[])=>void, error?:string}} props
 */
export default function ScheduleEditor({ schedule, onChange, error }) {
  const setDay = (day, patch) =>
    onChange(schedule.map((d) => (d.day === day ? { ...d, ...patch } : d)));

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-card">
        {TEMPLATES.week.map(({ day, label }) => {
          const rule = schedule.find((d) => d.day === day);
          return (
            <li key={day} className="flex min-h-14 items-center gap-2 px-3 py-2">
              <label className="flex w-[6.75rem] shrink-0 items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  className="size-5 accent-[var(--color-accent)]"
                  checked={rule.open}
                  onChange={(e) => setDay(day, { open: e.target.checked })}
                />
                {label}
              </label>
              {rule.open ? (
                <div className="flex min-w-0 flex-1 items-center gap-1 text-sm">
                  <input
                    type="time"
                    aria-label={`Apertura ${label}`}
                    className={`${inputClass} min-h-10 min-w-0 px-1.5 text-sm`}
                    value={rule.start}
                    onChange={(e) => setDay(day, { start: e.target.value })}
                  />
                  <span className="text-muted">a</span>
                  <input
                    type="time"
                    aria-label={`Cierre ${label}`}
                    className={`${inputClass} min-h-10 min-w-0 px-1.5 text-sm`}
                    value={rule.end}
                    onChange={(e) => setDay(day, { end: e.target.value })}
                  />
                </div>
              ) : (
                <span className="flex-1 text-sm text-muted">Cerrado</span>
              )}
            </li>
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="text-sm font-medium text-accent-strong">
          {error}
        </p>
      )}
    </div>
  );
}
