// User Management DTOs
export interface AdminUserDto {
  id: number;
  fullName: string;
  email: string;
  status: UserStatus;
  role: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profileImage?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  status?: UserStatus;
  roleId?: number;
}

export type UserStatus = 'active' | 'inactive' | 'banned';

// Challenge Management DTOs
export interface AdminChallengeDto {
  id: number;
  title: string;
  description: string;
  linkVideos: string;
  status: ChallengeStatus;
  difficult: string;
  videoFile?: File;
  participants: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  linkVideos: string;
  difficult: string;
  videoFile?: File;
}

export interface UpdateChallengeRequest extends Partial<CreateChallengeRequest> {
  status?: ChallengeStatus;
}

export type ChallengeStatus = 'draft' | 'active' | 'inactive' | 'completed';

// Reward Management DTOs
export interface AdminRewardDto {
  id: number;
  name: string;
  description: string;
  points: number;
  claimed: number;
  linkImage: string;
  total: number;
  status: RewardStatus;
  expiresAt: string;
  imageFile?: File;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRewardRequest {
  name: string;
  description: string;
  points: number;
  linkImage: string;
  total: number;
  expiresAt: string;
  imageFile?: File;
}

export interface UpdateRewardRequest extends Partial<CreateRewardRequest> {
  status?: RewardStatus;
}

export type RewardStatus = 'active' | 'inactive';

// Meal and Nutrition DTOs
export interface MealFoodPayload {
  foodId: number;
  quantityG: number;
}

export interface AdminMealDto {
  id?: number;
  name: string;
  description: string;
  mealType: MealType;
  caloriesEstimate: number;
  nutritionPlanId: number;
  foods: MealFoodPayload[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMealRequest {
  name: string;
  description: string;
  mealType: MealType;
  caloriesEstimate: number;
  nutritionPlanId: number;
  foods: MealFoodPayload[];
}

export interface UpdateMealRequest extends Partial<CreateMealRequest> {}

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
  mealType: MealType;
  caloriesEstimate: number;
  nutritionPlanId: number;
  createdAt?: string;
  updatedAt?: string;
  foods: MealFoodResponse[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Food Management DTOs
export interface FoodOption {
  id: number;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export interface AdminFoodDto {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving: number; // grams
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodRequest {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving: number;
}

export interface UpdateFoodRequest extends Partial<CreateFoodRequest> {}

// Training Plan Management DTOs
export interface AdminTrainingPlanDto {
  id: number;
  title: string;
  durationWeeks: string;
  difficultyLevel: TrainingDifficulty;
  subscribers: number;
  price: number;
  status: TrainingPlanStatus;
  goalId: number;
  goalName: string;
  focusArea: string;
  createAt: string;
  updatedAt: string;
}

export interface CreateTrainingPlanRequest {
  title: string;
  durationWeeks: string;
  difficultyLevel: TrainingDifficulty;
  price: number;
  goalId: number;
  focusArea: string;
}

export interface UpdateTrainingPlanRequest extends Partial<CreateTrainingPlanRequest> {
  status?: TrainingPlanStatus;
}

export type TrainingDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type TrainingPlanStatus = 'published' | 'draft' | 'archived';

// Nutrition Plan Management DTOs
export interface AdminNutritionPlanDto {
  id: number;
  name: string;
  description: string;
  target: string;
  dailyCalories: number;
  subscribers: number;
  price: number;
  status: NutritionPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNutritionPlanRequest {
  name: string;
  description: string;
  target: string;
  dailyCalories: number;
  price: number;
}

export interface UpdateNutritionPlanRequest extends Partial<CreateNutritionPlanRequest> {
  status?: NutritionPlanStatus;
}

export type NutritionPlanStatus = 'published' | 'draft' | 'archived';

// Transaction Management DTOs
export interface AdminTransactionDto {
  id: number;
  userId: string;
  userName: string;
  amount: number;
  type: TransactionType;
  date: string;
  status: TransactionStatus;
  note?: string;
}

export interface CreateTransactionRequest {
  userId: string;
  amount: number;
  type: TransactionType;
  note?: string;
}

export interface UpdateTransactionRequest {
  status?: TransactionStatus;
  note?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'reward' | 'purchase';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

// Goal Management DTOs
export interface AdminGoalDto {
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

export interface CreateGoalRequest {
  userId: string;
  type: GoalType;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  status?: GoalStatus;
  currentValue?: number;
}

export type GoalType = 'weight' | 'steps' | 'calories' | 'workout' | 'water' | 'sleep' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'abandoned' | 'paused';
