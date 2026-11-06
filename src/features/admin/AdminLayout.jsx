import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, Filter, LayoutDashboard, Store } from 'lucide-react';
import DashboardLayout from '../../shared/components/DashboardLayout';
import { isAdmin, signOutAdmin } from '../../services/adminSession';
import { listAllBookings, listBusinesses } from '../../services/businessRepository';
import { useStoreValue } from '../../shared/hooks/useStoreValue';
import AdminLoginPage from './AdminLoginPage';

const NAV = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/barberias', label: 'Barberías', icon: Store },
  { to: '/admin/reservas', label: 'Reservas', icon: CalendarRange },
  { to: '/admin/embudo', label: 'Embudo y meta', icon: Filter, short: 'Embudo' },
];

/** Valeria's panel: the whole platform, behind a demo PIN. */
export default function AdminLayout() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(isAdmin);
  const readBusinesses = useCallback(() => listBusinesses(), []);
  const readBookings = useCallback(() => listAllBookings(), []);
  const businesses = useStoreValue(readBusinesses);
  const bookings = useStoreValue(readBookings);

  if (!signedIn) return <AdminLoginPage onSuccess={() => setSignedIn(true)} />;

  return (
    <DashboardLayout
      title="Valeria Ortiz"
      subtitle="Administración · CEO"
      nav={NAV}
      onSignOut={() => {
        signOutAdmin();
        setSignedIn(false);
        navigate('/');
      }}
      context={{ businesses, bookings }}
    />
  );
}
