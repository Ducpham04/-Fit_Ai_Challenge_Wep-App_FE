export type ChallengeStatus = "draft" | "active" | "inactive" | "completed";

export interface AdminChallenge {
  id: number;
  title: string;
  description: string;
  linkVideos: string;
  status: string;
  difficult: string;
  videoFile: File | null;
}

export type ChallengePayload = Omit<AdminChallenge, "id">;

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  status: "active" | "inactive" | "banned";
  role: string;
  roleId: number ;
  createdAt: string;
  updatedAt: string;
}

export type UserPayload = Omit<AdminUser, "id" | "createdAt" | "updatedAt">;

export type RewardStatus = "active" | "inactive";

export interface AdminReward {
  id: number;
  name: string;
  description: string;
  points: number;
  claimed: number;
  linkImage: string ;
  total: number;
  status: RewardStatus;
  expiresAt: string;
  imageFile: File | null ;
}

export type RewardPayload = Omit<AdminReward, "id">;
// src/types/admin-entities.ts
export interface MealFoodPayload {
  foodId: number;
  quantityG: number;
}

export interface AdminMeal {
  id?: number; // optional when creating new (BE returns id)
  name: string;
  description: string;
  mealType: string; // breakfast|lunch|dinner|snack
  caloriesEstimate: number;
  nutritionPlanId: number;
  foods: MealFoodPayload[];
}

export type MealPayload = Omit<AdminMeal, "id">;

export interface MealFoodResponse {
  mfId: number;
  foodId: number;
  foodName: string;
  quantityG: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealResponse {
  mealId: number;
  name: string;
  description: string;
  mealType: string;
  caloriesEstimate: number;
  nutritionPlanId: number;
  createdAt?: string;
  updatedAt?: string;
  foods: MealFoodResponse[];
}

export interface FoodOption {
  id: number;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}



export interface AdminFood {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving: 100;
}

export type FoodPayload = Omit<AdminFood, "id">;

export type TrainingDifficulty = "beginner" | "intermediate" | "advanced";
export type TrainingPlanStatus = "published" | "draft" | "archived";

export interface AdminTrainingPlan {
  id: number;
  title: string;
  durationWeeks: string;
  difficultyLevel: TrainingDifficulty;
  subscribers: number;
  price: number;
  status: TrainingPlanStatus;
  goalId : number ;
  goalName : string ;
  focusArea: string;
  createAt: string;
}

export type TrainingPlanPayload = Omit<AdminTrainingPlan, "id">;

export interface AdminNutritionPlan {
  id: number;
  name: string;
  description: string;
  target: string;
  dailyCalories: number;
  subscribers: number;
  price: number;
  status: "published" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type NutritionPlanPayload = Omit<AdminNutritionPlan, "id" | "createdAt" | "updatedAt">;

export type TransactionType = "deposit" | "withdrawal" | "reward" | "purchase";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface AdminTransaction {
  id: number;
  userId: string;
  userName: string;
  amount: number;
  type: TransactionType;
  date: string;
  status: TransactionStatus;
  note?: string;
}

export type TransactionPayload = Omit<AdminTransaction, "id">;

export type GoalType = "weight" | "steps" | "calories" | "workout" | "water" | "sleep" | "custom";
export type GoalStatus = "active" | "completed" | "abandoned" | "paused";

export interface AdminGoal {
  id: number;
  userId: string;
  userName: string;
  type: GoalType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: GoalStatus;
  startDate: string;
  endDate: string;
  progress: number;
  createdAt: string;
}

export type GoalPayload = Omit<AdminGoal, "id" | "createdAt" | "progress">;





