import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { BellRing, X } from 'lucide-react';

const ToastContext = createContext(null);

/** Push-style notifications (the "first booking" moment uses this). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    ({ title, body, tone = 'ok', duration = 6000 }) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((list) => [...list, { id, title, body, tone }]);
      if (duration) window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-3"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-md animate-toast-in items-start gap-3 rounded-2xl bg-ink p-4 text-paper shadow-2xl"
          >
            <span className={`mt-0.5 rounded-full p-2 ${t.tone === 'ok' ? 'bg-ok' : 'bg-accent'}`}>
              <BellRing size={18} aria-hidden />
            </span>
            <div className="flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.body && <p className="text-sm text-paper/80">{t.body}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-lg p-1 text-paper/70 hover:text-paper"
              aria-label="Cerrar aviso"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
