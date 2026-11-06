import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ToastProvider } from '../shared/components/Toast';
import NotFound from '../shared/components/NotFound';
import OnboardingPage from '../features/onboarding/OnboardingPage';

// Everything outside the sign-up path loads on demand; the 3D scene loads
// inside the landing after first paint.
const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const SharePage = lazy(() => import('../features/share/SharePage'));
const PublicBookingPage = lazy(() => import('../features/booking/PublicBookingPage'));
const MyBookingsPage = lazy(() => import('../features/booking/MyBookingsPage'));

const StudioLoginPage = lazy(() => import('../features/studio/StudioLoginPage'));
const StudioLayout = lazy(() => import('../features/studio/StudioLayout'));
const StudioHome = lazy(() => import('../features/studio/pages/StudioHome'));
const StudioAgenda = lazy(() => import('../features/studio/pages/StudioAgenda'));
const StudioClients = lazy(() => import('../features/studio/pages/StudioClients'));
const StudioMyPage = lazy(() => import('../features/studio/pages/StudioMyPage'));
const StudioPlan = lazy(() => import('../features/studio/pages/StudioPlan'));
const StudioServices = lazy(() =>
  import('../features/studio/pages/StudioSettings').then((m) => ({ default: m.StudioServices })),
);
const StudioSchedule = lazy(() =>
  import('../features/studio/pages/StudioSettings').then((m) => ({ default: m.StudioSchedule })),
);

const AdminLayout = lazy(() => import('../features/admin/AdminLayout'));
const OverviewPage = lazy(() => import('../features/admin/pages/OverviewPage'));
const BusinessesPage = lazy(() => import('../features/admin/pages/BusinessesPage'));
const BookingsPage = lazy(() => import('../features/admin/pages/BookingsPage'));
const FunnelPage = lazy(() => import('../features/admin/pages/FunnelPage'));

function Loading() {
  return <div className="min-h-dvh bg-night" aria-busy="true" />;
}

/** Old links from the first version of the prototype. */
function LegacyAgenda() {
  const { slug } = useParams();
  return <Navigate to={`/app/${slug}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/empezar" element={<OnboardingPage />} />
            <Route path="/listo/:slug" element={<SharePage />} />
            <Route path="/b/:slug" element={<PublicBookingPage />} />
            <Route path="/mis-citas" element={<MyBookingsPage />} />

            <Route path="/ingresar" element={<StudioLoginPage />} />
            <Route path="/app/:slug" element={<StudioLayout />}>
              <Route index element={<StudioHome />} />
              <Route path="agenda" element={<StudioAgenda />} />
              <Route path="clientes" element={<StudioClients />} />
              <Route path="mi-pagina" element={<StudioMyPage />} />
              <Route path="servicios" element={<StudioServices />} />
              <Route path="horario" element={<StudioSchedule />} />
              <Route path="plan" element={<StudioPlan />} />
            </Route>
            <Route path="/agenda/:slug" element={<LegacyAgenda />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="barberias" element={<BusinessesPage />} />
              <Route path="reservas" element={<BookingsPage />} />
              <Route path="embudo" element={<FunnelPage />} />
            </Route>
            <Route path="/panel" element={<Navigate to="/admin/embudo" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}
