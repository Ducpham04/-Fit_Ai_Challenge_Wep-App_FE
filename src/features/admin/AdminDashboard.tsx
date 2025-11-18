import { useState } from "react";
import { AdminLayout } from "./layouts/AdminLayout";
import { UserPage } from "./pages/UserPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { RewardsPage } from "./pages/RewardsPage";
import { TrainingPlansPage } from "./pages/TrainingPlansPage";
import { MealsPage } from "./pages/MealsPage";
import { FoodsPage } from "./pages/FoodsPage";

export function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState("users");

  const renderPage = () => {
    switch (currentPage) {
      case "users":
        return <UserPage />;
      case "dashboard":
        return <DashboardPage />;
      case "challenges":
        return <ChallengesPage />;
      case "transactions":
        return <TransactionsPage />;
      case "rewards":
        return <RewardsPage />;
      case "training-plans":
        return <TrainingPlansPage />;
      case "meals":
        return <MealsPage />;
      case "foods":
        return <FoodsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
}
