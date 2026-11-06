/* Small UI primitives shared by every feature. */

const BUTTON_VARIANTS = {
  primary:
    'bg-accent text-white hover:bg-accent-strong shadow-[0_6px_16px_-6px_rgba(200,68,31,0.6)]',
  dark: 'bg-ink text-paper hover:bg-ink-soft',
  whatsapp: 'bg-whatsapp text-white hover:brightness-95',
  outline: 'bg-card text-ink border border-line hover:border-ink-soft',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  as: Tag = 'button',
  ...props
}) {
  const sizes = {
    md: 'min-h-12 px-5 text-base',
    lg: 'min-h-14 px-6 text-lg',
    sm: 'min-h-10 px-3 text-sm',
  };
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-50 ${sizes[size]} ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ className = '', ...props }) {
  return <div className={`rounded-2xl border border-line bg-card ${className}`} {...props} />;
}

export function Field({ label, hint, error, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm font-medium text-accent-strong">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted">{hint}</p>
      )}
    </div>
  );
}

export const inputClass =
  'min-h-12 w-full rounded-xl border border-line bg-card px-4 text-base text-ink placeholder:text-muted/70 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30';

/** Required by the case rules: anything invented for the demo says "simulado". */
export function SimTag({ children = 'Simulado', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-warn-soft px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-warn ${className}`}
    >
      {children}
    </span>
  );
}

export function AssumptionTag({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-blue-soft px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-blue ${className}`}
    >
      Supuesto
    </span>
  );
}

export function StepProgress({ current, total, labels }) {
  return (
    <div aria-label={`Paso ${current} de ${total}`}>
      <div className="mb-2 flex justify-between text-xs font-semibold text-muted">
        <span>
          Paso {current} de {total}
        </span>
        <span>{labels?.[current - 1]}</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? 'bg-accent' : 'bg-line'}`}
          />
        ))}
      </div>
    </div>
  );
}
