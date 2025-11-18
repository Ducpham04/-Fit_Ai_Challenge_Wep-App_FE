import { useState, useRef, useCallback, useEffect } from 'react';
import { PoseEstimator, PoseResults } from '../utils/poseDetector';
import { PushUpCounter } from '../utils/pushUpCounterLogic';
import { processPoseResults } from '../utils/poseProcessor';

// Types

export type PushUpState = 'up' | 'down' | 'no_pose';

export interface PushUpMetrics {
  reps: number;
  state: PushUpState;
  pace: number; // reps per minute
  elapsed: number; // seconds
  qualityScore: number; // 0-100
  lastRepDuration: number; // ms
}

interface UsePushUpCounterReturn {
  metrics: PushUpMetrics;
  isModelReady: boolean;
  isProcessing: boolean;
  error: string | null;
  startProcessing: () => void;
  stopProcessing: () => void;
  resetCounter: () => void;
  processFrame: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => Promise<void>;
}

export const usePushUpCounter = (): UsePushUpCounterReturn => {
  const [metrics, setMetrics] = useState<PushUpMetrics>({
    reps: 0,
    state: 'no_pose',
    pace: 0,
    elapsed: 0,
    qualityScore: 0,
    lastRepDuration: 0,
  });

  const [isModelReady, setIsModelReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const estimatorRef = useRef<PoseEstimator | null>(null);
  const counterRef = useRef<PushUpCounter | null>(null);
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
        counterRef.current = new PushUpCounter();
        
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
    
    // Track rep timing
    if (count > metrics.reps) {
      const repDuration = lastRepTimeRef.current ? now - lastRepTimeRef.current : 0;
      repTimesRef.current.push(repDuration);
      lastRepTimeRef.current = now;
    }

    // Calculate pace
    const pace = elapsed > 0 ? (count / elapsed) * 60 : 0;
    
    // Calculate quality score based on form (simplified for now)
    const qualityScore = data.metrics?.body > 150 ? 90 : 70;

    const lastRepDuration = repTimesRef.current.length > 0 
      ? repTimesRef.current[repTimesRef.current.length - 1] 
      : 0;

    setMetrics({
      reps: count,
      state: (data.stage === 'up' || data.stage === 'down' ? data.stage : 'no_pose') as PushUpState,
      pace: Math.round(pace * 10) / 10,
      elapsed: Math.round(elapsed),
      qualityScore: Math.round(qualityScore),
      lastRepDuration,
    });
  }, [metrics.reps]);

  // Set up pose results callback
  useEffect(() => {
    if (estimatorRef.current && counterRef.current) {
      // Callback will be set up in processFrame for each frame
    }
  }, []);

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

  const resetCounter = useCallback(() => {
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

