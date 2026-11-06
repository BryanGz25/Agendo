import { useCallback, useState } from 'react';
import { TEMPLATES } from '../../../config/caseData';
import { normalizePhone } from '../../../shared/utils/phone';
import { track } from '../../../services/analytics';
import { createBusiness } from '../../../services/businessRepository';

const STEP_EVENTS = ['business', 'services', 'schedule'];

function defaultSchedule() {
  return TEMPLATES.week.map(({ day, open }) => ({ day, open, ...TEMPLATES.defaultHours }));
}

/** Validation rules for each step. Returns an error map (empty = valid). */
export function validateStep(step, data) {
  const errors = {};
  if (step === 1) {
    if (data.name.trim().length < 2) errors.name = 'Escribe el nombre de tu barbería.';
    if (!normalizePhone(data.whatsapp)) errors.whatsapp = 'Escribe un WhatsApp válido (8 dígitos).';
  }
  if (step === 2) {
    const active = data.services.filter((s) => s.active);
    if (!active.length) errors.services = 'Deja al menos un servicio activo.';
    if (active.some((s) => !s.name.trim() || !(s.price > 0) || !(s.minutes >= 10))) {
      errors.services = 'Cada servicio necesita nombre, precio y duración de al menos 10 min.';
    }
  }
  if (step === 3) {
    const open = data.schedule.filter((d) => d.open);
    if (!open.length) errors.schedule = 'Abre al menos un día.';
    if (open.some((d) => d.start >= d.end))
      errors.schedule = 'La hora de cierre debe ser después de la de apertura.';
  }
  return errors;
}

/**
 * The 3-step setup: only what is needed to receive a booking. Fiscal data,
 * address, photos and social networks are left for later (Parte 2, punto 5).
 */
export function useOnboarding({ referredBy }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    name: '',
    whatsapp: '',
    services: TEMPLATES.services.map((s) => ({ ...s, active: true })),
    schedule: defaultSchedule(),
  });

  const update = useCallback((patch) => {
    setData((d) => ({ ...d, ...patch }));
    setErrors({});
  }, []);

  const next = useCallback(() => {
    const found = validateStep(step, data);
    setErrors(found);
    if (Object.keys(found).length) return null;
    track(STEP_EVENTS[step - 1]);
    if (step < 3) {
      setStep(step + 1);
      return null;
    }
    return createBusiness({
      name: data.name.trim(),
      whatsapp: normalizePhone(data.whatsapp),
      services: data.services
        .filter((s) => s.active)
        .map(({ id, name, price, minutes }) => ({
          id,
          name: name.trim(),
          price: Number(price),
          minutes: Number(minutes),
        })),
      schedule: data.schedule,
      referredBy: referredBy ?? null,
    });
  }, [step, data, referredBy]);

  const back = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  return { step, data, errors, update, next, back };
}
