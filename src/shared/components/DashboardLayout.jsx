import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Brand from './Brand';

/**
 * Shell for both panels: a dark leather sidebar on desktop and a bottom tab
 * bar on phones (81 % of barbers sign up from a phone). Symmetric and calm,
 * so the numbers carry the page.
 * @param {{title:string, subtitle?:string, nav:{to:string,label:string,icon:Function,end?:boolean,short?:string}[], onSignOut?:()=>void, badge?:React.ReactNode, context?:object}} props
 */
export default function DashboardLayout({ title, subtitle, nav, onSignOut, badge, context }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition ${isActive ? 'bg-gold text-night' : 'text-paper/75 hover:bg-paper/10 hover:text-paper'}`;

  return (
    <div className="min-h-dvh bg-paper text-ink md:grid md:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 bg-night px-4 py-6 text-paper md:flex">
        <Brand className="px-2" />
        <div className="rounded-2xl border border-paper/10 bg-night-soft p-4">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold">{subtitle}</p>
          <p className="mt-1 font-display text-lg font-bold leading-tight">{title}</p>
          {badge && <div className="mt-2">{badge}</div>}
        </div>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Panel">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-paper/60 hover:text-paper"
          >
            <LogOut size={18} aria-hidden /> Salir
          </button>
        )}
      </aside>

      <div className="flex min-w-0 flex-col pb-24 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="min-w-0">
            <p className="font-label text-[11px] uppercase tracking-[0.2em] text-gold-strong">
              {subtitle}
            </p>
            <p className="truncate font-display text-lg font-bold">{title}</p>
          </div>
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg p-2 text-muted"
              aria-label="Salir"
            >
              <LogOut size={20} />
            </button>
          )}
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-10 md:py-10">
          <Outlet context={context} />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-paper/10 bg-night px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden"
        aria-label="Panel"
      >
        {nav.slice(0, 5).map(({ to, label, icon: Icon, end, short }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium ${isActive ? 'text-gold' : 'text-paper/65'}`
            }
          >
            <Icon size={20} aria-hidden />
            <span className="truncate">{short ?? label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/** Page heading used inside both panels. */
export function PageHeader({ kicker, title, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {kicker && (
          <p className="font-label text-xs uppercase tracking-[0.25em] text-gold-strong">
            {kicker}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** KPI tile. */
export function Stat({ label, value, hint, tone = 'default' }) {
  const tones = {
    default: 'bg-card border-line',
    dark: 'bg-night text-paper border-night',
    gold: 'bg-gold-soft border-gold/40',
  };
  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${tones[tone]}`}>
      <p className={`text-sm font-medium ${tone === 'dark' ? 'text-paper/70' : 'text-muted'}`}>
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-black tabular-nums">{value}</p>
      {hint && (
        <p className={`mt-1 text-sm ${tone === 'dark' ? 'text-paper/60' : 'text-ink-soft'}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
