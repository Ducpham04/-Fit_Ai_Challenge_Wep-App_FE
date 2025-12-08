import { useState, useMemo, useEffect } from "react";
import { SimpleButton as Button } from "@/components/ui/simple-button";
import { ArrowLeft, Calendar, Users, BarChart3, Plus, Edit2, Trash2, Dumbbell, AlertCircle, Loader2, X } from "lucide-react";
import { AdminTrainingPlan } from "../types/admin-entities";
import client from "@/api/client";
import { challengeAPI } from "../api/adminAPI";

interface TrainingPlanDetailDTO {
  tpdId: number;
  trainingPlanId: number;
  trainingPlanTitle: string;
  dayNumber: number;
  challenge: {
    id: number;
    title: string;
    description: string;
    difficult: string;
    linkVideos?: string;
    status: string;
  };
  challengeName: string;
  sets: number;
  reps: number;
}

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

// Day names mapping
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TrainingPlanDetailsPage({ plan, onBack }: TrainingPlanDetailsPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [planDetails, setPlanDetails] = useState<TrainingPlanDetailDTO[]>([]);
  const [usersFollowing, setUsersFollowing] = useState<UserFollowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newDayForm, setNewDayForm] = useState<{
    dayNumber: number;
    challengeId: number;
    sets: number;
    reps: number;
    duration?: number;
  }>({
    dayNumber: 1,
    challengeId: 0,
    sets: 0,
    reps: 0,
    duration: undefined,
  });

  // Load training plan details from API
  useEffect(() => {
    const loadData = async () => {
      // Check if plan.id exists
      const planId = plan?.id;
      if (!planId) {
        setError("Training plan ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load training plan details
        const detailsResponse = await client.get(`/admin/training-plan-details/${planId}`);
        const detailsData = detailsResponse.data?.data || [];
        setPlanDetails(detailsData);

        // Load users following this plan
        try {
          const usersResponse = await client.get(`/admin/training-plans/${planId}/users`);
          const usersData = usersResponse.data?.data || [];
          setUsersFollowing(
            usersData.map((user: any) => ({
              id: user.id,
              username: user.username || `User ${user.id}`,
              email: user.email || "",
              startDate: user.startDate || new Date().toISOString().split("T")[0],
              completedDays: user.completedDays || 0,
              totalDays: user.totalDays || 0,
            }))
          );
        } catch (err) {
          console.warn("Could not load users following plan:", err);
          setUsersFollowing([]);
        }
      } catch (err: any) {
        console.error("Error loading training plan details:", err);
        setError(err?.response?.data?.message || err?.message || "Failed to load training plan details");
        setPlanDetails([]);
        setUsersFollowing([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [plan?.id]);

  // Load challenges when opening add day modal
  useEffect(() => {
    if (showAddDayModal) {
      const loadChallenges = async () => {
        try {
          const response = await challengeAPI.getAll();
          const challengesData = response.data?.data || response.data || [];
          setChallenges(Array.isArray(challengesData) ? challengesData : []);
        } catch (err) {
          console.error("Error loading challenges:", err);
          setChallenges([]);
        }
      };
      loadChallenges();
    }
  }, [showAddDayModal]);

  // Convert API data to DayExercise format
  const dayExercises = useMemo(() => {
    if (planDetails.length === 0) return [];

    // Group by day number
    const groupedByDay = planDetails.reduce((acc, detail) => {
      const dayNumber = detail.dayNumber;
      if (!acc[dayNumber]) {
        acc[dayNumber] = [];
      }
      acc[dayNumber].push(detail);
      return acc;
    }, {} as { [key: number]: TrainingPlanDetailDTO[] });

    // Convert to DayExercise format
    return Object.entries(groupedByDay)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([dayNumStr, details]) => {
        const dayNumber = parseInt(dayNumStr);
        const dayName = DAY_NAMES[(dayNumber - 1) % 7] || `Day ${dayNumber}`;
        
        return {
          dayNumber,
          dayName,
          exercises: details.map((detail) => ({
            id: detail.tpdId,
            name: detail.challengeName || detail.challenge?.title || "Exercise",
            sets: detail.sets,
            reps: detail.reps,
            challengeId: detail.challenge?.id,
            challengeName: detail.challengeName || detail.challenge?.title,
          })),
        };
      });
  }, [planDetails]);

  const stats = useMemo(() => {
    return {
      totalUsers: usersFollowing.length,
      averageCompletion: usersFollowing.length > 0
        ? Math.round(
            (usersFollowing.reduce((sum, u) => sum + (u.completedDays / u.totalDays) * 100, 0) /
              usersFollowing.length) *
              10
          ) / 10
        : 0,
      totalExercises: dayExercises.reduce((sum, day) => sum + day.exercises.length, 0),
      weekDays: dayExercises.length,
    };
  }, [dayExercises, usersFollowing]);

  // Early return if plan is not available
  if (!plan || !plan.id) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Plan Details</h1>
            <p className="text-gray-600">Invalid training plan</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">Training plan ID is missing. Please go back and select a valid plan.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{plan.title || "Training Plan"}</h1>
            <p className="text-gray-600">Training Plan Details</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading training plan details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
            <p className="text-gray-600">Training Plan Details</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <p className="text-sm text-gray-600 uppercase">Description</p>
                    <p className="text-gray-900 mt-1">{plan.description || "No description available"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Duration</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {plan.durationWeeks ? `${plan.durationWeeks} weeks` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 uppercase">Level</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium mt-1 capitalize">
                      {plan.difficultyLevel?.toLowerCase() || "N/A"}
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
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  // Calculate next day number
                  const maxDay = dayExercises.length > 0
                    ? Math.max(...dayExercises.map(d => d.dayNumber))
                    : 0;
                  setNewDayForm({
                    dayNumber: maxDay + 1,
                    challengeId: 0,
                    sets: 0,
                    reps: 0,
                    duration: undefined,
                  });
                  setShowAddDayModal(true);
                }}
              >
                <Plus size={16} /> Add Day
              </Button>
            </div>

            <div className="space-y-4">
              {dayExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No exercises found for this training plan.</p>
                  <p className="text-sm mt-2">Add exercises using the "Add Day" button above.</p>
                </div>
              ) : (
                dayExercises.map((day) => (
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
                            <button 
                              onClick={() => {
                                // TODO: Implement edit functionality
                                alert("Edit functionality coming soon");
                              }}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600 transition"
                              title="Edit exercise"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                setDeleteConfirm({
                                  id: exercise.id,
                                  name: exercise.name
                                });
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-600 transition"
                              title="Delete exercise"
                            >
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
                ))
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Exercise</h3>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.name}"</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!deleteConfirm) return;
                      
                      try {
                        setIsDeleting(true);
                        const response = await client.delete(
                          `/admin/training-plan-details/${deleteConfirm.id}`
                        );

                        if (response.data?.success) {
                          // Reload plan details
                          const detailsResponse = await client.get(
                            `/admin/training-plan-details/${plan.id}`
                          );
                          const updatedDetails = detailsResponse.data?.data || [];
                          setPlanDetails(updatedDetails);
                          
                          setDeleteConfirm(null);
                          // Show success message
                          alert("Exercise deleted successfully!");
                        } else {
                          alert(response.data?.message || "Error deleting exercise");
                        }
                      } catch (error: any) {
                        console.error("Error deleting exercise:", error);
                        alert(error?.response?.data?.message || "Error deleting exercise");
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Day Modal */}
        {showAddDayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Day</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Training Plan: {plan.title} | Day {newDayForm.dayNumber}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddDayModal(false);
                    setNewDayForm({
                      dayNumber: 1,
                      challengeId: 0,
                      sets: 0,
                      reps: 0,
                      duration: undefined,
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Day Number *
                    </label>
                    <input
                      type="number"
                      value={newDayForm.dayNumber}
                      onChange={(e) => {
                        setNewDayForm({
                          ...newDayForm,
                          dayNumber: parseInt(e.target.value) || 1,
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Challenge *
                    </label>
                    <select
                      value={newDayForm.challengeId}
                      onChange={(e) => {
                        setNewDayForm({
                          ...newDayForm,
                          challengeId: parseInt(e.target.value) || 0,
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Sets *
                      </label>
                      <input
                        type="number"
                        value={newDayForm.sets || ""}
                        onChange={(e) => {
                          setNewDayForm({
                            ...newDayForm,
                            sets: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Reps *
                      </label>
                      <input
                        type="number"
                        value={newDayForm.reps || ""}
                        onChange={(e) => {
                          setNewDayForm({
                            ...newDayForm,
                            reps: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Duration (seconds) <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      value={newDayForm.duration || ""}
                      onChange={(e) => {
                        setNewDayForm({
                          ...newDayForm,
                          duration: parseInt(e.target.value) || undefined,
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDayModal(false);
                    setNewDayForm({
                      dayNumber: 1,
                      challengeId: 0,
                      sets: 0,
                      reps: 0,
                      duration: undefined,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!newDayForm.challengeId || !newDayForm.sets || !newDayForm.reps) {
                      alert("Please fill in all required fields (Challenge, Sets, Reps)");
                      return;
                    }

                    try {
                      const response = await client.post(
                        `/admin/training-plan-details`,
                        {
                          trainingPlanId: plan.id,
                          dayNumber: newDayForm.dayNumber,
                          challengeId: newDayForm.challengeId,
                          sets: newDayForm.sets,
                          reps: newDayForm.reps,
                          duration: newDayForm.duration,
                        }
                      );

                      if (response.data?.success) {
                        // Reload plan details
                        const detailsResponse = await client.get(
                          `/admin/training-plan-details/${plan.id}`
                        );
                        const updatedDetails = detailsResponse.data?.data || [];
                        setPlanDetails(updatedDetails);

                        // Close modal and reset form
                        setShowAddDayModal(false);
                        setNewDayForm({
                          dayNumber: 1,
                          challengeId: 0,
                          sets: 0,
                          reps: 0,
                          duration: undefined,
                        });

                        alert("Day added successfully!");
                      } else {
                        alert(response.data?.message || "Error adding day");
                      }
                    } catch (error: any) {
                      console.error("Error adding day:", error);
                      alert(error?.response?.data?.message || "Error adding training plan detail");
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={14} className="mr-1" />
                  Add Day
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Following Tab */}
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <h3 className="text-lg font-bold text-gray-900">
              Users Following This Plan ({usersFollowing.length})
            </h3>

            {usersFollowing.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No users are currently following this training plan.</p>
                <p className="text-sm mt-2">Users will appear here once they start this plan.</p>
              </div>
            ) : (
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
                    {usersFollowing.map((user) => {
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
