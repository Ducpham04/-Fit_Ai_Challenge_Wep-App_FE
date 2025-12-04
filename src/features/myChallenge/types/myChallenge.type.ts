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
  };
  challengeName: string;
  sets: number;
  reps: number;
}

// Frontend Internal Types
export interface DayChallenges {
  dayNumber: number;
  dayName: string;
  challenges: Challenge[];
}

export interface Challenge {
  id: number; // tpdId from backend
  challengeId: number; // goalId from backend
  challengeName: string;
  title: string;
  sets: number;
  reps: number;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'in_progress' | 'not_started';
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  videoUrl: string; // linkVideos from backend
  aiAnalysis?: {
    correctReps: number;
    totalReps: number;
    accuracy: number;
    feedback: string;
    posture: string;
  };
}

export interface TrainingPlanDetail {
  id: string;
  planName: string;
  description: string;
  duration: string;
  startDate: string;
  endDate: string;
  difficulty: string;
  totalDays: number;
  progressPercentage: number;
  dayChallenges: DayChallenges[];
  userId: string;
  status: 'active' | 'completed' | 'paused';
}

export interface UserCurrentTrainingPlan {
  id: number;
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
