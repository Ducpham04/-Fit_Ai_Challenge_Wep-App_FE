import { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { Dashboard } from '../pages/Dashboard';
import { Challenges } from '../pages/Challenges';
import { ChallengeDetail } from '../pages/ChallengeDetail';
import { Leaderboard } from '../pages/Leaderboard';
import { Community } from '../pages/Community';
import { Profile } from '../pages/Profile';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Settings } from '../pages/Settings';
import { PushUpCounter } from '../pages/PushUpCounter';
import BodyInformation from '../pages/BodyInformation';
import BodyInformationEdit from '../pages/BodyInformationEdit';
import { useAuth } from '../context/AuthContext';

const Reports = lazy(() => import('../pages/Reports'));

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
          <Route path="bodyinformation" element={
            <ProtectedRoute>
              <BodyInformation />
            </ProtectedRoute>
          } />
          <Route path="bodyinformation/edit" element={
            <ProtectedRoute>
              <BodyInformationEdit />
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
