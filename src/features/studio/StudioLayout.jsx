import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, CreditCard, Home, Link2, Scissors, Clock, Users } from 'lucide-react';
import DashboardLayout from '../../shared/components/DashboardLayout';
import { SimTag } from '../../shared/components/ui';
import { signOutBusiness } from '../../services/businessRepository';
import { useFirstBooking } from '../../shared/hooks/useFirstBooking';
import { useStudioData } from './hooks/useStudio';

/** Barbershop panel: Agendo's customer manages bookings, services and plan. */
export default function StudioLayout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { business, bookings } = useStudioData(slug);
  const { simulate } = useFirstBooking(business);

  if (!business) return <Navigate to="/ingresar" replace />;

  const base = `/app/${slug}`;
  const nav = [
    { to: base, label: 'Inicio', icon: Home, end: true },
    { to: `${base}/agenda`, label: 'Agenda', icon: CalendarDays },
    { to: `${base}/clientes`, label: 'Clientes', icon: Users },
    { to: `${base}/mi-pagina`, label: 'Mi página', icon: Link2, short: 'Página' },
    { to: `${base}/servicios`, label: 'Servicios', icon: Scissors },
    { to: `${base}/horario`, label: 'Horario', icon: Clock },
    { to: `${base}/plan`, label: 'Plan y cobro', icon: CreditCard },
  ];
  // Phones show the five most used sections; the rest live in "Mi página".
  const mobileFirst = [nav[0], nav[1], nav[2], nav[3], nav[6]];
  const ordered = [...mobileFirst, ...nav.filter((n) => !mobileFirst.includes(n))];

  return (
    <DashboardLayout
      title={business.name}
      subtitle={business.status === 'active' ? 'Barbería activa' : 'Prueba gratis'}
      nav={ordered}
      badge={business.simulated ? <SimTag /> : null}
      onSignOut={() => {
        signOutBusiness();
        navigate('/ingresar');
      }}
      context={{ business, bookings, simulate }}
    />
  );
}
