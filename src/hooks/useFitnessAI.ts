/**
 * Hook for using Fitness AI Service (Python backend)
 * Provides real-time exercise analysis via WebSocket or frame-by-frame analysis
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ExerciseType,
  ExerciseMetrics,
  analyzeFrame,
  resetCounter,
  checkHealth,
  videoFrameToBase64,
} from '@/api/fitnessAI.api';

export interface UseFitnessAIReturn {
  metrics: ExerciseMetrics | null;
  isProcessing: boolean;
  error: string | null;
  isConnected: boolean;
  analyzeVideoFrame: (video: HTMLVideoElement, exerciseType: ExerciseType) => Promise<void>;
  analyzeImageFile: (file: File, exerciseType: ExerciseType) => Promise<void>;
  reset: (exerciseType?: ExerciseType) => Promise<void>;
  checkServiceHealth: () => Promise<boolean>;
}

export const useFitnessAI = (): UseFitnessAIReturn => {
  const [metrics, setMetrics] = useState<ExerciseMetrics | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check service health on mount
  useEffect(() => {
    checkServiceHealth();
  }, []);

  const checkServiceHealth = useCallback(async (): Promise<boolean> => {
    try {
      await checkHealth();
      setIsConnected(true);
      setError(null);
      return true;
    } catch (err: any) {
      console.error('Fitness AI Service not available:', err);
      setIsConnected(false);
      setError('Fitness AI Service is not available. Please ensure the service is running on port 5001.');
      return false;
    }
  }, []);

  const analyzeVideoFrame = useCallback(
    async (video: HTMLVideoElement, exerciseType: ExerciseType) => {
      if (!video || video.readyState < 2) {
        setError('Video not ready');
        return;
      }

      try {
        setIsProcessing(true);
        setError(null);

        // Convert video frame to base64
        const base64Image = videoFrameToBase64(video);
        
        // Convert base64 to blob
        const response = await fetch(base64Image);
        const blob = await response.blob();
        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });

        // Analyze frame
        const result = await analyzeFrame(exerciseType, file);
        
        if (result.success && result.data) {
          setMetrics(result.data);
        } else {
          setError(result.message || 'Analysis failed');
        }
      } catch (err: any) {
        console.error('Error analyzing frame:', err);
        setError(err.message || 'Failed to analyze frame');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const analyzeImageFile = useCallback(
    async (file: File, exerciseType: ExerciseType) => {
      try {
        setIsProcessing(true);
        setError(null);

        const result = await analyzeFrame(exerciseType, file);
        
        if (result.success && result.data) {
          setMetrics(result.data);
        } else {
          setError(result.message || 'Analysis failed');
        }
      } catch (err: any) {
        console.error('Error analyzing image:', err);
        setError(err.message || 'Failed to analyze image');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const reset = useCallback(async (exerciseType?: ExerciseType) => {
    try {
      await resetCounter(exerciseType);
      setMetrics(null);
      setError(null);
    } catch (err: any) {
      console.error('Error resetting counter:', err);
      setError(err.message || 'Failed to reset counter');
    }
  }, []);

  return {
    metrics,
    isProcessing,
    error,
    isConnected,
    analyzeVideoFrame,
    analyzeImageFile,
    reset,
    checkServiceHealth,
  };
};





