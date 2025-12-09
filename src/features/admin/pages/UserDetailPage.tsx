import { useState, useMemo, useEffect } from "react";
import { SimpleButton as Button } from "@/components/ui/simple-button";
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
  Edit2,
  X,
  Save,
  Plus,
} from "lucide-react";
import { AdminUser } from "../types/admin-entities";
import { infBodyAPI, trainingPlanAPI, challengeAPI } from "../api/adminAPI";
import client from "@/api/client";

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
  id: number; // This is utId (UserTraining ID)
  trainingPlanId?: number; // Template training plan ID
  name: string;
  startDate: string;
  endDate: string;
  completionPercentage: number;
  status: "active" | "completed" | "paused";
}

interface TrainingPlanDetail {
  id: number;
  trainingPlanId: number;
  dayNumber: number;
  dayName: string;
  challengeId: number;
  challengeName: string;
  sets: number;
  reps: number;
  duration?: number;
  restTime?: number;
  instructions?: string;
  difficulty?: string; // For PersonalizedPlanDetail
  targetMuscle?: string; // For PersonalizedPlanDetail
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
  const [usertraining , setUserTraining] = useState<UserTrainingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [planDetails, setPlanDetails] = useState<TrainingPlanDetail[]>([]);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editingDetails, setEditingDetails] = useState<{ [key: number]: TrainingPlanDetail }>({});
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [newDetail, setNewDetail] = useState<{
    dayNumber: number;
    challengeId: number;
    challengeName: string;
    sets: number;
    reps: number;
    duration?: number;
    instructions?: string;
  } | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [changingPlanId, setChangingPlanId] = useState<number | null>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedNewPlanId, setSelectedNewPlanId] = useState<number | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [personalizedDetailsMap, setPersonalizedDetailsMap] = useState<{ [key: number]: TrainingPlanDetail[] }>({});
  const [loadingDetails, setLoadingDetails] = useState<{ [key: number]: boolean }>({});
  const [completionStatusMap, setCompletionStatusMap] = useState<{ [key: number]: { [challengeId: number]: 'completed' | 'in_progress' | 'not_started' } }>({});
  const [dailyLogsMap, setDailyLogsMap] = useState<{ [key: number]: any[] }>({});
  
  // Helper function to get DailyTrainingLogs for admin (similar to myChallenge)
  const getDailyTrainingLogsForAdmin = async (userId: number, trainingPlanId: number): Promise<any[]> => {
    try {
      // Use the same endpoint as myChallenge, but we need to call it as admin
      // The backend should allow admin to access any user's logs
      const res = await client.get(`/user/daily-training-logs/plan/${trainingPlanId}`);
      if (res.data?.success && res.data?.data) {
        return res.data.data as any[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching daily training logs for admin:', error);
      return [];
    }
  };
  // ==========================
  // Fetch Body API
  // ==========================
  useEffect(() => {
    (async () => {
      try {
        const res = await infBodyAPI.getBodyData(user.id);
        
        // Backend trả về UserInfoDTO (object đơn), cần convert sang array format
        const bodyData = res.data?.data;
        if (bodyData) {
          // Convert UserInfoDTO to UserBodyData array format
          // Handle BigDecimal conversion (backend sends numbers as strings or numbers)
          const bodyArray: UserBodyData[] = [{
            createdAt: bodyData.createdAt || new Date().toISOString(),
            weightKg: typeof bodyData.weightKg === 'number' ? bodyData.weightKg : 
                      (bodyData.weightKg ? parseFloat(String(bodyData.weightKg)) : 0),
            heightCm: typeof bodyData.heightCm === 'number' ? bodyData.heightCm : 
                      (bodyData.heightCm ? parseFloat(String(bodyData.heightCm)) : 0),
            bmi: typeof bodyData.bmi === 'number' ? bodyData.bmi : 
                 (bodyData.bmi ? parseFloat(String(bodyData.bmi)) : 0),
            bodyFatPct: bodyData.bodyFatPct ? 
                       (typeof bodyData.bodyFatPct === 'number' ? bodyData.bodyFatPct : 
                        parseFloat(String(bodyData.bodyFatPct))) : undefined,
            gender: bodyData.gender,
            goalName: bodyData.goalName,
          }];
          setBody(bodyArray);
          console.log("✅ Body data loaded:", bodyArray);
        } else {
          setBody([]);
          console.log("⚠️ No body data found");
        }

        const res_training = await trainingPlanAPI.getById(user.id)
        console.log("Log data usertraining DTO", res_training.data.data)
        const trainingPlans = res_training.data.data ?? [];
        setUserTraining(trainingPlans);
        
        // Load DailyTrainingLogs for all plans to calculate accurate progress (same as myChallenge detail)
        const logsMap: { [key: number]: any[] } = {};
        const statusMap: { [key: number]: { [challengeId: number]: 'completed' | 'in_progress' | 'not_started' } } = {};
        
        for (const plan of trainingPlans) {
          try {
            const logs = await getDailyTrainingLogsForAdmin(user.id, plan.trainingPlanId || plan.id);
            logsMap[plan.id] = logs;
            
            // Calculate completion status map from DailyTrainingLog
            const completionMap: { [challengeId: number]: 'completed' | 'in_progress' | 'not_started' } = {};
            logs.forEach((log: any) => {
              if (log.challengeId && log.status) {
                completionMap[log.challengeId] = log.status === 'completed' ? 'completed' : 
                                                log.status === 'in_progress' ? 'in_progress' : 'not_started';
              }
            });
            statusMap[plan.id] = completionMap;
          } catch (error) {
            console.warn(`Could not load logs for plan ${plan.id}:`, error);
            logsMap[plan.id] = [];
            statusMap[plan.id] = {};
          }
        }
        
        setDailyLogsMap(logsMap);
        setCompletionStatusMap(statusMap);
      } catch (err) {
        console.error("❌ Fetch body data fail:", err);
        setBody([]); // Set empty array on error
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
    if (!current) {
      return { avgWeight: 0, currentBMI: 0, weightChange: 0 };
    }

    console.log("Current 0", current.weightKg);
    const previous = body[body.length - 1];

    const avgWeight = body.reduce((sum, d) => sum + (d.weightKg || 0), 0) / body.length;

    return {
      avgWeight: Math.round(avgWeight * 10) / 10,
      currentBMI: current.bmi || 0,
      weightChange: previous && previous.weightKg ? previous.weightKg - (current.weightKg || 0) : 0,
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
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {body.length > 0 ? `${body[body.length - 1]?.weightKg || 0} kg` : "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {body.length > 0 && bodyDataStats.weightChange !== 0 ? (
                      <>
                        {bodyDataStats.weightChange > 0 ? "↓" : "↑"}{" "}
                        {Math.abs(bodyDataStats.weightChange)} kg
                      </>
                    ) : (
                      "No change"
                    )}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">Current BMI</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {body.length > 0 ? bodyDataStats.currentBMI.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Normal range</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 uppercase">Height</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {body.length > 0 ? `${body[0]?.heightCm || 0} cm` : "N/A"}
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
                    {body.length > 0 ? (
                      body.map((data, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">
                            {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-4 py-2 text-gray-900">
                            {data.weightKg || 0}
                          </td>
                          <td className="px-4 py-2 text-gray-900">
                            {data.heightCm || 0}
                          </td>
                          <td className="px-4 py-2 text-gray-900">
                            {data.bmi ? data.bmi.toFixed(1) : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No body data available
                        </td>
                      </tr>
                    )}
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
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Training Plans History
                </h3>
              </div>
              <div className="space-y-3">
                {usertraining.map((plan) => {
                  const isExpanded = expandedPlanId === plan.id;
                  const details = personalizedDetailsMap[plan.id] || [];
                  const isLoading = loadingDetails[plan.id] || false;
                  
                  return (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {plan.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(plan.startDate).toLocaleDateString()} → {new Date(plan.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async () => {
                              try {
                                setSelectedPlanId(plan.id);
                                
                                // Load PersonalizedPlanDetail instead of template
                                // plan.id is utId (UserTraining ID)
                                const response = await trainingPlanAPI.getPersonalizedDetails(user.id, plan.id);
                                const details = response.data?.data || [];
                                
                                if (details.length === 0) {
                                  // Fallback to template if no personalized details
                                  console.log("⚠️ No personalized details found, loading template...");
                                  setIsPersonalized(false);
                                  const templateResponse = await client.get(
                                    `/admin/training-plan-details/${plan.trainingPlanId || plan.id}`
                                  );
                                  const templateDetails = templateResponse.data?.data || [];
                                  
                                  const mappedDetails: TrainingPlanDetail[] = templateDetails.map((detail: any) => ({
                                    id: detail.id || detail.tpdId,
                                    trainingPlanId: detail.trainingPlanId,
                                    dayNumber: detail.dayNumber,
                                    dayName: `Day ${detail.dayNumber}`,
                                    challengeId: detail.challenge?.id || detail.challengeId || 0,
                                    challengeName: detail.challengeName || detail.challenge?.title || "",
                                    sets: detail.sets || 0,
                                    reps: detail.reps || 0,
                                    duration: detail.duration,
                                    restTime: detail.restTime,
                                    instructions: detail.instructions,
                                  }));
                                  setPlanDetails(mappedDetails);
                                } else {
                                  // Map PersonalizedPlanDetail to TrainingPlanDetail format
                                  setIsPersonalized(true);
                                  const mappedDetails: TrainingPlanDetail[] = details.map((detail: any) => ({
                                    id: detail.id || detail.ppdId, // PersonalizedPlanDetail ID
                                    trainingPlanId: plan.trainingPlanId || plan.id,
                                    dayNumber: detail.dayNumber,
                                    dayName: `Day ${detail.dayNumber}`,
                                    challengeId: detail.challengeId || 0,
                                    challengeName: detail.challengeName || detail.exerciseName || "",
                                    sets: detail.sets || 0,
                                    reps: detail.reps || 0,
                                    difficulty: detail.difficulty,
                                    targetMuscle: detail.targetMuscle,
                                    // PersonalizedPlanDetail doesn't have duration/restTime/instructions
                                    duration: undefined,
                                    restTime: undefined,
                                    instructions: undefined,
                                  }));
                                  setPlanDetails(mappedDetails);
                                }
                                
                                setIsEditingPlan(true);
                                // Initialize editing state
                                const editingState: { [key: number]: TrainingPlanDetail } = {};
                                planDetails.forEach((detail: TrainingPlanDetail) => {
                                  if (detail.id) {
                                    editingState[detail.id] = { ...detail };
                                  }
                                });
                                setEditingDetails(editingState);
                                
                                // Load challenges for dropdown
                                try {
                                  const challengesRes = await challengeAPI.getAll();
                                  const challengesData = challengesRes.data?.data || challengesRes.data || [];
                                  setChallenges(Array.isArray(challengesData) ? challengesData : []);
                                } catch (err) {
                                  console.error("Error loading challenges:", err);
                                  setChallenges([]);
                                }
                              } catch (error) {
                                console.error("Error loading plan details:", error);
                                alert("Không thể tải chi tiết training plan");
                              }
                            }}
                            className="p-2 hover:bg-blue-100 rounded text-blue-600 transition"
                            title="Edit Personalized Training Plan Details"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                // Load available training plans
                                const plansRes = await trainingPlanAPI.getAll();
                                const plansData = plansRes.data?.data || [];
                                setAvailablePlans(Array.isArray(plansData) ? plansData : []);
                                setChangingPlanId(plan.id);
                                setSelectedNewPlanId(null);
                                setIsChangingPlan(true);
                              } catch (error) {
                                console.error("Error loading training plans:", error);
                                alert("Không thể tải danh sách training plans");
                              }
                            }}
                            className="p-2 hover:bg-green-100 rounded text-green-600 transition"
                            title="Change Training Plan"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {(() => {
                      // Calculate accurate completion percentage from DailyTrainingLog (same as myChallenge detail)
                      const dailyLogs = dailyLogsMap[plan.id] || [];
                      const completionMap = completionStatusMap[plan.id] || {};
                      const details = personalizedDetailsMap[plan.id] || [];
                      
                      let accuratePercentage = plan.completionPercentage;
                      let completedCount = 0;
                      let totalCount = 0;
                      
                      if (dailyLogs.length > 0) {
                        // Use DailyTrainingLog to calculate progress (same as myChallenge detail)
                        totalCount = dailyLogs.length;
                        completedCount = dailyLogs.filter((log: any) => log.status === 'completed').length;
                        accuratePercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      } else if (details.length > 0) {
                        // Fallback: use personalized details if no DailyTrainingLog
                        totalCount = details.length;
                        completedCount = details.filter(d => completionMap[d.challengeId] === 'completed').length;
                        accuratePercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      }
                      
                      return (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${accuratePercentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-700">
                              {accuratePercentage}% Complete
                            </p>
                            {totalCount > 0 && (
                              <p className="text-xs text-gray-500">
                                {completedCount}/{totalCount} challenges completed
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                    
                    {/* View/Expand Personalized Details Button */}
                    <button
                      onClick={async () => {
                        if (isExpanded) {
                          setExpandedPlanId(null);
                        } else {
                          setExpandedPlanId(plan.id);
                          if (!personalizedDetailsMap[plan.id]) {
                            // Load personalized details
                            setLoadingDetails({ ...loadingDetails, [plan.id]: true });
                            try {
                              // Load personalized details
                              const response = await trainingPlanAPI.getPersonalizedDetails(user.id, plan.id);
                              const details = response.data?.data || [];
                              
                              // Load completion status from DailyTrainingLog (same as myChallenge detail)
                              let completionMap: { [challengeId: number]: 'completed' | 'in_progress' | 'not_started' } = {};
                              let dailyLogs: any[] = [];
                              try {
                                // Get DailyTrainingLogs using the same method as myChallenge detail
                                dailyLogs = await getDailyTrainingLogsForAdmin(user.id, plan.trainingPlanId || plan.id);
                                
                                // Map logs to completion status by challengeId
                                dailyLogs.forEach((log: any) => {
                                  if (log.challengeId && log.status) {
                                    completionMap[log.challengeId] = log.status === 'completed' ? 'completed' : 
                                                                    log.status === 'in_progress' ? 'in_progress' : 'not_started';
                                  }
                                });
                                
                                // Store logs for progress calculation
                                setDailyLogsMap({
                                  ...dailyLogsMap,
                                  [plan.id]: dailyLogs,
                                });
                              } catch (logError) {
                                console.warn("Could not load completion status:", logError);
                                // Continue without completion status
                              }
                              
                              if (details.length > 0) {
                                const mappedDetails: TrainingPlanDetail[] = details.map((detail: any) => ({
                                  id: detail.id || detail.ppdId,
                                  trainingPlanId: plan.trainingPlanId || plan.id,
                                  dayNumber: detail.dayNumber,
                                  dayName: `Day ${detail.dayNumber}`,
                                  challengeId: detail.challengeId || 0,
                                  challengeName: detail.challengeName || detail.exerciseName || "",
                                  sets: detail.sets || 0,
                                  reps: detail.reps || 0,
                                  difficulty: detail.difficulty,
                                  targetMuscle: detail.targetMuscle,
                                }));
                                setPersonalizedDetailsMap({
                                  ...personalizedDetailsMap,
                                  [plan.id]: mappedDetails,
                                });
                                setCompletionStatusMap({
                                  ...completionStatusMap,
                                  [plan.id]: completionMap,
                                });
                              } else {
                                // No personalized details, show message
                                setPersonalizedDetailsMap({
                                  ...personalizedDetailsMap,
                                  [plan.id]: [],
                                });
                                setCompletionStatusMap({
                                  ...completionStatusMap,
                                  [plan.id]: completionMap,
                                });
                              }
                            } catch (error) {
                              console.error("Error loading personalized details:", error);
                              setPersonalizedDetailsMap({
                                ...personalizedDetailsMap,
                                [plan.id]: [],
                              });
                            } finally {
                              setLoadingDetails({ ...loadingDetails, [plan.id]: false });
                            }
                          }
                        }
                      }}
                      className="w-full px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 transition flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          Loading...
                        </>
                      ) : isExpanded ? (
                        <>
                          <X size={16} />
                          Hide Personalized Exercises
                        </>
                      ) : (
                        <>
                          <Edit2 size={16} />
                          View & Edit Personalized Exercises
                        </>
                      )}
                    </button>
                    
                    {/* Expanded Personalized Details */}
                    {isExpanded && details.length > 0 && (() => {
                      // Calculate progress from DailyTrainingLog (same as myChallenge detail)
                      const dailyLogs = dailyLogsMap[plan.id] || [];
                      const completionMap = completionStatusMap[plan.id] || {};
                      
                      let completedCount = 0;
                      let totalCount = details.length;
                      let completionPercentage = 0;
                      
                      if (dailyLogs.length > 0) {
                        // Use DailyTrainingLog to calculate (same as myChallenge detail)
                        totalCount = dailyLogs.length;
                        completedCount = dailyLogs.filter((log: any) => log.status === 'completed').length;
                        completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      } else {
                        // Fallback: use completionMap from personalized details
                        completedCount = details.filter(d => completionMap[d.challengeId] === 'completed').length;
                        completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      }
                      
                      return (
                      <div className="mt-4 border-t pt-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                              ✨ Personalized Exercises ({totalCount} exercises)
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              ✅ Completed: {completedCount}/{totalCount} ({completionPercentage}%)
                            </span>
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {Object.entries(
                            details.reduce((acc, detail) => {
                              const dayKey = `Day ${detail.dayNumber}`;
                              if (!acc[dayKey]) {
                                acc[dayKey] = [];
                              }
                              acc[dayKey].push(detail);
                              return acc;
                            }, {} as { [key: string]: TrainingPlanDetail[] })
                          ).map(([dayKey, dayDetails]) => (
                            <div key={dayKey} className="border border-purple-200 rounded-lg p-3 bg-purple-50/30">
                              <h5 className="font-semibold text-purple-900 mb-2 text-sm">{dayKey}</h5>
                              <div className="space-y-2">
                                {dayDetails.map((detail) => {
                                  const isCompleted = completionMap[detail.challengeId] === 'completed';
                                  const isInProgress = completionMap[detail.challengeId] === 'in_progress';
                                  
                                  return (
                                  <div key={detail.id} className={`rounded p-3 border-2 ${
                                    isCompleted 
                                      ? 'bg-green-50 border-green-300' 
                                      : isInProgress
                                      ? 'bg-yellow-50 border-yellow-300'
                                      : 'bg-white border-purple-200'
                                  }`}>
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-gray-900 text-sm">{detail.challengeName}</p>
                                          {isCompleted && (
                                            <span className="px-1.5 py-0.5 bg-green-600 text-white rounded text-[10px] font-bold">
                                              ✓ COMPLETED
                                            </span>
                                          )}
                                          {isInProgress && (
                                            <span className="px-1.5 py-0.5 bg-yellow-600 text-white rounded text-[10px] font-bold">
                                              ⏳ IN PROGRESS
                                            </span>
                                          )}
                                        </div>
                                        {detail.targetMuscle && (
                                          <p className="text-xs text-gray-500 mt-0.5">Target: {detail.targetMuscle}</p>
                                        )}
                                      </div>
                                      {detail.difficulty && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          detail.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                                          detail.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {detail.difficulty}
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs text-gray-600 font-medium">Sets</label>
                                        <input
                                          type="number"
                                          value={detail.sets || 0}
                                          onChange={(e) => {
                                            const newDetails = [...details];
                                            const index = newDetails.findIndex(d => d.id === detail.id);
                                            if (index >= 0) {
                                              newDetails[index] = { ...newDetails[index], sets: parseInt(e.target.value) || 0 };
                                              setPersonalizedDetailsMap({
                                                ...personalizedDetailsMap,
                                                [plan.id]: newDetails,
                                              });
                                            }
                                          }}
                                          disabled={isCompleted}
                                          className={`w-full px-2 py-1 border rounded text-sm ${
                                            isCompleted
                                              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                              : 'border-purple-300 bg-purple-50 focus:bg-white focus:border-purple-500'
                                          }`}
                                          min="1"
                                          title={isCompleted ? "This challenge is completed and cannot be edited" : ""}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-600 font-medium">Reps</label>
                                        <input
                                          type="number"
                                          value={detail.reps || 0}
                                          onChange={(e) => {
                                            const newDetails = [...details];
                                            const index = newDetails.findIndex(d => d.id === detail.id);
                                            if (index >= 0) {
                                              newDetails[index] = { ...newDetails[index], reps: parseInt(e.target.value) || 0 };
                                              setPersonalizedDetailsMap({
                                                ...personalizedDetailsMap,
                                                [plan.id]: newDetails,
                                              });
                                            }
                                          }}
                                          disabled={isCompleted}
                                          className={`w-full px-2 py-1 border rounded text-sm ${
                                            isCompleted
                                              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                              : 'border-purple-300 bg-purple-50 focus:bg-white focus:border-purple-500'
                                          }`}
                                          min="1"
                                          title={isCompleted ? "This challenge is completed and cannot be edited" : ""}
                                        />
                                      </div>
                                    </div>
                                    {isCompleted && (
                                      <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                                        <span>✓</span> This challenge has been completed. Editing is disabled.
                                      </p>
                                    )}
                                  </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Save Button */}
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setExpandedPlanId(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              try {
                                // Only save challenges that are not completed
                                const completionMap = completionStatusMap[plan.id] || {};
                                const incompleteDetails = details.filter(d => completionMap[d.challengeId] !== 'completed');
                                
                                if (incompleteDetails.length === 0) {
                                  alert("All challenges are completed. No changes to save.");
                                  return;
                                }
                                
                                const savePromises = incompleteDetails.map((detail) => {
                                  if (!detail.id) return Promise.resolve();
                                  return trainingPlanAPI.updatePersonalizedDetail(
                                    user.id,
                                    plan.id,
                                    detail.id,
                                    {
                                      sets: detail.sets,
                                      reps: detail.reps,
                                      difficulty: detail.difficulty,
                                      targetMuscle: detail.targetMuscle,
                                      exerciseName: detail.challengeName,
                                    }
                                  );
                                });
                                
                                await Promise.all(savePromises);
                                alert(`Personalized exercises updated successfully! (${incompleteDetails.length} challenges updated)`);
                                
                                // Reload to get fresh data
                                const response = await trainingPlanAPI.getPersonalizedDetails(user.id, plan.id);
                                const updatedDetails = response.data?.data || [];
                                if (updatedDetails.length > 0) {
                                  const mappedDetails: TrainingPlanDetail[] = updatedDetails.map((detail: any) => ({
                                    id: detail.id || detail.ppdId,
                                    trainingPlanId: plan.trainingPlanId || plan.id,
                                    dayNumber: detail.dayNumber,
                                    dayName: `Day ${detail.dayNumber}`,
                                    challengeId: detail.challengeId || 0,
                                    challengeName: detail.challengeName || detail.exerciseName || "",
                                    sets: detail.sets || 0,
                                    reps: detail.reps || 0,
                                    difficulty: detail.difficulty,
                                    targetMuscle: detail.targetMuscle,
                                  }));
                                  setPersonalizedDetailsMap({
                                    ...personalizedDetailsMap,
                                    [plan.id]: mappedDetails,
                                  });
                                }
                              } catch (error: any) {
                                console.error("Error saving personalized details:", error);
                                alert(error?.response?.data?.message || "Error saving personalized exercises");
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Save size={14} className="mr-1" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                      );
                    })()}
                    
                    {isExpanded && details.length === 0 && !isLoading && (
                      <div className="mt-4 border-t pt-4">
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No personalized exercises found for this plan.</p>
                          <p className="text-xs mt-1">This plan is using template exercises.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
            
            {/* Edit Training Plan Details Modal */}
            {isEditingPlan && selectedPlanId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {isPersonalized ? "Edit Personalized Training Plan" : "Edit Training Plan Template"}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        User: {user.fullName} | Plan ID: {selectedPlanId}
                        {isPersonalized && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            ✨ Personalized
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditingPlan(false);
                        setSelectedPlanId(null);
                        setPlanDetails([]);
                        setEditingDetails({});
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X size={24} className="text-gray-600" />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {planDetails.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No training plan details found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Group by day */}
                        {Object.entries(
                          planDetails.reduce((acc, detail) => {
                            const dayKey = `Day ${detail.dayNumber}`;
                            if (!acc[dayKey]) {
                              acc[dayKey] = [];
                            }
                            acc[dayKey].push(detail);
                            return acc;
                          }, {} as { [key: string]: TrainingPlanDetail[] })
                        ).map(([dayKey, details]) => {
                          const dayNumber = parseInt(dayKey.replace("Day ", ""));
                          return (
                          <div key={dayKey} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">{dayKey}</h3>
                              <button
                                onClick={() => {
                                  setAddingDay(dayNumber);
                                  setNewDetail({
                                    dayNumber: dayNumber,
                                    challengeId: 0,
                                    challengeName: "",
                                    sets: 0,
                                    reps: 0,
                                    duration: undefined,
                                    instructions: "",
                                  });
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                              >
                                <Plus size={14} />
                                Add Detail
                              </button>
                            </div>
                            <div className="space-y-3">
                              {details.map((detail) => {
                                const editing = editingDetails[detail.id];
                                if (!editing) return null;
                                
                                return (
                                  <div key={detail.id} className={`rounded-lg p-4 border-2 ${isPersonalized ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-300'}`}>
                                    {isPersonalized && (
                                      <div className="mb-3 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                          ✨ Personalized Training
                                        </span>
                                        <span className="text-xs text-gray-600">
                                          Admin can edit sets and reps for this user
                                        </span>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <label className="text-xs text-gray-600 uppercase mb-1 block font-semibold">
                                          Challenge
                                        </label>
                                        <input
                                          type="text"
                                          value={editing.challengeName || ""}
                                          onChange={(e) => {
                                            setEditingDetails({
                                              ...editingDetails,
                                              [detail.id]: {
                                                ...editing,
                                                challengeName: e.target.value,
                                              },
                                            });
                                          }}
                                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                          disabled={isPersonalized}
                                          title={isPersonalized ? "Challenge cannot be changed for personalized plans" : ""}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-600 uppercase mb-1 block font-semibold">
                                          Sets {isPersonalized && <span className="text-purple-600">*</span>}
                                        </label>
                                        <input
                                          type="number"
                                          value={editing.sets || 0}
                                          onChange={(e) => {
                                            setEditingDetails({
                                              ...editingDetails,
                                              [detail.id]: {
                                                ...editing,
                                                sets: parseInt(e.target.value) || 0,
                                              },
                                            });
                                          }}
                                          className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-semibold ${
                                            isPersonalized 
                                              ? 'bg-purple-100 border-purple-400 focus:border-purple-600' 
                                              : 'bg-white border-gray-300'
                                          }`}
                                          min="1"
                                        />
                                        {isPersonalized && (
                                          <p className="text-[10px] text-purple-600 mt-0.5">Personalized for user</p>
                                        )}
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-600 uppercase mb-1 block font-semibold">
                                          Reps {isPersonalized && <span className="text-purple-600">*</span>}
                                        </label>
                                        <input
                                          type="number"
                                          value={editing.reps || 0}
                                          onChange={(e) => {
                                            setEditingDetails({
                                              ...editingDetails,
                                              [detail.id]: {
                                                ...editing,
                                                reps: parseInt(e.target.value) || 0,
                                              },
                                            });
                                          }}
                                          className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-semibold ${
                                            isPersonalized 
                                              ? 'bg-purple-100 border-purple-400 focus:border-purple-600' 
                                              : 'bg-white border-gray-300'
                                          }`}
                                          min="1"
                                        />
                                        {isPersonalized && (
                                          <p className="text-[10px] text-purple-600 mt-0.5">Personalized for user</p>
                                        )}
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-600 uppercase mb-1 block">
                                          Duration (sec)
                                        </label>
                                        <input
                                          type="number"
                                          value={editing.duration || ""}
                                          onChange={(e) => {
                                            setEditingDetails({
                                              ...editingDetails,
                                              [detail.id]: {
                                                ...editing,
                                                duration: parseInt(e.target.value) || undefined,
                                              },
                                            });
                                          }}
                                          className="w-full px-3 py-2 border rounded-lg text-sm"
                                          placeholder="Optional"
                                        />
                                      </div>
                                    </div>
                                    {editing.instructions !== undefined && (
                                      <div className="mt-3">
                                        <label className="text-xs text-gray-600 uppercase mb-1 block">
                                          Instructions
                                        </label>
                                        <textarea
                                          value={editing.instructions || ""}
                                          onChange={(e) => {
                                            setEditingDetails({
                                              ...editingDetails,
                                              [detail.id]: {
                                                ...editing,
                                                instructions: e.target.value,
                                              },
                                            });
                                          }}
                                          className="w-full px-3 py-2 border rounded-lg text-sm"
                                          rows={2}
                                          placeholder="Optional instructions"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              
                              {/* Add New Detail Form */}
                              {addingDay === dayNumber && newDetail && (
                                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-blue-900">Add New Training Detail</h4>
                                    <button
                                      onClick={() => {
                                        setAddingDay(null);
                                        setNewDetail(null);
                                      }}
                                      className="p-1 hover:bg-blue-200 rounded text-blue-700"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    <div>
                                      <label className="text-xs text-gray-600 uppercase mb-1 block">
                                        Challenge *
                                      </label>
                                      <select
                                        value={newDetail.challengeId}
                                        onChange={(e) => {
                                          const selectedChallenge = challenges.find(
                                            (c) => c.id === parseInt(e.target.value)
                                          );
                                          setNewDetail({
                                            ...newDetail,
                                            challengeId: parseInt(e.target.value) || 0,
                                            challengeName: selectedChallenge?.title || selectedChallenge?.name || "",
                                          });
                                        }}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        required
                                      >
                                        <option value={0}>Select Challenge</option>
                                        {challenges.map((challenge) => (
                                          <option key={challenge.id} value={challenge.id}>
                                            {challenge.title || challenge.name || `Challenge ${challenge.id}`}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 uppercase mb-1 block">
                                        Sets *
                                      </label>
                                      <input
                                        type="number"
                                        value={newDetail.sets || ""}
                                        onChange={(e) => {
                                          setNewDetail({
                                            ...newDetail,
                                            sets: parseInt(e.target.value) || 0,
                                          });
                                        }}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        required
                                        min="1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 uppercase mb-1 block">
                                        Reps *
                                      </label>
                                      <input
                                        type="number"
                                        value={newDetail.reps || ""}
                                        onChange={(e) => {
                                          setNewDetail({
                                            ...newDetail,
                                            reps: parseInt(e.target.value) || 0,
                                          });
                                        }}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        required
                                        min="1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 uppercase mb-1 block">
                                        Duration (sec)
                                      </label>
                                      <input
                                        type="number"
                                        value={newDetail.duration || ""}
                                        onChange={(e) => {
                                          setNewDetail({
                                            ...newDetail,
                                            duration: parseInt(e.target.value) || undefined,
                                          });
                                        }}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder="Optional"
                                        min="0"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <label className="text-xs text-gray-600 uppercase mb-1 block">
                                      Instructions
                                    </label>
                                    <textarea
                                      value={newDetail.instructions || ""}
                                      onChange={(e) => {
                                        setNewDetail({
                                          ...newDetail,
                                          instructions: e.target.value,
                                        });
                                      }}
                                      className="w-full px-3 py-2 border rounded-lg text-sm"
                                      rows={2}
                                      placeholder="Optional instructions"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={async () => {
                                        if (!newDetail.challengeId || !newDetail.sets || !newDetail.reps) {
                                          alert("Please fill in all required fields (Challenge, Sets, Reps)");
                                          return;
                                        }
                                        
                                        try {
                                          const response = await client.post(
                                            `/admin/training-plan-details`,
                                            {
                                              trainingPlanId: selectedPlanId,
                                              dayNumber: newDetail.dayNumber,
                                              challengeId: newDetail.challengeId,
                                              sets: newDetail.sets,
                                              reps: newDetail.reps,
                                              duration: newDetail.duration,
                                              restTime: undefined,
                                              instructions: newDetail.instructions,
                                            }
                                          );
                                          
                                          if (response.data?.success) {
                                            // Reload plan details
                                            const detailsResponse = await client.get(
                                              `/admin/training-plan-details/${selectedPlanId}`
                                            );
                                            const updatedDetails = detailsResponse.data?.data || [];
                                            setPlanDetails(updatedDetails);
                                            
                                            // Update editing state
                                            const editingState: { [key: number]: TrainingPlanDetail } = {};
                                            updatedDetails.forEach((detail: TrainingPlanDetail) => {
                                              editingState[detail.id] = { ...detail };
                                            });
                                            setEditingDetails(editingState);
                                            
                                            // Reset form
                                            setAddingDay(null);
                                            setNewDetail(null);
                                            
                                            alert("Training plan detail added successfully!");
                                          } else {
                                            alert(response.data?.message || "Error adding detail");
                                          }
                                        } catch (error: any) {
                                          console.error("Error adding detail:", error);
                                          alert(error?.response?.data?.message || "Error adding training plan detail");
                                        }
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Plus size={14} className="mr-1" />
                                      Add Detail
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setAddingDay(null);
                                        setNewDetail(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )})}
                        
                        {/* Add New Day Section */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <button
                            onClick={() => {
                              // Find max day number
                              const maxDay = planDetails.length > 0
                                ? Math.max(...planDetails.map(d => d.dayNumber))
                                : 0;
                              const newDayNumber = maxDay + 1;
                              
                              setAddingDay(newDayNumber);
                              setNewDetail({
                                dayNumber: newDayNumber,
                                challengeId: 0,
                                challengeName: "",
                                sets: 0,
                                reps: 0,
                                duration: undefined,
                                instructions: "",
                              });
                            }}
                            className="w-full py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <Plus size={18} />
                            Add New Day
                          </button>
                          
                          {addingDay && addingDay > Math.max(...(planDetails.length > 0 ? planDetails.map(d => d.dayNumber) : [0])) && newDetail && (
                            <div className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-blue-900">Add New Day {newDetail.dayNumber}</h4>
                                <button
                                  onClick={() => {
                                    setAddingDay(null);
                                    setNewDetail(null);
                                  }}
                                  className="p-1 hover:bg-blue-200 rounded text-blue-700"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div>
                                  <label className="text-xs text-gray-600 uppercase mb-1 block">
                                    Challenge *
                                  </label>
                                  <select
                                    value={newDetail.challengeId}
                                    onChange={(e) => {
                                      const selectedChallenge = challenges.find(
                                        (c) => c.id === parseInt(e.target.value)
                                      );
                                      setNewDetail({
                                        ...newDetail,
                                        challengeId: parseInt(e.target.value) || 0,
                                        challengeName: selectedChallenge?.title || selectedChallenge?.name || "",
                                      });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    required
                                  >
                                    <option value={0}>Select Challenge</option>
                                    {challenges.map((challenge) => (
                                      <option key={challenge.id} value={challenge.id}>
                                        {challenge.title || challenge.name || `Challenge ${challenge.id}`}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 uppercase mb-1 block">
                                    Sets *
                                  </label>
                                  <input
                                    type="number"
                                    value={newDetail.sets || ""}
                                    onChange={(e) => {
                                      setNewDetail({
                                        ...newDetail,
                                        sets: parseInt(e.target.value) || 0,
                                      });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    required
                                    min="1"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 uppercase mb-1 block">
                                    Reps *
                                  </label>
                                  <input
                                    type="number"
                                    value={newDetail.reps || ""}
                                    onChange={(e) => {
                                      setNewDetail({
                                        ...newDetail,
                                        reps: parseInt(e.target.value) || 0,
                                      });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    required
                                    min="1"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 uppercase mb-1 block">
                                    Duration (sec)
                                  </label>
                                  <input
                                    type="number"
                                    value={newDetail.duration || ""}
                                    onChange={(e) => {
                                      setNewDetail({
                                        ...newDetail,
                                        duration: parseInt(e.target.value) || undefined,
                                      });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    placeholder="Optional"
                                    min="0"
                                  />
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <label className="text-xs text-gray-600 uppercase mb-1 block">
                                  Instructions
                                </label>
                                <textarea
                                  value={newDetail.instructions || ""}
                                  onChange={(e) => {
                                    setNewDetail({
                                      ...newDetail,
                                      instructions: e.target.value,
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  rows={2}
                                  placeholder="Optional instructions"
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={async () => {
                                    if (!newDetail.challengeId || !newDetail.sets || !newDetail.reps) {
                                      alert("Please fill in all required fields (Challenge, Sets, Reps)");
                                      return;
                                    }
                                    
                                    try {
                                      const response = await client.post(
                                        `/admin/training-plan-details`,
                                        {
                                          trainingPlanId: selectedPlanId,
                                          dayNumber: newDetail.dayNumber,
                                          challengeId: newDetail.challengeId,
                                          sets: newDetail.sets,
                                          reps: newDetail.reps,
                                          duration: newDetail.duration,
                                          restTime: undefined,
                                          instructions: newDetail.instructions,
                                        }
                                      );
                                      
                                      if (response.data?.success) {
                                        // Reload plan details
                                        const detailsResponse = await client.get(
                                          `/admin/training-plan-details/${selectedPlanId}`
                                        );
                                        const updatedDetails = detailsResponse.data?.data || [];
                                        setPlanDetails(updatedDetails);
                                        
                                        // Update editing state
                                        const editingState: { [key: number]: TrainingPlanDetail } = {};
                                        updatedDetails.forEach((detail: TrainingPlanDetail) => {
                                          editingState[detail.id] = { ...detail };
                                        });
                                        setEditingDetails(editingState);
                                        
                                        // Reset form
                                        setAddingDay(null);
                                        setNewDetail(null);
                                        
                                        alert("Training plan detail added successfully!");
                                      } else {
                                        alert(response.data?.message || "Error adding detail");
                                      }
                                    } catch (error: any) {
                                      console.error("Error adding detail:", error);
                                      alert(error?.response?.data?.message || "Error adding training plan detail");
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus size={14} className="mr-1" />
                                  Add Detail
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAddingDay(null);
                                    setNewDetail(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingPlan(false);
                        setSelectedPlanId(null);
                        setPlanDetails([]);
                        setEditingDetails({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          // Filter out details without valid ID and save all edited details
                          const validDetails = Object.values(editingDetails).filter(
                            (detail) => detail.id && detail.id > 0
                          );
                          
                          if (validDetails.length === 0) {
                            alert("No valid details to save");
                            return;
                          }
                          
                          const savePromises = validDetails.map((detail) => {
                            if (!detail.id) {
                              console.warn("Detail missing ID:", detail);
                              return Promise.resolve();
                            }
                            
                            // Check if this is a PersonalizedPlanDetail based on isPersonalized flag
                            if (isPersonalized && selectedPlanId) {
                              // This is a PersonalizedPlanDetail - use personalized update API
                              return trainingPlanAPI.updatePersonalizedDetail(
                                user.id,
                                selectedPlanId,
                                detail.id,
                                {
                                  sets: detail.sets,
                                  reps: detail.reps,
                                  difficulty: detail.difficulty,
                                  targetMuscle: detail.targetMuscle,
                                  exerciseName: detail.challengeName,
                                }
                              );
                            } else {
                              // This is a template TrainingPlanDetail - use template API
                              return client.put(`/admin/training-plan-details/${detail.id}`, {
                                trainingPlanId: detail.trainingPlanId,
                                dayNumber: detail.dayNumber,
                                challengeId: detail.challengeId,
                                sets: detail.sets,
                                reps: detail.reps,
                                duration: detail.duration,
                                restTime: detail.restTime,
                                instructions: detail.instructions,
                              });
                            }
                          });
                          
                          await Promise.all(savePromises);
                          alert("Training plan details updated successfully!");
                          setIsEditingPlan(false);
                          setSelectedPlanId(null);
                          setPlanDetails([]);
                          setEditingDetails({});
                          
                          // Reload training plans
                          const res_training = await trainingPlanAPI.getById(user.id);
                          setUserTraining(res_training.data.data ?? []);
                        } catch (error: any) {
                          console.error("Error saving plan details:", error);
                          alert(error?.response?.data?.message || "Error saving training plan details");
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Change Training Plan Modal */}
        {isChangingPlan && changingPlanId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Change Training Plan</h2>
                <button
                  onClick={() => {
                    setIsChangingPlan(false);
                    setChangingPlanId(null);
                    setSelectedNewPlanId(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Training Plan
                  </label>
                  <select
                    value={selectedNewPlanId || ""}
                    onChange={(e) => setSelectedNewPlanId(parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Training Plan --</option>
                    {availablePlans.map((plan) => (
                      <option key={plan.id || plan.tpId} value={plan.id || plan.tpId}>
                        {plan.name || plan.planName} - {plan.difficulty || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Warning: Changing the training plan will replace the current plan. 
                    All personalized settings will be reset based on the new plan.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPlan(false);
                    setChangingPlanId(null);
                    setSelectedNewPlanId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedNewPlanId) {
                      alert("Please select a training plan");
                      return;
                    }
                    
                    try {
                      // Remove old plan
                      await trainingPlanAPI.removeTrainingPlan(user.id, changingPlanId);
                      
                      // Assign new plan
                      await trainingPlanAPI.assignTrainingPlan(user.id, selectedNewPlanId);
                      
                      alert("Training plan changed successfully!");
                      
                      // Reload training plans
                      const res_training = await trainingPlanAPI.getById(user.id);
                      setUserTraining(res_training.data.data ?? []);
                      
                      // Close modal
                      setIsChangingPlan(false);
                      setChangingPlanId(null);
                      setSelectedNewPlanId(null);
                    } catch (error: any) {
                      console.error("Error changing training plan:", error);
                      alert(error?.response?.data?.message || "Error changing training plan");
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Change Plan
                </Button>
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
