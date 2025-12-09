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
  // ✅ FIX Lỗi 6: Limit auto-reconnect attempts
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback((exerciseType: ExerciseType) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // ✅ FIX Lỗi 7: Clear reconnect timeout before connecting
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      exerciseTypeRef.current = exerciseType;
      const wsUrl = `${FITNESS_AI_WS_URL}/ws/exercise/${exerciseType}`;
      
      console.log('🔌 [WebSocket] Connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ [WebSocket] Connected successfully to:', wsUrl);
        setIsConnected(true);
        setError(null);
        // ✅ FIX Lỗi 6: Reset reconnect attempts on successful connection
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.success && data.data) {
            // Validate metrics data before setting
            const metrics = data.data;
            
            if (metrics && typeof metrics.reps === 'number') {
              // Log every 10th message to avoid spam
              if (Math.random() < 0.1) {
                console.log('📥 [WebSocket] Received metrics:', { reps: metrics.reps, state: metrics.state, quality: metrics.quality });
              }
              setMetrics(metrics);
              setIsProcessing(false);
              setError(null);
            } else {
              console.warn('⚠️ [WebSocket] Invalid metrics data:', metrics);
              setError('Invalid metrics received from AI service');
            }
          } else if (data.error) {
            console.error('❌ [WebSocket] Error:', data.error);
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
        setIsConnected(false);
        setIsProcessing(false);
        // ✅ FIX Lỗi 8: Reset metrics on disconnect to avoid stale data
        setMetrics(null);
        
        // ✅ FIX Lỗi 6 & 10: Auto-reconnect with limit and null check
        if (exerciseTypeRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            if (exerciseTypeRef.current) {
              connect(exerciseTypeRef.current);
            }
          }, 3000);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.error('Max reconnect attempts reached. Please reconnect manually.');
          setError('Connection lost. Max reconnect attempts reached.');
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
      
      // Check if video source is blob URL (which may cause CORS issues)
      const isBlobUrl = video.src && video.src.startsWith('blob:');
      if (isBlobUrl) {
        // For blob URLs, ensure crossOrigin is set (though it may not help)
        if (video.crossOrigin !== 'anonymous' && video.crossOrigin !== 'use-credentials') {
          console.warn('⚠️ [sendFrame] Video from blob URL without crossOrigin, may cause CORS error');
        }
      }
      
      const base64Image = videoFrameToBase64(video);
      
      // ✅ FIX Lỗi 9: Safe base64 split with validation
      const base64Data = base64Image.includes(',') 
        ? base64Image.split(',')[1] 
        : base64Image;
      
      if (!base64Data || base64Data.length === 0) {
        throw new Error('Invalid base64 image data');
      }
      
      const frameData = {
        frame: base64Data,
        timestamp: Date.now() / 1000,
        exercise_type: exerciseTypeRef.current,
      };
      
      wsRef.current.send(JSON.stringify(frameData));
      // Log every 10th frame to avoid spam
      if (Math.random() < 0.1) {
        console.log('📤 [sendFrame] Frame sent, exercise_type:', exerciseTypeRef.current, 'timestamp:', frameData.timestamp);
      }
    } catch (err: any) {
      // Handle CORS errors specifically
      if (err.message && err.message.includes('Tainted') || err.message.includes('CORS')) {
        console.error('❌ [sendFrame] CORS error - Video may be from different origin:', err.message);
        console.error('💡 [sendFrame] Solution: Ensure video server has CORS headers or use same-origin video');
        setError('CORS error: Video must be from same origin or have proper CORS headers');
      } else {
        console.error('❌ [sendFrame] Error sending frame:', err);
        setError(err.message || 'Failed to send frame');
      }
      setIsProcessing(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // ✅ FIX Lỗi 7: Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // ✅ FIX Lỗi 6: Reset reconnect attempts
    reconnectAttemptsRef.current = 0;
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsProcessing(false);
    exerciseTypeRef.current = null;
    // ✅ FIX Lỗi 8: Reset metrics on explicit disconnect
    setMetrics(null);
  }, []);

  const reset = useCallback(async () => {
    // Reset metrics to null
    setMetrics(null);
    setError(null);
    
    // Call REST API to reset counter instead of WebSocket
    if (exerciseTypeRef.current) {
      try {
        await resetCounter(exerciseTypeRef.current);
      } catch (err) {
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


