import { useState } from 'react';
import { Camera, Check, ExternalLink, MessageCircle, Share2 } from 'lucide-react';
import { PageHeader } from '../../../shared/components/DashboardLayout';
import { Button, Card } from '../../../shared/components/ui';
import { appUrl, bookingUrl, whatsappUrl } from '../../../shared/utils/links';
import { shareMessage } from '../../../shared/utils/messages';
import { track } from '../../../services/analytics';
import { useStudio } from '../hooks/useStudio';

/** The barber's public page and every way to share it. */
export default function StudioMyPage() {
  const { business } = useStudio();
  const [copied, setCopied] = useState(false);
  const url = bookingUrl(business);
  const message = shareMessage(business);
  const shortUrl = appUrl(`b/${business.slug}`).replace(/^https?:\/\//, '');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      window.prompt('Copia este mensaje:', message);
    }
    track('shared', { channel: 'instagram' });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: business.name, text: message, url });
      track('shared', { channel: 'native' });
    } catch {
      /* cancelled */
    }
  };

  return (
    <>
      <PageHeader kicker="Mi página" title="Tu página de reservas" />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-6">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-muted">Tu link</p>
          <p className="mt-1 break-all font-display text-2xl font-black text-blue">{shortUrl}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              as="a"
              href={whatsappUrl(message)}
              target="_blank"
              rel="noreferrer"
              variant="whatsapp"
              onClick={() => track('shared', { channel: 'whatsapp' })}
            >
              <MessageCircle size={18} aria-hidden /> Compartir en WhatsApp
            </Button>
            <Button variant="outline" onClick={copy}>
              {copied ? <Check size={18} aria-hidden /> : <Camera size={18} aria-hidden />}
              {copied ? 'Mensaje copiado' : 'Copiar para Instagram'}
            </Button>
            <Button variant="ghost" onClick={share}>
              <Share2 size={18} aria-hidden /> Otras apps
            </Button>
            <Button as="a" href={url} target="_blank" rel="noreferrer" variant="ghost">
              <ExternalLink size={18} aria-hidden /> Ver mi página
            </Button>
          </div>
          <div className="mt-6 rounded-2xl bg-paper p-4">
            <p className="text-sm font-semibold text-muted">Mensaje listo</p>
            <p className="mt-1 text-ink-soft [overflow-wrap:anywhere]">
              {message.replace(url, shortUrl)}
            </p>
          </div>
        </Card>
        <Card className="bg-night p-6 text-paper">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold">Tu insignia</p>
          <h2 className="mt-2 font-display text-2xl font-black">
            Cada cliente que reserva ve que usas Agendo
          </h2>
          <p className="mt-3 text-paper/75">
            Al pie de tu página aparece «Reservado con Agendo». Si otro barbero la toca, empieza su
            prueba gratis. Así cada barbería activa trae a la siguiente.
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-sm text-paper/80">
            <li>· Tu página recibe en promedio 250 visitas al mes.</li>
            <li>· La insignia lleva al registro con tu barbería como origen.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
