import { useEffect, useMemo, useState } from "react";
import { Users, Gift, Activity, Dumbbell, TrendingUp, AlertCircle } from "lucide-react";

import {
  AdminUser,
  AdminChallenge,
  AdminReward,
  AdminTransaction,
  AdminTrainingPlan,
  AdminGoal,
} from "../types/admin-entities";

import {
  userAPI,
  challengeAPI,
  rewardAPI,
  transactionAPI,
  trainingPlanAPI,
  goalAPI,
} from "../api/adminAPI";

export  function DashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [plans, setPlans] = useState<AdminTrainingPlan[]>([]);
  const [goals, setGoals] = useState<AdminGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [Dashboard] Loading all data...");

      const [
        uRes,
        cRes,
        rRes,
        tRes,
        pRes,
        gRes,
      ] = await Promise.all([
        userAPI.getAll(),
        challengeAPI.getAll(),
        rewardAPI.getAll(),
        transactionAPI.getAll(),
        trainingPlanAPI.getAll(),
        goalAPI.getAll(),
      ]);

      // Extract data with dual-format handling
      let userData = [];
      if (Array.isArray(uRes.data)) userData = uRes.data;
      else if (Array.isArray(uRes.data?.data)) userData = uRes.data.data;
      
      let challengeData = [];
      if (Array.isArray(cRes.data)) challengeData = cRes.data;
      else if (Array.isArray(cRes.data?.data)) challengeData = cRes.data.data;

      let rewardData = [];
      if (Array.isArray(rRes.data)) rewardData = rRes.data;
      else if (Array.isArray(rRes.data?.data)) rewardData = rRes.data.data;

      let transactionData = [];
      if (Array.isArray(tRes.data)) transactionData = tRes.data;
      else if (Array.isArray(tRes.data?.data)) transactionData = tRes.data.data;

      let planData = [];
      if (Array.isArray(pRes.data)) planData = pRes.data;
      else if (Array.isArray(pRes.data?.data)) planData = pRes.data.data;

      let goalData = [];
      if (Array.isArray(gRes.data)) goalData = gRes.data;
      else if (Array.isArray(gRes.data?.data)) goalData = gRes.data.data;

      console.log("✅ [Dashboard] Data loaded successfully");
      setUsers(userData);
      setChallenges(challengeData);
      setRewards(rewardData);
      setTransactions(transactionData);
      setPlans(planData);
      setGoals(goalData);
    } catch (err: any) {
      console.error("❌ [Dashboard] Load error:", err);
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  // -------------------
  // 🧮 Tính toán thống kê
  // -------------------
  const stats = useMemo(() => {
    const completedTransactions = transactions
      .filter((t) => t.status === "completed");
    const revenue = completedTransactions
      .reduce((sum, t) => sum + t.amount, 0);

    const activeUsers = users.filter((u) => u.status === "active").length;
    const completedGoals = goals.filter((g) => g.status === "completed").length;
    const activeChallenges = challenges.filter((c) => c.status === "active").length;
    const publishedPlans = plans.filter((p) => p.status === "published").length;

    // Top users by rewards
    const userRewardsMap = new Map<number, { name: string; count: number }>();
    rewards.forEach((r) => {
      const userId = 1; // Would need userId from reward
      if (!userRewardsMap.has(userId)) {
        userRewardsMap.set(userId, { name: "User", count: 0 });
      }
      const current = userRewardsMap.get(userId)!;
      current.count += 1;
    });
    const topUsersByRewards = Array.from(userRewardsMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Transaction trends (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dailyTransactions = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyTransactions.set(dateStr, 0);
    }
    transactions.forEach((t) => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      if (dailyTransactions.has(dateStr)) {
        dailyTransactions.set(dateStr, (dailyTransactions.get(dateStr) || 0) + 1);
      }
    });
    const transactionTrends = Array.from(dailyTransactions.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      totalUsers: users.length,
      activeUsers,
      challenges: challenges.length,
      activeChallenges,
      rewards: rewards.length,
      revenue,
      plans: plans.length,
      publishedPlans,
      totalTransactions: transactions.length,
      completedTransactions: completedTransactions.length,
      goals: goals.length,
      completedGoals,
      topUsersByRewards,
      transactionTrends,
    };
  }, [users, challenges, rewards, transactions, plans, goals]);

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={<Activity />} label="Active Users" value={stats.activeUsers} />
        <StatCard icon={<Dumbbell />} label="Active Challenges" value={stats.activeChallenges} />
        <StatCard icon={<Gift />} label="Rewards" value={stats.rewards} />
        <StatCard icon={<TrendingUp />} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
        <StatCard icon={<Dumbbell />} label="Published Plans" value={stats.publishedPlans} />
        <StatCard icon={<Activity />} label="Completed Transactions" value={stats.completedTransactions} />
        <StatCard icon={<Activity />} label="Completed Goals" value={stats.completedGoals} />
      </div>

      {/* Transaction Trends */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Transaction Trends (Last 7 Days)</h2>
        <div className="flex items-end gap-2 h-48">
          {stats.transactionTrends.map((trend, idx) => {
            const maxCount = Math.max(...stats.transactionTrends.map(t => t.count), 1);
            const height = (trend.count / maxCount) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-400 rounded-t" style={{ height: `${height}%` }} />
                <span className="text-xs text-gray-600 mt-2">{trend.date.split('-')[2]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Users by Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Top Users by Rewards</h2>
          <ul className="space-y-2">
            {stats.topUsersByRewards.length > 0 ? (
              stats.topUsersByRewards.map((user, idx) => (
                <li key={idx} className="flex items-center justify-between border-b pb-2">
                  <span className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    {user.name}
                  </span>
                  <span className="font-semibold text-blue-600">{user.count} rewards</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No reward data available</li>
            )}
          </ul>
        </div>

        {/* Stats Summary Card */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">System Overview</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Challenges:</span>
              <span className="font-semibold">{stats.challenges}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Challenges:</span>
              <span className="font-semibold text-green-600">{stats.activeChallenges}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Training Plans:</span>
              <span className="font-semibold">{stats.plans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Published Plans:</span>
              <span className="font-semibold text-green-600">{stats.publishedPlans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Goals:</span>
              <span className="font-semibold">{stats.goals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Goals:</span>
              <span className="font-semibold text-green-600">{stats.completedGoals}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Total Transactions:</span>
              <span className="font-semibold">{stats.totalTransactions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Users */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Recent New Users</h2>
        <ul className="space-y-2">
          {latestUsers.length > 0 ? (
            latestUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between border-b pb-2 hover:bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">{u.username}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  u.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {u.status}
                </span>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No users yet</li>
          )}
        </ul>
      </div>

      {/* Latest Transactions */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
        <ul className="space-y-2">
          {latestTransactions.length > 0 ? (
            latestTransactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between border-b pb-2 hover:bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">{t.userName}</p>
                  <p className="text-sm text-gray-500">{t.type} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    t.type === "deposit" || t.type === "reward" ? "text-green-600" : "text-red-600"
                  }`}>
                    {t.type === "deposit" || t.type === "reward" ? "+" : "-"}${t.amount.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    t.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {t.status}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No transactions yet</li>
          )}
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
