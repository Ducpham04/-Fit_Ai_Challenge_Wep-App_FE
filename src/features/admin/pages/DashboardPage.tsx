import { useEffect, useMemo, useState } from "react";
import { Users, Gift, Activity, Dumbbell } from "lucide-react";

import {
  AdminUser,
  AdminChallenge,
  AdminReward,
  AdminTransaction,
  AdminTrainingPlan,
} from "../types/admin-entities";

import {
  userAPI,
  challengeAPI,
  rewardAPI,
  transactionAPI,
  trainingPlanAPI,
} from "../api/adminAPI";

export  function DashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [plans, setPlans] = useState<AdminTrainingPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        uRes,
        cRes,
        rRes,
        tRes,
        pRes,
      ] = await Promise.all([
        userAPI.getAll(),
        challengeAPI.getAll(),
        rewardAPI.getAll(),
        transactionAPI.getAll(),
        trainingPlanAPI.getAll(),
      ]);

      setUsers(uRes.data || []);
      setChallenges(cRes.data || []);
      setRewards(rRes.data || []);
      setTransactions(tRes.data || []);
      setPlans(pRes.data || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  // -------------------
  // 🧮 Tính toán thống kê
  // -------------------
  const stats = useMemo(() => {
    const revenue = transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "active").length,
      challenges: challenges.length,
      rewards: rewards.length,
      revenue,
      plans: plans.length,
      totalTransactions: transactions.length,
    };
  }, [users, challenges, rewards, transactions, plans]);

  const latestUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const latestTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  // -------------------
  // 🖥️ UI
  // -------------------
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={<Activity />} label="Active Users" value={stats.activeUsers} />
        <StatCard icon={<Dumbbell />} label="Challenges" value={stats.challenges} />
        <StatCard icon={<Gift />} label="Rewards" value={stats.rewards} />
        <StatCard icon={<Gift />} label="Revenue" value={`$${stats.revenue}`} />
        <StatCard icon={<Dumbbell />} label="Training Plans" value={stats.plans} />
        <StatCard icon={<Activity />} label="Transactions" value={stats.totalTransactions} />
      </div>

      {/* Latest Users */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">New Users</h2>
        <ul className="space-y-2">
          {latestUsers.map((u) => (
            <li key={u.id} className="flex items-center justify-between border-b pb-2">
              <span>{u.username}</span>
              <span className="text-sm text-gray-500">{u.email}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Latest Transactions */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
        <ul className="space-y-2">
          {latestTransactions.map((t) => (
            <li key={t.id} className="flex items-center justify-between border-b pb-2">
              <span>{t.userName} — {t.type}</span>
              <span className="font-medium">${t.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Component nhỏ để hiển thị thẻ thống kê
function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex items-center space-x-3">
      <div className="text-blue-500">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
