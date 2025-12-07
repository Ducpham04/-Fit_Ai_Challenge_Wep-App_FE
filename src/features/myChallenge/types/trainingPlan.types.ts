export interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in weeks
  exercises: Exercise[];
  status: 'Active' | 'Completed' | 'Paused';
  progress: number; // percentage
  startDate: string;
  endDate: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number; // in minutes
  restTime: number; // in seconds
  instructions: string;
  videoUrl?: string;
}

export interface DayPlan {
  day: number;
  exercises: Exercise[];
  completed: boolean;
}

export type TrainingPlanStatus = 'Active' | 'Completed' | 'Paused';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
