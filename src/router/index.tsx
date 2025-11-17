import { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../features/home/pages/Home';
import { Dashboard } from '../features/dashboard/pages/Dashboard';
import { Challenges } from '../features/challenges/pages/Challenges';
import { ChallengeDetail } from '../features/challenges/pages/ChallengeDetail';
import { Leaderboard } from '../features/leaderboard/pages/Leaderboard';
import { Community } from '../features/community/pages/Community';
import { Profile } from '../features/profile/pages/Profile';
import { Login } from '../features/auth/pages/Login';
import { Register } from '../features/auth/pages/Register';
import { Settings } from '../features/settings/pages/Settings';
import { PushUpCounter } from '../features/challenges/pages/PushUpCounter';
import { useAuth } from '../context/AuthContext';

const Reports = lazy(() => import('../features/reports/pages/Reports').then(m => ({ default: m.Reports })));

// Protected Route Component


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AppRouter = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Auth Routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Routes (with layout) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="challenges/:id/counter" element={
            <ProtectedRoute>
              <PushUpCounter />
            </ProtectedRoute>
          } />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};
