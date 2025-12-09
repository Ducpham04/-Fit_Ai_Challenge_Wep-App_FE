/**
 * My Challenge Types - Aligned with Backend API
 */

// Backend Response Types
export interface TrainingPlanDetailDTO {
  tpdId: number;
  trainingPlanId: number;
  trainingPlanTitle: string;
  dayNumber: number;
  challenge: {
    goalId: number;
    title: string;
    description: string;
    difficult: 'EASY' | 'MEDIUM' | 'HARD';
    linkVideos: string;
    status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
    exerciseType?: string; // AI model/exercise type: push-up, squat, pull-up, sit-up, plank
  };
  challengeName: string;
  sets: number;
  reps: number;
}

// DailyTrainingLog Response from Backend
export interface DailyTrainingLogDTO {
  dtlId: number | null;
  userId: number;
  trainingPlanId: number;
  trainingPlanTitle: string;
  trainingDate: string;
  dayNumber: number;
  challengeId: number;
  challengeName: string;
  challengeTitle: string;
  challengeDescription: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | string;
  videoUrl: string;
  exerciseType?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  actualDurationMinutes?: number;
  caloriesBurned?: number;
  setsCompleted?: number;
  repsCompleted?: number;
  targetSets: number;
  targetReps: number;
  score?: number;
  confidence?: number;
  notes?: string;
  perceivedDifficulty?: number;
  effortLevel?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Frontend Internal Types
export interface DayChallenges {
  dayNumber: number;
  dayName: string;
  challenges: Challenge[];
}

export interface Challenge {
  id: number; // dtlId from DailyTrainingLog or tpdId from template
  challengeId: number; // goalId from backend
  challengeName: string;
  title: string;
  sets: number; // targetSets from DailyTrainingLog
  reps: number; // targetReps from DailyTrainingLog
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'in_progress' | 'not_started' | 'skipped';
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  videoUrl: string; // linkVideos from backend
  exerciseType?: string; // AI model/exercise type from backend
  // Progress tracking from DailyTrainingLog
  setsCompleted?: number;
  repsCompleted?: number;
  actualDurationMinutes?: number;
  caloriesBurned?: number;
  score?: number;
  confidence?: number;
  // Personalized fields
  defaultReps?: number; // Default reps from template
  customReps?: number; // Personalized reps
  defaultDuration?: number; // Default duration from template
  customTime?: number; // Personalized time
  exerciseVariant?: string; // Modified exercise for injuries
  intensityLevel?: number; // 1-10
  aiAnalysis?: {
    correctReps: number;
    totalReps: number;
    accuracy: number;
    feedback: string;
    posture: string;
  };
}

export interface TrainingPlanDetail {
  id: number;
  planName: string;
  description: string;
  duration: string;
  startDate: string;
  endDate: string;
  difficulty: string;
  totalDays: number;
  progressPercentage: number;
  dayChallenges: DayChallenges[];
  userId: number;
  status: 'active' | 'completed' | 'paused';
}

export interface UserCurrentTrainingPlan {
  id: number; // utId (UserTraining ID)
  trainingPlanId: number;
  name?: string;
  planName: string;
  description: string;
  difficulty: string;
  duration: string;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  completionPercentage?: number;
  daysCompleted: number;
  totalDays: number;
  lastActivityDate: string;
  status?: 'active' | 'completed' | 'pending';
}


export interface ChallengeSubmission {
  challengeId: string;
  videoUrl: string;
  timestamp: string;
  aiAnalysisResult: {
    correctReps: number;
    totalReps: number;
    accuracy: number;
    feedback: string;
  };
  status: 'completed' | 'incomplete' | 'incorrect_form';
}

export interface AIAnalysisResult {
  correctReps: number;
  totalReps: number;
  accuracy: number;
  posture: string;
  feedback: string;
  suggestions: string[];
}
