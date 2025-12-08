import client from "../../../api/client";
import { getExercises } from "../../../api/fitnessAI.api";
import {
  AdminUser,
  UserPayload,
  AdminChallenge,
  ChallengePayload,
  AdminReward,
  RewardPayload,
  AdminMeal,
  MealPayload,
  AdminFood,
  FoodPayload,
  AdminTrainingPlan,
  TrainingPlanPayload,
  AdminNutritionPlan,
  NutritionPlanPayload,
  AdminTransaction,
  AdminGoal,
  GoalPayload,
  MealFoodPayload,
  MealResponse,
  FoodOption
} from "../types/admin-entities";

export const AdminAPI = {
  // User Management
  getUsers: (params?: {
    status?: "active" | "inactive" | "banned";
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => client.get("/admin/users", { params }),

  getUserById: (id: number) => client.get(`/admin/users/${id}`),

  createUser: (data: UserPayload) => client.post("/admin/users", data),

  updateUser: (id: number, data: Partial<UserPayload>) => client.put(`/admin/users/${id}`, data),

  deleteUser: (id: number) => client.delete(`/admin/users/${id}`),

  // Challenge Management
  getChallenges: (params?: {
    status?: "draft" | "active" | "inactive" | "completed";
    page?: number;
    limit?: number;
  }) => client.get("/admin/challenges", { params }),

  getChallengeById: (id: number) => client.get(`/admin/challenges/${id}`),

  createChallenge: (data: FormData) => client.post("/admin/challenges", data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),

  updateChallenge: (id: number, data: FormData) => client.put(`/admin/challenges/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),

  deleteChallenge: (id: number) => client.delete(`/admin/challenges/${id}`),

  // Reward Management
  getRewards: (params?: {
    status?: "active" | "inactive";
    page?: number;
    limit?: number;
  }) => client.get("/admin/rewards", { params }),

  getRewardById: (id: number) => client.get(`/admin/rewards/${id}`),

  createReward: (data: FormData) => client.post("/admin/rewards", data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),

  updateReward: (id: number, data: FormData) => client.put(`/admin/rewards/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),

  deleteReward: (id: number) => client.delete(`/admin/rewards/${id}`),

  // Meal Management
  getMeals: (params?: {
    nutritionPlanId?: number;
    page?: number;
    limit?: number;
  }) => client.get("/admin/meals", { params }),

  getMealById: (id: number) => client.get(`/admin/meals/${id}`),

  createMeal: (data: MealPayload) => client.post("/admin/meals", data),

  updateMeal: (id: number, data: Partial<MealPayload>) => client.put(`/admin/meals/${id}`, data),

  deleteMeal: (id: number) => client.delete(`/admin/meals/${id}`),

  // Food Management
  getFoods: (params?: {
    page?: number;
    limit?: number;
  }) => client.get("/admin/foods", { params }),

  getFoodById: (id: number) => client.get(`/admin/foods/${id}`),

  createFood: (data: FoodPayload) => client.post("/admin/foods", data),

  updateFood: (id: number, data: Partial<FoodPayload>) => client.put(`/admin/foods/${id}`, data),

  deleteFood: (id: number) => client.delete(`/admin/foods/${id}`),

  // Training Plan Management
  getTrainingPlans: (params?: {
    status?: "published" | "draft" | "archived";
    page?: number;
    limit?: number;
  }) => client.get("/admin/training-plans", { params }),

  getTrainingPlanById: (id: number) => client.get(`/admin/training-plans/${id}`),

  createTrainingPlan: (data: TrainingPlanPayload) => client.post("/admin/training-plans", data),

  updateTrainingPlan: (id: number, data: Partial<TrainingPlanPayload>) => client.put(`/admin/training-plans/${id}`, data),

  deleteTrainingPlan: (id: number) => client.delete(`/admin/training-plans/${id}`),

  // Nutrition Plan Management (Note: BE uses /api/nutrition-plans, not /admin/nutrition-plans)
  getNutritionPlans: (params?: {
    status?: "published" | "draft" | "archived";
    page?: number;
    limit?: number;
  }) => client.get("/nutrition-plans", { params }),

  getNutritionPlanById: (id: number) => client.get(`/nutrition-plans/${id}`),

  createNutritionPlan: (data: NutritionPlanPayload) => client.post("/nutrition-plans", data),

  updateNutritionPlan: (id: number, data: Partial<NutritionPlanPayload>) => client.put(`/nutrition-plans/${id}`, data),

  deleteNutritionPlan: (id: number) => client.delete(`/nutrition-plans/${id}`),

  // Transaction Management
  getTransactions: (params?: {
    userId?: string;
    type?: "deposit" | "withdrawal" | "reward" | "purchase";
    status?: "completed" | "pending" | "failed";
    page?: number;
    limit?: number;
  }) => client.get("/transactions", { params }), // Backend uses /api/transactions, not /admin/transactions

  getTransactionById: (id: number) => client.get(`/transactions/${id}`),

  createTransaction: (data: any) => client.post("/admin/transactions", data),

  updateTransaction: (id: number, data: any) => client.put(`/admin/transactions/${id}`, data),

  // Goal Management
  getGoals: (params?: {
    userId?: string;
    type?: "weight" | "steps" | "calories" | "workout" | "water" | "sleep" | "custom";
    status?: "active" | "completed" | "abandoned" | "paused";
    page?: number;
    limit?: number;
  }) => client.get("/admin/goals", { params }),

  getGoalById: (id: number) => client.get(`/admin/goals/${id}`),

  createGoal: (data: FormData) => client.post("/admin/goals", data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),

  updateGoal: (id: number, data: FormData) => client.put(`/admin/goals/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),

  deleteGoal: (id: number) => client.delete(`/admin/goals/${id}`),

  // Dashboard Statistics
  getDashboardOverview: () => client.get("/admin/dashboard/overview"),
  
  getUserStats: (period?: "day" | "week" | "month" | "year" | "all") =>
    client.get(`/admin/dashboard/user-stats`, { params: { period: period || "all" } }),

  getChallengeStats: (period?: "day" | "week" | "month" | "year" | "all") =>
    client.get(`/admin/dashboard/challenge-stats`, { params: { period: period || "all" } }),

  getTrainingStats: (period?: "day" | "week" | "month" | "year" | "all") =>
    client.get(`/admin/dashboard/training-stats`, { params: { period: period || "all" } }),

  getNutritionStats: (period?: "day" | "week" | "month" | "year" | "all") =>
    client.get(`/admin/dashboard/nutrition-stats`, { params: { period: period || "all" } }),

  getRewardStats: (period?: "day" | "week" | "month" | "year" | "all") =>
    client.get(`/admin/dashboard/reward-stats`, { params: { period: period || "all" } }),

  // System Settings
  getSystemSettings: () => client.get("/admin/system/settings"),

  updateSystemSettings: (data: any) => client.put("/admin/system/settings", data),

  // Notifications
  getNotifications: (params?: {
    type?: string;
    status?: "sent" | "pending" | "failed";
    page?: number;
    limit?: number;
  }) => client.get("/admin/notifications", { params }),

  createNotification: (data: any) => client.post("/admin/notifications", data),

  sendNotification: (id: number) => client.post(`/admin/notifications/${id}/send`),

  // AI Logs
  getAILogs: (params?: {
    type?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) => client.get("/admin/ai-logs", { params }),

  getAILogById: (id: number) => client.get(`/admin/ai-logs/${id}`),

  // Roles Management
  getRoles: () => client.get("/admin/roles"),

  createRole: (data: any) => client.post("/admin/roles", data),

  updateRole: (id: number, data: any) => client.put(`/admin/roles/${id}`, data),

  deleteRole: (id: number) => client.delete(`/admin/roles/${id}`),

  // Bulk Operations
  bulkUpdateUsers: (data: { userIds: number[]; updates: Partial<UserPayload> }) =>
    client.put("/admin/users/bulk", data),

  bulkDeleteUsers: (userIds: number[]) =>
    client.delete("/admin/users/bulk", { data: { userIds } }),

  bulkUpdateChallenges: (data: { challengeIds: number[]; updates: Partial<ChallengePayload> }) =>
    client.put("/admin/challenges/bulk", data),

  // Export Data
  exportUsers: (params?: any) => client.get("/admin/export/users", {
    params,
    responseType: "blob"
  }),

  exportTransactions: (params?: any) => client.get("/admin/export/transactions", {
    params,
    responseType: "blob"
  }),

  // Analytics
  getAnalytics: (type: string, params?: any) =>
    client.get(`/admin/analytics/${type}`, { params }),

  getReports: (type: string, params?: any) =>
    client.get(`/admin/reports/${type}`, { params })
};

// Body Information API
export const infBodyAPI = {
  getBodyData: (userId: number) => client.get(`/admin/users/${userId}/body-data`),
  createBodyData: (userId: number, data: any) => client.post(`/admin/users/${userId}/body-data`, data),
  updateBodyData: (userId: number, bodyDataId: number, data: any) => client.put(`/admin/users/${userId}/body-data/${bodyDataId}`, data),
  deleteBodyData: (userId: number, bodyDataId: number) => client.delete(`/admin/users/${userId}/body-data/${bodyDataId}`)
};

// User API for User Management
export const userAPI = {
  getAll: AdminAPI.getUsers,
  getUsers: AdminAPI.getUsers,
  getUserById: AdminAPI.getUserById,
  create: AdminAPI.createUser,
  update: AdminAPI.updateUser,
  deleteUser: AdminAPI.deleteUser,
  bulkUpdateUsers: AdminAPI.bulkUpdateUsers,
  bulkDeleteUsers: AdminAPI.bulkDeleteUsers
};

// Challenge API for Challenge Management
export const challengeAPI = {
  getAll: AdminAPI.getChallenges,
  getChallenges: AdminAPI.getChallenges,
  getChallengeById: AdminAPI.getChallengeById,
  create: AdminAPI.createChallenge,
  update: AdminAPI.updateChallenge,
  delete: AdminAPI.deleteChallenge,
  bulkUpdate: AdminAPI.bulkUpdateChallenges,
  // Get available AI models/exercises from Fitness AI Service
  getAvailableExercises: async (): Promise<string[]> => {
    try {
      return await getExercises();
    } catch (error) {
      console.error("Error fetching exercises from AI service:", error);
      // Return default list if service is unavailable
      return ["push-up", "squat", "pull-up", "sit-up", "plank"];
    }
  }
};

// Reward API for Reward Management
export const rewardAPI = {
  getAll: AdminAPI.getRewards,
  getRewards: AdminAPI.getRewards,
  getRewardById: AdminAPI.getRewardById,
  create: AdminAPI.createReward,
  update: AdminAPI.updateReward,
  delete: AdminAPI.deleteReward
};

// Transaction API for Transaction Management
export const transactionAPI = {
  getAll: AdminAPI.getTransactions,
  getTransactions: AdminAPI.getTransactions,
  getTransactionById: AdminAPI.getTransactionById,
  create: AdminAPI.createTransaction,
  update: AdminAPI.updateTransaction
};

// Training Plan API for Training Plan Management
export const trainingPlanAPI = {
  getAll: AdminAPI.getTrainingPlans,
  getTrainingPlans: AdminAPI.getTrainingPlans,
  getTrainingPlanById: AdminAPI.getTrainingPlanById,
  create: AdminAPI.createTrainingPlan,
  update: AdminAPI.updateTrainingPlan,
  delete: AdminAPI.deleteTrainingPlan,
  getById: (userId: number) => client.get(`/admin/users/${userId}/training-plans`),
  assignTrainingPlan: (userId: number, trainingPlanId: number) => client.post(`/admin/users/${userId}/training-plans/${trainingPlanId}`),
  removeTrainingPlan: (userId: number, trainingPlanId: number) => client.delete(`/admin/users/${userId}/training-plans/${trainingPlanId}`),
  // Personalized Plan Details (for admin to view/edit user's customized plan)
  getPersonalizedDetails: (userId: number, utId: number) => 
    client.get(`/admin/users/${userId}/training-plans/${utId}/personalized-details`),
  updatePersonalizedDetail: (userId: number, utId: number, ppdId: number, data: any) =>
    client.put(`/admin/users/${userId}/training-plans/${utId}/personalized-details/${ppdId}`, data)
};

// Goal API for Goal Management
export const goalAPI = {
  getAll: AdminAPI.getGoals,
  getGoals: AdminAPI.getGoals,
  getGoalById: AdminAPI.getGoalById,
  create: AdminAPI.createGoal,
  update: AdminAPI.updateGoal,
  delete: AdminAPI.deleteGoal
};

// Meal API for Meal Management
export const mealAPI = {
  getAll: AdminAPI.getMeals,
  getMeals: AdminAPI.getMeals,
  getMealById: AdminAPI.getMealById,
  create: AdminAPI.createMeal,
  update: AdminAPI.updateMeal,
  delete: AdminAPI.deleteMeal
};

// Food API for Food Management
export const foodAPI = {
  getAll: AdminAPI.getFoods,
  getFoods: AdminAPI.getFoods,
  getFoodById: AdminAPI.getFoodById,
  create: AdminAPI.createFood,
  update: AdminAPI.updateFood,
  delete: AdminAPI.deleteFood
};

// Nutrition Plan API for Nutrition Plan Management
export const nutritionPlanAPI = {
  getAll: AdminAPI.getNutritionPlans,
  getNutritionPlans: AdminAPI.getNutritionPlans,
  getNutritionPlanById: AdminAPI.getNutritionPlanById,
  create: AdminAPI.createNutritionPlan,
  update: AdminAPI.updateNutritionPlan,
  delete: AdminAPI.deleteNutritionPlan
};
