import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../features/home/pages/Home";
import { Dashboard } from "../features/dashboard/pages/Dashboard";
import { Challenges } from "../features/challenges/pages/Challenges";
import { ChallengeDetail } from "../features/challenges/pages/ChallengeDetail";
import { Leaderboard } from "../features/leaderboard/pages/Leaderboard";
import { Community } from "../features/community/pages/Community";
import { Profile } from "../features/profile/pages/Profile";
import { Login } from "../features/auth/pages/Login";
import { Register } from "../features/auth/pages/Register";
import { Settings } from "../features/settings/pages/Settings";
import { PushUpCounter } from "../features/challenges/pages/PushUpCounter";
import { AdminDashboard } from "../features/admin/AdminDashboard";
import { UserPage } from "../features/admin/pages/UserPage";
import { DashboardPage } from "../features/admin/pages/DashboardPage";
import { ChallengesPage } from "../features/admin/pages/ChallengesPage";
import { RewardsPage } from "../features/admin/pages/RewardsPage";
import { TransactionsPage } from "../features/admin/pages/TransactionsPage";
import { TrainingPlansPage } from "../features/admin/pages/TrainingPlansPage";
import { MealsPage } from "../features/admin/pages/MealsPage";
import { FoodsLibraryPage } from "../features/admin/pages/FoodsLibraryPage";
import { GoalsPage } from "../features/admin/pages/GoalsPage";
import { RolesPage } from "../features/admin/pages/RolesPage";
import { NutritionPlanPage } from "../features/admin/pages/NutritionPlanPage";
import { AILogsPage } from "../features/admin/pages/AILogsPage";
import { NotificationsPage } from "../features/admin/pages/NotificationsPage";
import { SystemSettingsPage } from "../features/admin/pages/SystemSettingsPage";
import { HashRouter } from "react-router-dom";

export const AppRouter = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin nested routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UserPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="training-plans" element={<TrainingPlansPage />} />
          <Route path="meals" element={<MealsPage />} />
          <Route path="foods" element={<FoodsLibraryPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="nutrition-plans" element={<NutritionPlanPage />} />
          <Route path="ai-logs" element={<AILogsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
        </Route>

        {/* Main App */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="challenges/:id/counter" element={<PushUpCounter />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};
