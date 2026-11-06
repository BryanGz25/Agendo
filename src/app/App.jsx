import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../shared/components/Toast';
import NotFound from '../shared/components/NotFound';
import LandingPage from '../features/landing/LandingPage';
import OnboardingPage from '../features/onboarding/OnboardingPage';

// Screens outside the critical path (ad → page ready) load on demand.
const SharePage = lazy(() => import('../features/share/SharePage'));
const AgendaPage = lazy(() => import('../features/agenda/AgendaPage'));
const PublicBookingPage = lazy(() => import('../features/booking/PublicBookingPage'));
const OwnerPanelPage = lazy(() => import('../features/panel/OwnerPanelPage'));

function Loading() {
  return <div className="min-h-dvh" aria-busy="true" />;
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
            <Route path="/agenda/:slug" element={<AgendaPage />} />
            <Route path="/b/:slug" element={<PublicBookingPage />} />
            <Route path="/panel" element={<OwnerPanelPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}
