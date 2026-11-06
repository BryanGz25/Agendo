import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, StepProgress } from '../../shared/components/ui';
import { useOnboarding } from './hooks/useOnboarding';
import StepBusiness from './components/StepBusiness';
import StepServices from './components/StepServices';
import StepSchedule from './components/StepSchedule';

const LABELS = ['Tu barbería', 'Servicios', 'Horario'];
const CTA = ['Seguir', 'Confirmar servicios', 'Crear mi página'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { step, data, errors, update, next, back } = useOnboarding({
    referredBy: params.get('ref'),
  });

  const onSubmit = (event) => {
    event.preventDefault();
    const business = next();
    if (business) navigate(`/listo/${business.slug}`);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Step = [StepBusiness, StepServices, StepSchedule][step - 1];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-6 pt-4">
      <div className="mb-6 flex items-center gap-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="rounded-lg p-2 -ml-2"
            aria-label="Volver al paso anterior"
          >
            <ArrowLeft size={22} />
          </button>
        ) : (
          <Link to="/" className="rounded-lg p-2 -ml-2" aria-label="Volver al inicio">
            <ArrowLeft size={22} />
          </Link>
        )}
        <div className="flex-1">
          <StepProgress current={step} total={3} labels={LABELS} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
        <div key={step} className="flex-1 animate-slide-in">
          <Step data={data} errors={errors} update={update} />
        </div>
        <div className="sticky bottom-4 mt-8">
          <Button type="submit" size="lg" className="w-full">
            {CTA[step - 1]}
          </Button>
        </div>
      </form>
    </main>
  );
}
