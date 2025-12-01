import { useState, useMemo } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { ArrowLeft, Calendar, Users, BarChart3, Plus, Edit2, Trash2, Dumbbell, AlertCircle } from "lucide-react";
import { AdminTrainingPlan } from "../types/admin-entities";

interface DayExercise {
  dayNumber: number;
  dayName: string;
  exercises: {
    id: number;
    name: string;
    sets: number;
    reps: number;
    challengeId?: number;
    challengeName?: string;
  }[];
}

interface UserFollowing {
  id: number;
  username: string;
  email: string;
  startDate: string;
  completedDays: number;
  totalDays: number;
}

interface TrainingPlanDetailsPageProps {
  plan: AdminTrainingPlan;
  onBack: () => void;
}

const TAB_IDS = ["overview", "exercises", "users"] as const;
type TabId = (typeof TAB_IDS)[number];

// Mock data
const MOCK_DAY_EXERCISES: DayExercise[] = [
  {
    dayNumber: 1,
    dayName: "Monday",
    exercises: [
      { id: 1, name: "Warm-up", sets: 2, reps: 10, challengeName: "General Warm-up" },
      { id: 2, name: "Push-ups", sets: 3, reps: 15, challengeId: 1, challengeName: "30-Day Push-up" },
      { id: 3, name: "Planks", sets: 3, reps: 60, challengeId: 2, challengeName: "Plank Hold" },
    ],
  },
  {
    dayNumber: 2,
    dayName: "Tuesday",
    exercises: [
      { id: 4, name: "Squats", sets: 3, reps: 20 },
      { id: 5, name: "Lunges", sets: 3, reps: 15 },
      { id: 6, name: "Leg Press", sets: 3, reps: 12 },
    ],
  },
  {
    dayNumber: 3,
    dayName: "Wednesday",
    exercises: [
      { id: 7, name: "Rest Day", sets: 1, reps: 0 },
    ],
  },
  {
    dayNumber: 4,
    dayName: "Thursday",
    exercises: [
      { id: 8, name: "Pull-ups", sets: 3, reps: 10 },
      { id: 9, name: "Rows", sets: 3, reps: 12 },
      { id: 10, name: "Lat Pulldowns", sets: 3, reps: 15 },
    ],
  },
  {
    dayNumber: 5,
    dayName: "Friday",
    exercises: [
      { id: 11, name: "Bicep Curls", sets: 3, reps: 12 },
      { id: 12, name: "Tricep Dips", sets: 3, reps: 10 },
      { id: 13, name: "Shoulder Press", sets: 3, reps: 10 },
    ],
  },
  {
    dayNumber: 6,
    dayName: "Saturday",
    exercises: [
      { id: 14, name: "Cardio", sets: 1, reps: 30, challengeName: "10k Steps Daily" },
      { id: 15, name: "Stretching", sets: 2, reps: 15 },
    ],
  },
  {
    dayNumber: 7,
    dayName: "Sunday",
    exercises: [
      { id: 16, name: "Rest Day", sets: 1, reps: 0 },
    ],
  },
];

const MOCK_USERS_FOLLOWING: UserFollowing[] = [
  { id: 101, username: "nguyen.van.a", email: "a@example.com", startDate: "2024-01-01", completedDays: 45, totalDays: 60 },
  { id: 102, username: "tran.thi.b", email: "b@example.com", startDate: "2024-01-05", completedDays: 40, totalDays: 56 },
  { id: 103, username: "pham.van.c", email: "c@example.com", startDate: "2024-01-10", completedDays: 30, totalDays: 51 },
  { id: 104, username: "hoang.thi.d", email: "d@example.com", startDate: "2024-01-15", completedDays: 20, totalDays: 46 },
  { id: 105, username: "vo.van.e", email: "e@example.com", startDate: "2024-01-20", completedDays: 15, totalDays: 41 },
];

export function TrainingPlanDetailsPage({ plan, onBack }: TrainingPlanDetailsPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const stats = useMemo(() => {
    return {
      totalUsers: MOCK_USERS_FOLLOWING.length,
      averageCompletion: Math.round(
        (MOCK_USERS_FOLLOWING.reduce((sum, u) => sum + (u.completedDays / u.totalDays) * 100, 0) /
          Math.max(MOCK_USERS_FOLLOWING.length, 1)) *
          10
      ) / 10,
      totalExercises: MOCK_DAY_EXERCISES.reduce((sum, day) => sum + day.exercises.length, 0),
      weekDays: MOCK_DAY_EXERCISES.filter((d) => d.dayName !== "Wednesday" && d.dayName !== "Sunday").length,
    };
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
          <p className="text-gray-600">Training Plan Details</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Avg Completion</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.averageCompletion}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Total Exercises</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalExercises}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Training Days</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.weekDays}/7</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: "overview" as TabId, label: "Overview", icon: "📋" },
            { id: "exercises" as TabId, label: "Daily Exercises", icon: "💪" },
            { id: "users" as TabId, label: "Users Following", icon: "👥" },
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
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Name</p>
                    <p className="font-semibold text-gray-900 mt-1">{plan.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Details</p>
                    <p className="text-gray-900 mt-1">Comprehensive training program with 7 days of exercises</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Duration</p>
                    <p className="font-semibold text-gray-900 mt-1">4 weeks</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Level</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium mt-1 capitalize">
                      beginner
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Participation</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-600">Users Enrolled</p>
                      <p className="font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }} />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Active participation</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="font-bold text-gray-900">{stats.averageCompletion}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.averageCompletion}%` }} />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Average completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Exercises Tab */}
        {activeTab === "exercises" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Weekly Exercise Schedule</h3>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Add Day
              </Button>
            </div>

            <div className="space-y-4">
              {MOCK_DAY_EXERCISES.map((day) => (
                <div key={day.dayNumber} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Day {day.dayNumber}: {day.dayName}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingDay(editingDay === day.dayNumber ? null : day.dayNumber)}
                        className="p-2 hover:bg-blue-100 rounded text-blue-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {day.exercises.map((exercise) => (
                      <div key={exercise.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{exercise.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {exercise.sets} sets × {exercise.reps} reps
                            </p>
                            {exercise.challengeName && (
                              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <Dumbbell size={12} /> Challenge: {exercise.challengeName}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                              <Edit2 size={14} />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {editingDay === day.dayNumber && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-3">Add New Exercise</p>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Exercise name"
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Sets"
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Reps"
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button className="bg-blue-600">Add Exercise</Button>
                        <Button variant="outline" onClick={() => setEditingDay(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Following Tab */}
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Users Following This Plan ({MOCK_USERS_FOLLOWING.length})</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Started</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Progress</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Completion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {MOCK_USERS_FOLLOWING.map((user) => {
                    const completionPercent = Math.round((user.completedDays / user.totalDays) * 100);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(user.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-gray-900 font-medium">
                            {user.completedDays}/{user.totalDays} days
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${completionPercent}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 min-w-fit">{completionPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
