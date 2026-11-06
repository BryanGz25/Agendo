import { useState } from 'react';
import { FileText } from 'lucide-react';
import { PageHeader } from '../../../shared/components/DashboardLayout';
import { Button, Card, SimTag } from '../../../shared/components/ui';
import { updateBusiness } from '../../../services/businessRepository';
import { UNIT_ECONOMICS } from '../../../config/caseData';
import { useStudio, useStudioStats } from '../hooks/useStudio';
import BillingForm from '../components/BillingForm';

const PLANS = [
  {
    id: 'monthly',
    name: 'Mensual',
    price: `$${UNIT_ECONOMICS.monthlyPrice}`,
    per: 'al mes',
    note: 'Cancelas cuando quieras.',
  },
  {
    id: 'annual',
    name: 'Anual',
    price: `$${UNIT_ECONOMICS.annualPrice}`,
    per: 'al año',
    note: 'Equivale a $20 al mes: dos meses gratis.',
  },
];

/** Plan choice and fiscal data, moved here from the first screen of the old setup. */
export default function StudioPlan() {
  const { business, bookings } = useStudio();
  const [now] = useState(() => Date.now());
  const { daysLeft } = useStudioStats(business, bookings, now);
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-3xl">
      <PageHeader
        kicker="Plan y cobro"
        title={business.status === 'active' ? 'Tu plan' : `Tu prueba termina en ${daysLeft} días`}
      />

      <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Plan">
        {PLANS.map((plan) => {
          const selected = (business.plan ?? 'monthly') === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => updateBusiness(business.slug, { plan: plan.id })}
              className={`rounded-2xl border-2 p-5 text-left transition ${selected ? 'border-gold bg-gold-soft' : 'border-line bg-card hover:border-gold/50'}`}
            >
              <p className="font-label text-sm uppercase tracking-[0.16em]">{plan.name}</p>
              <p className="mt-2 font-display text-4xl font-black">
                {plan.price}{' '}
                <span className="font-sans text-base font-medium text-muted">{plan.per}</span>
              </p>
              <p className="mt-1 text-sm text-ink-soft">{plan.note}</p>
            </button>
          );
        })}
      </div>

      <Card className="mt-6 p-5">
        <p className="flex items-center gap-2 font-semibold">
          <FileText size={18} aria-hidden /> Datos de cobro
        </p>
        {editing ? (
          <div className="mt-4">
            <BillingForm
              initial={business.billing}
              onSave={(billing) => {
                updateBusiness(business.slug, { billing });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            <p className="mt-1 text-ink-soft">
              {business.billing
                ? `Facturamos a ${business.billing.legalName}.`
                : 'Solo los necesitamos para cobrarte cuando termine la prueba. Puedes completarlos después.'}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(true)}>
              {business.billing ? 'Editar datos' : 'Completar ahora'}
            </Button>
          </>
        )}
      </Card>

      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <SimTag /> En este prototipo no se hacen cobros reales.
      </p>
    </div>
  );
}
