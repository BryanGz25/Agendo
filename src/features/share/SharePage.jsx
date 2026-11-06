import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Check,
  Copy,
  ExternalLink,
  Camera,
  MessageCircle,
  PartyPopper,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Button, Card, SimTag } from '../../shared/components/ui';
import { getBusiness } from '../../services/businessRepository';
import { track } from '../../services/analytics';
import { appUrl, bookingUrl, whatsappUrl } from '../../shared/utils/links';
import { useFirstBooking } from '../../shared/hooks/useFirstBooking';
import { shareMessage } from '../../shared/utils/messages';
import NotFound from '../../shared/components/NotFound';

/**
 * Screen after setup. Today the link hides in Configuración › Mi página and
 * only 30 of 62 share it the first day: the biggest loss of the funnel. Here
 * the link and the ready-made message are the whole screen.
 */
export default function SharePage() {
  const { slug } = useParams();
  const [business] = useState(() => getBusiness(slug));
  const { bookings, simulate } = useFirstBooking(business);
  const [copied, setCopied] = useState(false);

  const markShared = useCallback((channel) => track('shared', { channel }), []);

  if (!business) return <NotFound />;

  const url = bookingUrl(business);
  const message = shareMessage(business);
  const shortUrl = appUrl(`b/${business.slug}`).replace(/^https?:\/\//, '');
  const preview = message.replace(url, shortUrl);

  const copyForInstagram = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      window.prompt('Copia este mensaje:', message);
    }
    setCopied(true);
    markShared('instagram');
    window.setTimeout(() => setCopied(false), 2500);
  };

  const nativeShare = async () => {
    if (!navigator.share) return copyForInstagram();
    try {
      await navigator.share({ title: business.name, text: message, url });
      markShared('native');
    } catch {
      /* user cancelled */
    }
  };

  const hasBooking = bookings.length > 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pb-8 pt-6">
      <section className="animate-slide-in">
        <span className="inline-flex items-center gap-2 rounded-full bg-ok-soft px-3 py-1 text-sm font-semibold text-ok">
          <Check size={16} aria-hidden /> Tu página está lista
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight">
          Ahora mándala a tus clientes
        </h1>
        <p className="mt-2 text-ink-soft">
          Las barberías que comparten su link el primer día casi siempre reciben su primera reserva
          en la prueba (27 de cada 30).
        </p>
      </section>

      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Tu link de reservas
        </p>
        <p className="mt-1 break-all font-semibold text-blue">{shortUrl}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft underline"
        >
          Ver mi página <ExternalLink size={14} aria-hidden />
        </a>
      </Card>

      <div className="flex flex-col gap-3">
        <Button
          as="a"
          href={whatsappUrl(message)}
          target="_blank"
          rel="noreferrer"
          variant="whatsapp"
          size="lg"
          className="w-full"
          onClick={() => markShared('whatsapp')}
        >
          <MessageCircle size={22} aria-hidden /> Compartir en WhatsApp
        </Button>
        <Button variant="outline" size="lg" className="w-full" onClick={copyForInstagram}>
          {copied ? <Check size={22} aria-hidden /> : <Camera size={22} aria-hidden />}
          {copied ? 'Mensaje copiado' : 'Copiar para Instagram'}
        </Button>
        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-ink-soft"
        >
          <Share2 size={16} aria-hidden /> Otras apps
        </button>
      </div>

      <Card className="p-4">
        <p className="text-sm font-semibold text-muted">Mensaje listo para enviar</p>
        <p className="mt-1 text-ink-soft [overflow-wrap:anywhere]">{preview}</p>
        <button
          type="button"
          onClick={copyForInstagram}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue"
        >
          <Copy size={14} aria-hidden /> Copiar
        </button>
      </Card>

      {hasBooking ? (
        <Card className="animate-slide-in border-ok/30 bg-ok-soft p-4">
          <p className="flex items-center gap-2 font-display text-xl font-extrabold text-ok">
            <PartyPopper size={22} aria-hidden /> ¡Ya tienes tu primera reserva!
          </p>
          <p className="mt-1 text-ink-soft">
            El cliente ya pagó por adelantado y le llegará un recordatorio por WhatsApp antes de la
            cita.
          </p>
          <Button as={Link} to={`/agenda/${business.slug}`} variant="dark" className="mt-3 w-full">
            Ver mi agenda
          </Button>
        </Card>
      ) : (
        <Card className="border-dashed p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">¿Cómo se ve cuando alguien reserva?</p>
            <SimTag />
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Mira cómo te llega una reserva. También puedes abrir tu página y reservar tú mismo.
          </p>
          <Button variant="dark" className="mt-3 w-full" onClick={simulate}>
            <Sparkles size={18} aria-hidden /> Simular primera reserva
          </Button>
        </Card>
      )}

      <Link
        to={`/agenda/${business.slug}`}
        className="text-center text-sm font-semibold text-muted underline"
      >
        Ir a mi agenda
      </Link>
    </main>
  );
}
