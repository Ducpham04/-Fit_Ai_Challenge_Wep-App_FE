import { useState, useRef, useCallback, useEffect } from 'react';
import { PoseEstimator, PoseResults } from '../utils/poseDetector';
import { SquatCounter } from '../utils/squatCounterLogic';
import { processPoseResults } from '../utils/poseProcessor';

// Types

export type SquatState = 'up' | 'down' | 'no_pose';

export interface SquatMetrics {
  reps: number;
  state: SquatState;
  pace: number; // reps per minute
  elapsed: number; // seconds
  qualityScore: number; // 0-100
  lastRepDuration: number; // ms
  angle: number; // knee angle
}

interface UseSquatCounterReturn {
  metrics: SquatMetrics;
  isModelReady: boolean;
  isProcessing: boolean;
  error: string | null;
  startProcessing: () => void;
  stopProcessing: () => void;
  resetCounter: () => void;
  processFrame: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => Promise<void>;
}

export const useSquatCounter = (): UseSquatCounterReturn => {
  const [metrics, setMetrics] = useState<SquatMetrics>({
    reps: 0,
    state: 'no_pose',
    pace: 0,
    elapsed: 0,
    qualityScore: 0,
    lastRepDuration: 0,
    angle: 0,
  });

  const [isModelReady, setIsModelReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const estimatorRef = useRef<PoseEstimator | null>(null);
  const counterRef = useRef<SquatCounter | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastRepTimeRef = useRef<number | null>(null);
  const repTimesRef = useRef<number[]>([]);

  // Initialize MediaPipe pose estimator
  useEffect(() => {
    const initEstimator = async () => {
      try {
        setError(null);
        const estimator = new PoseEstimator({
          detectionConf: 0.5,
          trackingConf: 0.5,
          modelComplexity: 1
        });
        
        estimatorRef.current = estimator;
        counterRef.current = new SquatCounter();
        
        setIsModelReady(true);
      } catch (err) {
        console.error('Failed to initialize pose estimator:', err);
        setError('Failed to load pose detection model');
        setIsModelReady(false);
      }
    };

    initEstimator();

    return () => {
      if (estimatorRef.current) {
        estimatorRef.current.stop();
      }
    };
  }, []);

  // Handle metrics update from pose processor
  const handleMetricsUpdate = useCallback((data: any) => {
    const now = Date.now();
    
    if (!startTimeRef.current) {
      startTimeRef.current = now;
    }

    const count = data.count || 0;
    const elapsed = data.time || 0;
    const angle = data.metrics?.angle || 0;
    
    // Track rep timing
    if (count > metrics.reps) {
      const repDuration = lastRepTimeRef.current ? now - lastRepTimeRef.current : 0;
      repTimesRef.current.push(repDuration);
      lastRepTimeRef.current = now;
    }

    // Calculate pace (reps per minute)
    const pace = elapsed > 0 ? (count / elapsed) * 60 : 0;

    // Calculate quality score based on consistency and angle
    let qualityScore = 0;
    if (repTimesRef.current.length > 1) {
      const avgDuration = repTimesRef.current.reduce((a, b) => a + b, 0) / repTimesRef.current.length;
      const variance = repTimesRef.current.reduce((sum, t) => sum + Math.pow(t - avgDuration, 2), 0) / repTimesRef.current.length;
      const consistency = Math.max(0, 100 - Math.sqrt(variance) / 10);
      
      // Quality based on angle depth (deeper squat = better, target < 120 degrees)
      const angleQuality = angle > 0 ? Math.min(100, ((150 - angle) / 30) * 100) : 0;
      qualityScore = (consistency * 0.6 + angleQuality * 0.4);
    }

    setMetrics({
      reps: count,
      state: data.stage as SquatState,
      pace: parseFloat(pace.toFixed(1)),
      elapsed: parseFloat(elapsed.toFixed(1)),
      qualityScore: Math.round(qualityScore),
      lastRepDuration: repTimesRef.current[repTimesRef.current.length - 1] || 0,
      angle: angle,
    });
  }, [metrics.reps]);

  // Process a single frame
  const processFrame = useCallback(
    async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      if (!isProcessing || !estimatorRef.current || !counterRef.current) return;

      try {
        // Set up one-time callback for this frame
        estimatorRef.current.onResults((results: PoseResults) => {
          processPoseResults(
            results,
            canvas,
            counterRef.current!,
            handleMetricsUpdate
          );
        });

        // Process the frame
        await estimatorRef.current.process(video);
      } catch (err) {
        console.error('Error processing frame:', err);
        setError('Error processing video frame');
      }
    },
    [isProcessing, handleMetricsUpdate]
  );

  const startProcessing = useCallback(() => {
    console.log('✅ startProcessing called');
    setIsProcessing(true);
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      lastRepTimeRef.current = Date.now();
      console.log('  ✓ Timer refs initialized');
    }
  }, []);

  const stopProcessing = useCallback(() => {
    console.log('⛔ stopProcessing called');
    setIsProcessing(false);
  }, []);

  // Reset counter
  const resetCounter = useCallback(() => {
    console.log('🔄 Resetting squat counter');
    
    if (counterRef.current) {
      counterRef.current.reset();
    }

    startTimeRef.current = null;
    lastRepTimeRef.current = null;
    repTimesRef.current = [];

    setMetrics({
      reps: 0,
      state: 'no_pose',
      pace: 0,
      elapsed: 0,
      qualityScore: 0,
      lastRepDuration: 0,
      angle: 0,
    });
  }, []);

  return {
    metrics,
    isModelReady,
    isProcessing,
    error,
    startProcessing,
    stopProcessing,
    resetCounter,
    processFrame,
  };
};
