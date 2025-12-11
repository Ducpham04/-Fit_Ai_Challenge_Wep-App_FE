/**
 * Training Plan DTOs matching backend TrainingPlanResponseDTO structure
 */

export interface TrainingPlanDto {
  id: number;
  title: string;
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  duration: number; // in weeks
  exercises: Exercise[];
  status?: 'Active' | 'Completed' | 'Paused' | string;
  progress?: number; // Percentage 0-100
  startDate?: string;
  endDate?: string;
  
  // Additional fields for admin
  goalId?: number;
  goalName?: string;
  subscribers?: number;
  price?: number;
  focusArea?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  duration?: number; // in seconds
  restTime: number; // in seconds
  instructions: string;
  videoUrl?: string;
}

export interface DayPlan {
  day: number;
  exercises: Exercise[];
  completed?: boolean;
}



