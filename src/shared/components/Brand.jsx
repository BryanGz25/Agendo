import { useId } from 'react';
import { Link } from 'react-router-dom';

/** Wordmark: a tiny barber pole next to the name. */
export function PoleMark({ className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 16 32" className={className} aria-hidden>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x="3" y="5" width="10" height="22" rx="2" />
        </clipPath>
        <pattern
          id={`${id}-stripes`}
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-35)"
        >
          <rect width="10" height="10" fill="#f3ebdd" />
          <rect width="10" height="3" fill="#a3261d" />
          <rect y="5" width="10" height="3" fill="#1f4e8c" />
        </pattern>
      </defs>
      <rect
        x="3"
        y="5"
        width="10"
        height="22"
        fill={`url(#${id}-stripes)`}
        clipPath={`url(#${id}-clip)`}
      />
      <rect x="2" y="2" width="12" height="3.5" rx="1.5" fill="#c9a227" />
      <rect x="2" y="26.5" width="12" height="3.5" rx="1.5" fill="#c9a227" />
    </svg>
  );
}

export default function Brand({ to = '/', tone = 'light', className = '' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="Agendo, inicio"
    >
      <PoleMark className="h-8 w-4" />
      <span
        className={`font-display text-2xl font-black italic tracking-tight ${tone === 'light' ? 'text-paper' : 'text-ink'}`}
      >
        Agendo
      </span>
    </Link>
  );
}
