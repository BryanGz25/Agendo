import { useState } from 'react';
import { Check } from 'lucide-react';
import { PageHeader } from '../../../shared/components/DashboardLayout';
import { Button } from '../../../shared/components/ui';
import ServicesEditor from '../../../shared/components/ServicesEditor';
import ScheduleEditor from '../../../shared/components/ScheduleEditor';
import { updateBusiness } from '../../../services/businessRepository';
import { useStudio } from '../hooks/useStudio';

function SaveBar({ dirty, saved, onSave, error }) {
  return (
    <div className="sticky bottom-24 z-10 mt-6 flex items-center gap-3 md:bottom-6">
      <Button onClick={onSave} disabled={!dirty} variant="dark">
        Guardar cambios
      </Button>
      {saved && (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-ok">
          <Check size={16} aria-hidden /> Guardado
        </span>
      )}
      {error && (
        <span role="alert" className="text-sm font-medium text-accent-strong">
          {error}
        </span>
      )}
    </div>
  );
}

export function StudioServices() {
  const { business } = useStudio();
  const [services, setServices] = useState(business.services);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const dirty = JSON.stringify(services) !== JSON.stringify(business.services);

  const save = () => {
    const active = services.filter((s) => s.active !== false);
    if (
      !active.length ||
      active.some((s) => !s.name.trim() || !(s.price > 0) || !(s.minutes >= 10))
    ) {
      setError('Cada servicio necesita nombre, precio y al menos 10 minutos.');
      return;
    }
    updateBusiness(business.slug, {
      services: active.map(({ id, name, price, minutes }) => ({
        id,
        name: name.trim(),
        price,
        minutes,
      })),
    });
    setServices(
      active.map(({ id, name, price, minutes }) => ({ id, name: name.trim(), price, minutes })),
    );
    setError('');
    setSaved(true);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader kicker="Servicios" title="Servicios y precios" />
      <ServicesEditor
        services={services}
        onChange={(s) => {
          setServices(s);
          setSaved(false);
        }}
      />
      <SaveBar dirty={dirty} saved={saved} onSave={save} error={error} />
    </div>
  );
}

export function StudioSchedule() {
  const { business } = useStudio();
  const [schedule, setSchedule] = useState(business.schedule);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const dirty = JSON.stringify(schedule) !== JSON.stringify(business.schedule);

  const save = () => {
    const open = schedule.filter((d) => d.open);
    if (!open.length || open.some((d) => d.start >= d.end)) {
      setError('Abre al menos un día y revisa que el cierre sea después de la apertura.');
      return;
    }
    updateBusiness(business.slug, { schedule });
    setError('');
    setSaved(true);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader kicker="Horario" title="¿Cuándo atiendes?" />
      <ScheduleEditor
        schedule={schedule}
        onChange={(s) => {
          setSchedule(s);
          setSaved(false);
        }}
      />
      <SaveBar dirty={dirty} saved={saved} onSave={save} error={error} />
    </div>
  );
}
