/**
 * Hook for real-time exercise analysis via WebSocket
 * Connects to Python AI Service WebSocket endpoint
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { ExerciseType, ExerciseMetrics, resetCounter } from '@/api/fitnessAI.api';
import { videoFrameToBase64 } from '@/api/fitnessAI.api';

const FITNESS_AI_WS_URL = import.meta.env.VITE_FITNESS_AI_WS_URL || 'ws://localhost:8000';

export interface UseFitnessAIWebSocketReturn {
  metrics: ExerciseMetrics | null;
  isConnected: boolean;
  isProcessing: boolean;
  error: string | null;
  connect: (exerciseType: ExerciseType) => void;
  disconnect: () => void;
  sendFrame: (video: HTMLVideoElement) => void;
  reset: () => void;
}

export const useFitnessAIWebSocket = (): UseFitnessAIWebSocketReturn => {
  const [metrics, setMetrics] = useState<ExerciseMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const exerciseTypeRef = useRef<ExerciseType | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback((exerciseType: ExerciseType) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      exerciseTypeRef.current = exerciseType;
      const wsUrl = `${FITNESS_AI_WS_URL}/ws/exercise/${exerciseType}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 [WebSocket] ========== MESSAGE RECEIVED ==========');
          console.log('📨 [WebSocket] Raw message:', event.data);
          console.log('📨 [WebSocket] Parsed data:', JSON.stringify(data, null, 2));
          
          if (data.success && data.data) {
            // Validate metrics data before setting
            const metrics = data.data;
            console.log('📨 [WebSocket] Metrics received:', JSON.stringify(metrics, null, 2));
            console.log('📨 [WebSocket] Metrics validation:', {
              hasMetrics: !!metrics,
              hasReps: typeof metrics.reps === 'number',
              reps: metrics.reps,
              hasQualityScore: typeof metrics.quality_score === 'number',
              qualityScore: metrics.quality_score,
            });
            
            if (metrics && typeof metrics.reps === 'number') {
              console.log('✅ [WebSocket] Setting metrics state with:', JSON.stringify(metrics, null, 2));
              setMetrics(metrics);
              setIsProcessing(false);
              setError(null);
              console.log('✅ [WebSocket] Metrics state updated successfully');
            } else {
              console.warn('⚠️ [WebSocket] Invalid metrics data:', metrics);
              setError('Invalid metrics received from AI service');
            }
          } else if (data.error) {
            console.error('❌ [WebSocket] Error in message:', data.error);
            setError(data.error);
            setIsProcessing(false);
            // Don't clear metrics on error, keep last valid state
          } else {
            console.warn('⚠️ [WebSocket] Unexpected message format:', data);
          }
        } catch (err) {
          console.error('❌ [WebSocket] Error parsing message:', err);
          setError('Failed to parse response');
          setIsProcessing(false);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsProcessing(false);
        // Don't clear metrics on disconnect, keep last valid state
        // setMetrics(null); // Commented out to keep last metrics
        
        // Auto-reconnect after 3 seconds
        if (exerciseTypeRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect(exerciseTypeRef.current!);
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (err: any) {
      console.error('Failed to create WebSocket:', err);
      setError(err.message || 'Failed to connect to WebSocket');
      setIsConnected(false);
    }
  }, []);

  const sendFrame = useCallback((video: HTMLVideoElement) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ [sendFrame] WebSocket not connected, readyState:', wsRef.current?.readyState);
      setError('WebSocket not connected');
      return;
    }

    if (!video || video.readyState < 2) {
      console.warn('⚠️ [sendFrame] Video not ready, readyState:', video?.readyState);
      setError('Video not ready');
      return;
    }

    try {
      setIsProcessing(true);
      const base64Image = videoFrameToBase64(video);
      
      // Remove data URL prefix
      const base64Data = base64Image.split(',')[1];
      
      const message = {
        frame: base64Data.substring(0, 50) + '...', // Log first 50 chars only
        timestamp: Date.now() / 1000,
        exercise_type: exerciseTypeRef.current,
      };

      console.log('📤 [sendFrame] ========== SENDING FRAME ==========');
      console.log('📤 [sendFrame] Video info:', {
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
        readyState: video.readyState,
      });
      console.log('📤 [sendFrame] Message:', {
        ...message,
        frameLength: base64Data.length,
        exerciseType: exerciseTypeRef.current,
      });
      
      wsRef.current.send(JSON.stringify({
        frame: base64Data,
        timestamp: message.timestamp,
        exercise_type: message.exercise_type,
      }));
      
      console.log('✅ [sendFrame] Frame sent successfully');
    } catch (err: any) {
      console.error('❌ [sendFrame] Error sending frame:', err);
      setError(err.message || 'Failed to send frame');
      setIsProcessing(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsProcessing(false);
    exerciseTypeRef.current = null;
    // Keep metrics on disconnect, only clear on explicit reset
  }, []);

  const reset = useCallback(async () => {
    // Reset metrics to null
    setMetrics(null);
    setError(null);
    
    // Call REST API to reset counter instead of WebSocket
    if (exerciseTypeRef.current) {
      try {
        const result = await resetCounter(exerciseTypeRef.current);
        console.log('Reset counter request sent to Python AI service:', result);
      } catch (err) {
        console.warn('Error calling reset API (continuing with local reset):', err);
        // Continue with local reset even if API call fails
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    metrics,
    isConnected,
    isProcessing,
    error,
    connect,
    disconnect,
    sendFrame,
    reset,
  };
};


