import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './store/AppContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DiscoverPage from './pages/DiscoverPage';
import CompetitionPage from './pages/CompetitionPage';
import GymSearchPage from './pages/GymSearchPage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isAuthenticated) return <Navigate to="/" replace />;
  if (!state.isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  const { state } = useApp();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          state.isAuthenticated ? (
            <Navigate to="/app/discover" replace />
          ) : (
            <AuthPage />
          )
        }
      />

      {/* Onboarding (requires auth, but not onboarded yet) */}
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />

      {/* Main app shell (requires auth + onboarding) */}
      <Route
        path="/app"
        element={
          <RequireOnboarded>
            <Layout />
          </RequireOnboarded>
        }
      >
        <Route index element={<Navigate to="/app/discover" replace />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="competition" element={<CompetitionPage />} />
        <Route path="gyms" element={<GymSearchPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
