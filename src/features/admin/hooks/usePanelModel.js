import { useMemo, useState } from 'react';
import { ASSUMPTIONS, CURRENT_FUNNEL } from '../../../config/caseData';
import {
  badgeLoop,
  compareScenarios,
  findBottlenecks,
  ltv24,
  stepRates,
} from '../utils/growthModel';

/** Default target funnel of the new setup, per 100 trials (SUPUESTO). */
export const DEFAULT_TARGET = {
  business: 95,
  services: 90,
  schedule: ASSUMPTIONS.newConfigured,
  share: ASSUMPTIONS.newShared,
  badgeConversion: ASSUMPTIONS.badgeConversion,
};

function clampTarget(t) {
  const business = Math.min(100, Math.max(0, t.business));
  const services = Math.min(business, Math.max(0, t.services));
  const schedule = Math.min(services, Math.max(0, t.schedule));
  const share = Math.min(schedule, Math.max(0, t.share));
  return { ...t, business, services, schedule, share };
}

export function usePanelModel() {
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const safe = clampTarget(target);

  return useMemo(() => {
    const today = stepRates(CURRENT_FUNNEL);
    const next = stepRates([
      {
        id: 'business',
        label: 'Nombre y WhatsApp',
        reached: 100,
        completed: safe.business,
        minutes: 1,
      },
      {
        id: 'services',
        label: 'Servicios (plantilla)',
        reached: safe.business,
        completed: safe.services,
        minutes: 1,
      },
      {
        id: 'schedule',
        label: 'Horario (plantilla)',
        reached: safe.services,
        completed: safe.schedule,
        minutes: 1,
      },
      {
        id: 'share',
        label: 'Compartir el link',
        reached: safe.schedule,
        completed: safe.share,
        minutes: null,
      },
    ]);
    const scenarios = compareScenarios({ newConfigured: safe.schedule, newShared: safe.share });
    const ltv = ltv24();
    return {
      target: safe,
      setTarget: (patch) => setTarget((t) => ({ ...t, ...patch })),
      reset: () => setTarget(DEFAULT_TARGET),
      today,
      next,
      bottlenecks: findBottlenecks(CURRENT_FUNNEL),
      scenarios,
      ltv,
      badge: badgeLoop({ conversion: safe.badgeConversion }),
      totalMinutesToday: CURRENT_FUNNEL.reduce((sum, s) => sum + (s.minutes ?? 0), 0),
    };
  }, [safe.business, safe.services, safe.schedule, safe.share, safe.badgeConversion]); // eslint-disable-line react-hooks/exhaustive-deps
}
