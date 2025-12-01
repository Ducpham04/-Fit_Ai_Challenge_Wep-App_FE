import { useState, useMemo, useEffect } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Trophy,
  Dumbbell,
  Apple,
  TrendingUp,
  CreditCard,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { AdminUser } from "../types/admin-entities";
import { infBodyAPI, trainingPlanAPI } from "../api/adminAPI";

interface UserBodyData {
  createdAt: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPct?: number;
  gender?: string;
  goalName?: string;
}

interface UserTrainingPlan {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  completionPercentage: number;
  status: "active" | "completed" | "paused";
}

interface UserNutritionPlan {
  id: number;
  name: string;
  startDate: string;
  targetCalories: number;
  currentCalories: number;
  daysFollowed: number;
}

interface UserChallenge {
  id: number;
  name: string;
  category: string;
  submissionDate: string;
  aiScore: number;
  userReps: number;
  status: "pending" | "approved" | "rejected";
}

interface UserTransaction {
  id: number;
  type: "earned" | "redeemed" | "bonus" | "penalty";
  points: number;
  description: string;
  date: string;
}

interface UserDetailProps {
  user: AdminUser;
  onBack: () => void;
}

type TabId =
  | "overview"
  | "body-data"
  | "training"
  | "nutrition"
  | "challenges"
  | "transactions";

// ==============================
// Mock Data (Tạm) – sau này thay API
// ==============================
const MOCK_TRAINING_PLANS: UserTrainingPlan[] = [
  {
    id: 1,
    name: "30-Day Beginner Push-up Challenge",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    completionPercentage: 65,
    status: "active",
  },
  {
    id: 2,
    name: "Core Strength Program",
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    completionPercentage: 100,
    status: "completed",
  },
];

const MOCK_CHALLENGES: UserChallenge[] = [
  {
    id: 1,
    name: "Push-up Challenge",
    category: "Upper Body",
    submissionDate: "2024-01-15",
    aiScore: 92,
    userReps: 25,
    status: "approved",
  },
  {
    id: 2,
    name: "Plank Hold",
    category: "Core",
    submissionDate: "2024-01-14",
    aiScore: 88,
    userReps: 60,
    status: "approved",
  },
];

const MOCK_TRANSACTIONS: UserTransaction[] = [
  { id: 1, type: "earned", points: 100, description: "Push-up Challenge completed", date: "2024-01-15" },
  { id: 2, type: "earned", points: 50, description: "Daily login bonus", date: "2024-01-14" },
  { id: 3, type: "redeemed", points: 200, description: "Redeemed Premium", date: "2024-01-13" },
  { id: 4, type: "bonus", points: 25, description: "Referral bonus", date: "2024-01-12" },
];

// ==============================
// Component chính
// ==============================
export function UserDetailPage({ user, onBack }: UserDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [body, setBody] = useState<UserBodyData[]>([]);
  const [usertraining , setUserTraining] = useState<UserTrainingPlan[]>([])
  // ==========================
  // Fetch Body API
  // ==========================
  useEffect(() => {
    (async () => {
      try {
        const res = await infBodyAPI.getBodyData(user.id);
        
        setBody(res.data.data ?? []);
        console.log(res.data.data)
        console.log("Log data" , body[0])

        const res_training = await trainingPlanAPI.getById(user.id)
        console.log("Log data usertraining DTO", res_training.data.data)
        setUserTraining(res_training.data.data)
      } catch (err) {
        console.error("Fetch body data fail:", err);
      }
    })();
  }, [user.id]);

  // ==========================
  // Memo Stats
  // ==========================
  const bodyDataStats = useMemo(() => {
    if (body.length === 0)
      return { avgWeight: 0, currentBMI: 0, weightChange: 0 };

    const current = body[0];
    console.log("Current 0" , current.weightKg)
    const previous = body[body.length - 1];

    const avgWeight = body.reduce((sum, d) => sum + d.weightKg, 0) / body.length;

    return {
      avgWeight: Math.round(avgWeight * 10) / 10,
      currentBMI: current.bmi,
      weightChange: previous.weightKg - current.weightKg,
    };
  }, [body]);

  const trainingStats = useMemo(() => {
    const active = usertraining.filter((p) => p.status === "active").length;
    const completed = usertraining.filter((p) => p.status === "completed").length;
    const avgCompletion =
      usertraining.reduce((s, p) => s + p.completionPercentage, 0) /
      usertraining.length;

    return {
      active,
      completed,
      avgCompletion: Math.round(avgCompletion * 10) / 10,
    };
  }, []);

  const challengeStats = useMemo(() => {
    const approved = MOCK_CHALLENGES.filter((c) => c.status === "approved").length;

    return {
      total: MOCK_CHALLENGES.length,
      approved,
      avgScore:
        Math.round(
          (MOCK_CHALLENGES.reduce((s, c) => s + c.aiScore, 0) / MOCK_CHALLENGES.length) * 10
        ) / 10,
    };
  }, []);

  const transactionStats = useMemo(() => {
    const earned = MOCK_TRANSACTIONS.filter((t) => t.type === "earned").reduce((s, t) => s + t.points, 0);
    const redeemed = MOCK_TRANSACTIONS.filter((t) => t.type === "redeemed").reduce((s, t) => s + t.points, 0);

    return { earned, redeemed, balance: earned - redeemed };
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline">Edit User</Button>
          <Button className="bg-red-600 hover:bg-red-700">Ban User</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Role</p>
          <p className="text-lg font-bold text-gray-900 capitalize mt-1">
            {user.role}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Status</p>
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize mt-1 ${
              user.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {user.status}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Joined</p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Challenges</p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {challengeStats.total}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Points Balance</p>
          <p
            className={`text-lg font-bold mt-1 ${
              transactionStats.balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {transactionStats.balance}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: "overview" as TabId, label: "Overview", icon: "👤" },
            { id: "body-data" as TabId, label: "Body Data", icon: "📊" },
            { id: "training" as TabId, label: "Training", icon: "💪" },
            { id: "nutrition" as TabId, label: "Nutrition", icon: "🥗" },
            { id: "challenges" as TabId, label: "Challenges", icon: "🏆" },
            { id: "transactions" as TabId, label: "Transactions", icon: "💰" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                User Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className="font-semibold text-gray-900">
                    {user.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-900">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {user.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Current Goals
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600">• Lose 5kg in 30 days</p>
                <p className="text-gray-600">• Complete 50 push-ups</p>
                <p className="text-gray-600">• Run 5km without stopping</p>
              </div>
            </div>
          </div>
        )}

        {/* Body Data Tab */}
        {activeTab === "body-data" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Body Metrics Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Current Weight
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{body[body.length - 1].weightKg } kg</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {bodyDataStats.weightChange > 0 ? "↓" : "↑"}{" "}
                    {Math.abs(bodyDataStats.weightChange)} kg
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">Current BMI</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {bodyDataStats.currentBMI.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Normal range</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">Height</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {body[0].heightCm} cm
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Weight History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Weight (kg)
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Height (cm)
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        BMI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {body.map((data, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">
                          {new Date(data.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-gray-900">
                          {data.weightKg}
                        </td>
                        <td className="px-4 py-2 text-gray-900">
                          {data.heightCm}
                        </td>
                        <td className="px-4 py-2 text-gray-900">
                          {data.bmi.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Training Plans Tab */}
        {activeTab === "training" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Training Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Active Plans
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {trainingStats.active}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Completed Plans
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {trainingStats.completed}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Avg Completion
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {trainingStats.avgCompletion}%
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Training Plans History
              </h3>
              <div className="space-y-3">
                {usertraining.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {plan.name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          plan.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : plan.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(plan.startDate).toLocaleDateString()} →{" "}
                      {new Date(plan.endDate).toLocaleDateString()}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${plan.completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.completionPercentage}% Complete
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Plans Tab */}
        {activeTab === "nutrition" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Current Nutrition Plan
              </h3>
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    Balanced Diet Plan
                  </h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Target Calories</p>
                    <p className="text-lg font-bold text-gray-900">
                      2000 kcal/day
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Following</p>
                    <p className="text-lg font-bold text-gray-900">25 days</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Compliance</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "80%" }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">80% Compliant</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Meal History (Last 7 days)
              </h3>
              <div className="space-y-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-2 border-b hover:bg-gray-50"
                  >
                    <span className="text-gray-600">{day}</span>
                    <span className="font-semibold text-gray-900">
                      1950 kcal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Challenge Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Total Submissions
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {challengeStats.total}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">Approved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {challengeStats.approved}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Avg AI Score
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {challengeStats.avgScore}%
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Challenge Submissions
              </h3>
              <div className="space-y-3">
                {MOCK_CHALLENGES.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {challenge.name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          challenge.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {challenge.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Category</p>
                        <p className="font-semibold text-gray-900">
                          {challenge.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reps/Time</p>
                        <p className="font-semibold text-gray-900">
                          {challenge.userReps}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">AI Score</p>
                        <p className="font-semibold text-purple-600">
                          {challenge.aiScore}%
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(challenge.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Points Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Points Earned
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    +{transactionStats.earned}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Points Redeemed
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    -{transactionStats.redeemed}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">
                    Current Balance
                  </p>
                  <p
                    className={`text-3xl font-bold mt-2 ${
                      transactionStats.balance >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {transactionStats.balance}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Transaction History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {MOCK_TRANSACTIONS.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                              tx.type === "earned" || tx.type === "bonus"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-900">
                          {tx.description}
                        </td>
                        <td
                          className={`px-4 py-2 text-right font-semibold ${
                            tx.type === "earned" || tx.type === "bonus"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tx.type === "earned" || tx.type === "bonus"
                            ? "+"
                            : "-"}
                          {tx.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
