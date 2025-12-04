export interface ProfileDTO {
  profile: UserProfile;
  stats: UserStats;
  activity: UserActivity;
  achievements: string[];
  goals: UserGoals;
  weeklyStats: WeeklyStats;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  avatar: string;
  joinDate: string;
  currentStreak: number;
}

export interface UserStats {
  aiScore: number;
  challengesCompleted: number;
  totalWorkouts: number;
  currentStreak: number;
}

export interface UserActivity {
  totalCaloriesBurned: number;
  totalMinutes: number;
  favoriteWorkout: string;
}

export interface UserGoals {
  weeklyWorkouts: number;
  dailyCalories: number;
  monthlyDistance: number | null;
}

export interface WeeklyStats {
  workouts: number;
  calories: number;
  minutes: number;
}
