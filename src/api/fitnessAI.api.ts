/**
 * Fitness AI Service API Client
 * Connects to Python AI Service for exercise analysis
 */
import axios from 'axios';

const FITNESS_AI_BASE_URL = import.meta.env.VITE_FITNESS_AI_URL || 'http://localhost:8000';

const fitnessAIClient = axios.create({
  baseURL: FITNESS_AI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Response interceptors
fitnessAIClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Fitness AI Service Error:', error);
    return Promise.reject(error);
  }
);

export type ExerciseType = 'push-up' | 'squat' | 'pull-up' | 'sit-up' | 'plank';

export interface ExerciseMetrics {
  reps: number;
  state: 'up' | 'down' | 'holding' | 'rest' | 'unknown';
  quality_score: number;
  form_errors: Array<{
    type: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  angles: Record<string, number>;
  is_valid_form: boolean;
  timestamp?: number;
}

export interface AnalyzeFrameResponse {
  success: boolean;
  message: string;
  data: ExerciseMetrics | null;
  timestamp?: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

/**
 * Check if Fitness AI service is healthy
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await fitnessAIClient.get<HealthResponse>('/health');
  return response.data;
};

/**
 * Get list of available exercises
 */
export const getExercises = async (): Promise<string[]> => {
  const response = await fitnessAIClient.get<{ success: boolean; data: { exercises: string[] } }>('/exercises');
  return response.data.data.exercises;
};

/**
 * Analyze a single frame/image
 * @param exerciseType Type of exercise
 * @param imageFile Image file to analyze
 */
export const analyzeFrame = async (
  exerciseType: ExerciseType,
  imageFile: File
): Promise<AnalyzeFrameResponse> => {
  const formData = new FormData();
  formData.append('exercise_type', exerciseType);
  formData.append('frame', imageFile);

  const response = await fitnessAIClient.post<AnalyzeFrameResponse>(
    '/api/analyze-frame',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Reset exercise counter
 * @param exerciseType Optional exercise type, resets all if not provided
 */
export const resetCounter = async (exerciseType?: ExerciseType): Promise<{ success: boolean; message: string }> => {
  const params = exerciseType ? { exercise_type: exerciseType } : {};
  const response = await fitnessAIClient.post<{ success: boolean; message: string }>(
    '/api/reset-counter',
    null,
    { params }
  );
  return response.data;
};

/**
 * Convert video frame to base64
 */
export const videoFrameToBase64 = (video: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
};

/**
 * Extract frame from video file as base64
 */
export const extractFrameFromVideo = async (videoFile: File, timeInSeconds: number = 0): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.currentTime = timeInSeconds;
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
};

export default fitnessAIClient;


