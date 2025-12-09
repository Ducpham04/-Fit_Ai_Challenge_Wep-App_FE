import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Activity, Upload, CheckCircle, AlertCircle, Loader, Download, RotateCcw, TrendingUp, Clock, Award, Wifi, WifiOff } from 'lucide-react';
import apiClient from '@/api/client';
import { useFitnessAIWebSocket } from '@/hooks/useFitnessAIWebSocket';
import { ExerciseType } from '@/api/fitnessAI.api';

interface AIRepCounterProps {
  targetReps: number;
  targetSets: number;
  challengeName: string;
  challengeId: number;
  trainingPlanId: number | string;
  exerciseType?: string; // AI model/exercise type from challenge
  initialVideoUrl?: string; // ✅ ĐỒNG BỘ: Video URL từ challenge (nếu đã upload)
  onAnalysisComplete: (analysis: AIAnalysisResult) => void;
  isLoading?: boolean;
}

export interface AIAnalysisResult {
  correctReps: number;
  totalReps: number;
  accuracy: number;
  feedback: string;
  posture: string;
  formScore: number;
  isPassed: boolean;
  videoUrl: string;
  confidence?: number;
  processingTime?: number;
  userChallengeId?: number; // ID của UserChallenge record (ucId)
}

export const AIRepCounter: React.FC<AIRepCounterProps> = ({
  targetReps,
  targetSets,
  challengeName,
  challengeId,
  trainingPlanId,
  exerciseType,
  initialVideoUrl,
  onAnalysisComplete,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialVideoUrl || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  
  // Map exerciseType from challenge to Python AI exercise type
  const mapExerciseType = (exerciseType?: string): ExerciseType => {
    if (!exerciseType) return 'push-up';
    const type = exerciseType.toLowerCase();
    if (type.includes('push') || type.includes('push-up')) return 'push-up';
    if (type.includes('squat')) return 'squat';
    if (type.includes('pull') || type.includes('pull-up')) return 'pull-up';
    if (type.includes('sit') || type.includes('sit-up')) return 'sit-up';
    if (type.includes('plank')) return 'plank';
    return 'push-up'; // default
  };

  const pythonExerciseType = mapExerciseType(exerciseType);

  // Python AI Service WebSocket hook
  const {
    metrics: pythonMetrics,
    isConnected: isPythonConnected,
    isProcessing: isPythonProcessing,
    error: pythonError,
    connect: connectPythonAI,
    sendFrame: sendFrameToPython,
    reset: resetPythonAI,
  } = useFitnessAIWebSocket();
  
  // ✅ ĐỒNG BỘ: Load video từ challenge nếu có và tự động play để quét
  useEffect(() => {
    if (initialVideoUrl && initialVideoUrl !== preview) {
      setPreview(initialVideoUrl);
      
      // Reset state để sẵn sàng phân tích video mới
      setResult(null);
      setError(null);
      videoProcessedRef.current = false;
      analysisCompleteCalledRef.current = false;
      videoEndedRef.current = false;
      startTimeRef.current = 0;
      
      // Set video source và tự động play sau khi load
      setTimeout(() => {
        if (videoRef.current) {
          const videoUrl = initialVideoUrl.startsWith('http') 
            ? initialVideoUrl 
            : `http://localhost:8080/${initialVideoUrl}`;
          
          // Set crossOrigin only for server URLs (not blob URLs)
          // Server URLs need CORS headers from backend
          if (!videoUrl.startsWith('blob:')) {
            videoRef.current.crossOrigin = 'anonymous';
          } else {
            videoRef.current.removeAttribute('crossOrigin');
          }
          videoRef.current.src = videoUrl;
          
          videoRef.current.onloadedmetadata = () => {
            // Đảm bảo WebSocket đã kết nối
            if (!isPythonConnected && pythonExerciseType) {
              connectPythonAI(pythonExerciseType);
            }
          };
          
          videoRef.current.oncanplay = () => {
            // Đợi WebSocket kết nối trước khi play
            const waitForConnection = setInterval(() => {
              if (isPythonConnected) {
                clearInterval(waitForConnection);
                resetPythonAI();
                startTimeRef.current = Date.now();
                videoRef.current?.play().catch(() => {
                  // Auto-play failed, user will need to click play manually
                });
              } else if (pythonError) {
                clearInterval(waitForConnection);
              }
            }, 100);
            
            setTimeout(() => {
              clearInterval(waitForConnection);
            }, 5000);
          };
        }
      }, 100);
    }
  }, [initialVideoUrl, preview, isPythonConnected, pythonExerciseType, connectPythonAI, pythonError, resetPythonAI]);

  // Video ref - sử dụng trực tiếp như FitnessAIDemo
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoProcessedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const analysisCompleteCalledRef = useRef(false);
  const videoEndedRef = useRef(false); // Track video ended state
  // ✅ FIX Lỗi 19: Track mounted state
  const isMountedRef = useRef(true);
  const previewUrlRef = useRef<string | null>(null); // ✅ FIX Lỗi 12: Track URL for cleanup

  const targetTotalReps = targetReps * targetSets;

  // ✅ FIX Lỗi 19: Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // ✅ FIX: Only cleanup blob URLs on unmount, not regular URLs
      // Don't revoke if we have a result (user might want to see it)
      if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:') && !result) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [result]); // Include result in deps to prevent cleanup when result exists

  // Connect WebSocket when exercise type is available - GIỐNG HỆT FitnessAIDemo
  useEffect(() => {
    if (pythonExerciseType) {
      // Auto-connect WebSocket when component mounts or exercise type changes
      connectPythonAI(pythonExerciseType);
      return () => {
        resetPythonAI();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pythonExerciseType]);

  // ✅ CẢI THIỆN: Process video frames - WebSocket mode (continuous) - GIỐNG HỆT FitnessAIDemo
  useEffect(() => {
    if (!videoRef.current || !isPythonConnected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // ✅ GIỐNG HỆT FitnessAIDemo: WebSocket: send frames continuously when video is playing
    intervalRef.current = setInterval(() => {
      if (videoRef.current && isPythonConnected && !videoRef.current.paused) {
        framesSentRef.current += 1;
        const newCount = framesSentRef.current;
        setFramesSent(newCount);
        if (newCount % 10 === 0) {
          console.log('📤 [AIRepCounter] Frames sent:', newCount);
        }
        sendFrameToPython(videoRef.current);
      }
    }, 100); // 10 FPS - giống FitnessAIDemo

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPythonConnected]);

  // Update error from Python AI
  useEffect(() => {
    if (pythonError) {
      setError(pythonError);
    }
  }, [pythonError]);

  // Debug: Track frame sending and metrics receiving
  const [framesSent, setFramesSent] = useState(0);
  const [metricsCount, setMetricsCount] = useState(0);
  const framesSentRef = useRef(0);
  const metricsCountRef = useRef(0);

  useEffect(() => {
    if (pythonMetrics) {
      const newCount = metricsCountRef.current + 1;
      metricsCountRef.current = newCount;
      setMetricsCount(newCount);
      console.log('📥 [AIRepCounter] Metrics received! Count:', newCount, 'Reps:', pythonMetrics.reps);
    }
  }, [pythonMetrics]);

  // ✅ FIX: Watch video ended state and stop interval immediately
  useEffect(() => {
    const checkVideoEnded = () => {
      if (videoRef.current?.ended || videoEndedRef.current) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };
    
    // Check immediately
    checkVideoEnded();
    
    // Also check periodically (every 500ms) to catch video ended state
    const checkInterval = setInterval(checkVideoEnded, 500);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, []); // Run once on mount, then check periodically

  // ✅ FIX Lỗi 20: Use ref for onAnalysisComplete to avoid dependency issues
  const onAnalysisCompleteRef = useRef(onAnalysisComplete);
  useEffect(() => {
    onAnalysisCompleteRef.current = onAnalysisComplete;
  }, [onAnalysisComplete]);

  // Function to process analysis - extracted để có thể gọi từ nhiều nơi
  const processAnalysis = useCallback(() => {
    const isVideoEnded = videoRef.current?.ended || videoEndedRef.current;
    
    if (
      !videoRef.current ||
      !isVideoEnded ||
      videoProcessedRef.current ||
      analysisCompleteCalledRef.current ||
      !pythonMetrics ||
      typeof pythonMetrics.reps !== 'number' ||
      isNaN(pythonMetrics.reps) || // ✅ FIX Lỗi 17: Check isNaN
      !isFinite(pythonMetrics.reps) || // ✅ FIX Lỗi 17: Check Infinity
      pythonMetrics.reps <= 0
    ) {
      return;
    }

    videoProcessedRef.current = true;
    analysisCompleteCalledRef.current = true;

    const correctReps = pythonMetrics.reps;
    const isPassed = correctReps >= targetTotalReps;
    const qualityScore = typeof pythonMetrics.quality_score === 'number' ? pythonMetrics.quality_score : 0;
    const processingTimeMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    
    // ✅ FIX Lỗi 16: Filter null/undefined form errors
    const formErrors = Array.isArray(pythonMetrics.form_errors) 
      ? pythonMetrics.form_errors.filter(e => e != null && typeof e === 'object' && 'message' in e)
      : [];
    const formErrorsText = formErrors.length > 0
      ? formErrors.map(e => (e as { message?: string }).message || 'Form issue detected').join('. ')
      : 'Good form maintained throughout.';
    
    const feedback = isPassed
      ? `Excellent! You completed ${correctReps} reps with ${qualityScore}% quality score. ${formErrorsText}`
      : `You completed ${correctReps} reps. Need ${targetTotalReps - correctReps} more to reach the target. ${formErrorsText}`;
    
    const is_valid_form = typeof pythonMetrics.is_valid_form === 'boolean' 
      ? pythonMetrics.is_valid_form 
      : qualityScore >= 60; // Default to valid if quality score is good
    
    const analysis: AIAnalysisResult = {
      correctReps,
      totalReps: correctReps,
      accuracy: qualityScore / 100,
      feedback,
      posture: qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : 'Fair',
      formScore: qualityScore / 100,
      isPassed,
      videoUrl: preview,
      confidence: is_valid_form ? 0.95 : 0.75,
      processingTime: processingTimeMs,
      userChallengeId: undefined,
    };

    setResult(analysis);
    setProcessingTime(processingTimeMs);
    
    // Call onAnalysisComplete only once
    try {
      // ✅ FIX Lỗi 20: Use ref to avoid dependency issues
      onAnalysisCompleteRef.current(analysis);
    } catch (error) {
      console.error('❌ [AIRepCounter] Error calling onAnalysisComplete:', error);
    }
  }, [pythonMetrics, targetTotalReps, preview]); // ✅ FIX Lỗi 20: Remove onAnalysisComplete from deps - use ref instead

  // Auto-complete analysis when video ends and we have Python AI metrics
  useEffect(() => {
    // Check if video ended and we have metrics
    // Check both videoRef.current.ended and videoEndedRef.current
    const isVideoEnded = videoRef.current?.ended || videoEndedRef.current;
    
    if (
      videoRef.current &&
      isVideoEnded &&
      !videoProcessedRef.current &&
      !analysisCompleteCalledRef.current &&
      pythonMetrics &&
      typeof pythonMetrics.reps === 'number' &&
      !isNaN(pythonMetrics.reps) && // ✅ FIX Lỗi 17: Check isNaN
      isFinite(pythonMetrics.reps) && // ✅ FIX Lỗi 17: Check Infinity
      pythonMetrics.reps > 0
    ) {
      processAnalysis();
    }
  }, [pythonMetrics, targetTotalReps, preview, processAnalysis]);

  // Handle file select - giống FitnessAIDemo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('Video file too large (max 100MB)');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
    videoProcessedRef.current = false;
    analysisCompleteCalledRef.current = false;
    videoEndedRef.current = false; // ✅ FIX Lỗi 18: Reset videoEndedRef
    startTimeRef.current = 0; // ✅ FIX: Reset start time
    
    // ✅ FIX: Stop any existing interval when uploading new video
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // ✅ FIX Lỗi 12: Revoke old URL before creating new one
    if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    // Create preview URL - giống FitnessAIDemo
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url; // ✅ FIX Lỗi 12: Track URL for cleanup
    setPreview(url);
    
    // ✅ FIX: Reset metrics và đảm bảo WebSocket kết nối trước khi load video
    console.log('🔄 [AIRepCounter] Resetting AI counter for new video upload');
    resetPythonAI();
    framesSentRef.current = 0;
    setFramesSent(0);
    metricsCountRef.current = 0;
    setMetricsCount(0);
    
    // Ensure WebSocket is connected
    if (!isPythonConnected && pythonExerciseType) {
      console.log('🔌 [AIRepCounter] Connecting WebSocket for exercise:', pythonExerciseType);
      connectPythonAI(pythonExerciseType);
    }
    
    // Set video source - giống FitnessAIDemo
    // Use setTimeout to ensure video element is rendered
    setTimeout(() => {
      if (videoRef.current) {
        // Only set crossOrigin for non-blob URLs (server URLs)
        // Blob URLs don't need crossOrigin and setting it may cause issues
        if (!url.startsWith('blob:')) {
          videoRef.current.crossOrigin = 'anonymous';
        } else {
          // Remove crossOrigin for blob URLs
          videoRef.current.removeAttribute('crossOrigin');
        }
        videoRef.current.src = url;
        
        // Wait for video to load metadata
        videoRef.current.onloadedmetadata = () => {
          // ✅ FIX: Đảm bảo WebSocket đã kết nối trước khi video sẵn sàng
          if (!isPythonConnected && pythonExerciseType) {
            connectPythonAI(pythonExerciseType);
          }
        };
        
        // ✅ CẢI THIỆN: Auto-play video sau khi load xong để bắt đầu phân tích tự động - giống FitnessAIDemo
        videoRef.current.oncanplay = () => {
          // ✅ CẢI THIỆN: Auto-play video để bắt đầu phân tích tự động - giống FitnessAIDemo
          // Chỉ auto-play nếu chưa có result (tránh replay khi đã có kết quả)
          if (!result && videoRef.current && videoRef.current.paused) {
            // ✅ CẢI THIỆN: Đợi WebSocket kết nối trước khi play - giống FitnessAIDemo
            const waitForConnection = setInterval(() => {
              if (isPythonConnected) {
                clearInterval(waitForConnection);
                // ✅ CẢI THIỆN: Reset counter trước khi play để bắt đầu đếm mới - giống FitnessAIDemo
                resetPythonAI();
                startTimeRef.current = Date.now();
                videoRef.current?.play().catch((err) => {
                  // Nếu auto-play fail (do browser policy), user sẽ phải bấm play manually
                });
              } else if (pythonError) {
                clearInterval(waitForConnection);
              }
            }, 100);
            
            // Timeout sau 5 giây nếu WebSocket chưa kết nối
            setTimeout(() => {
              clearInterval(waitForConnection);
            }, 5000);
          }
        };
      }
    }, 100);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview('');
    setResult(null);
    setError(null);
    setProcessingTime(0);
    videoProcessedRef.current = false;
    analysisCompleteCalledRef.current = false;
    videoEndedRef.current = false;
    
    if (videoRef.current) {
      videoRef.current.src = '';
    }
    
    resetPythonAI();
  };

  const downloadResultsCSV = () => {
    if (!result) return;

    const csv = [
      ['Challenge Analysis Results'],
      ['Challenge Name', challengeName],
      ['Challenge ID', challengeId],
      ['Target Reps', targetTotalReps],
      [''],
      ['Correct Reps', result.correctReps],
      ['Total Reps', result.totalReps],
      ['Accuracy', (result.accuracy * 100).toFixed(1) + '%'],
      ['Form Score', (result.formScore * 100).toFixed(1) + '%'],
      ['Posture', result.posture],
      ['Status', result.isPassed ? 'PASSED' : 'FAILED'],
      ['Feedback', result.feedback],
      ['Confidence', ((result.confidence || 0) * 100).toFixed(1) + '%'],
      ['Processing Time', (result.processingTime || 0) + 'ms'],
      ['Timestamp', new Date().toISOString()],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `challenge-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  
  // ✅ FIX: Ensure video preview is preserved when showing results
  // Note: Metrics area is always shown, even when result exists
  const isPassed = result ? result.correctReps >= targetTotalReps : false;
  
  if (result) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isPassed ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Activity className={`w-6 h-6 ${isPassed ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">AI Analysis Complete</h3>
              {isPassed && (
                <p className="text-sm font-semibold text-green-600 mt-1">
                  ✅ Challenge Completed! You've reached the target ({result.correctReps}/{targetTotalReps} reps)
                </p>
              )}
              {!isPassed && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ Not enough reps yet ({result.correctReps}/{targetTotalReps}). Need {targetTotalReps - result.correctReps} more reps.
                </p>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {/* Correct Reps */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Correct Reps</p>
              <p className="text-3xl font-bold text-blue-600">{result.correctReps}</p>
              <p className="text-xs text-gray-600 mt-1">Target: {targetTotalReps}</p>
            </div>

            {/* Accuracy */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Accuracy</p>
              <p className="text-3xl font-bold text-purple-600">{(result.accuracy * 100).toFixed(0)}%</p>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${result.accuracy * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Score */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Form Score</p>
              <p className="text-3xl font-bold text-green-600">{(result.formScore * 100).toFixed(0)}%</p>
              <p className="text-xs text-gray-600 mt-1">{result.posture}</p>
            </div>

            {/* Confidence */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Confidence</p>
              <p className="text-3xl font-bold text-orange-600">{((result.confidence || 0) * 100).toFixed(0)}%</p>
              <p className="text-xs text-gray-600 mt-1">AI Confidence</p>
            </div>

            {/* Status */}
            <div className={`bg-gradient-to-br ${isPassed ? 'from-green-50 to-green-100 border-green-200' : 'from-yellow-50 to-yellow-100 border-yellow-200'} rounded-lg p-4 border`}>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Status</p>
              <p className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                {isPassed ? '✓' : '⚠'}
              </p>
              <p className={`text-xs mt-1 ${isPassed ? 'text-green-600 font-semibold' : 'text-yellow-600'}`}>
                {isPassed ? '✅ Completed!' : 'Need more reps'}
              </p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="space-y-4 mb-6">
            {/* AI Feedback Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">🤖 AI Feedback</p>
              <p className="text-sm text-gray-700">{result.feedback}</p>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Rep Count</p>
                <p className="text-2xl font-bold text-gray-900">{result.correctReps}/{result.totalReps}</p>
                <p className="text-xs text-gray-600 mt-1">Completed reps</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">{(result.processingTime || 0)}ms</p>
                <p className="text-xs text-gray-600 mt-1">Analysis duration</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Challenge</p>
                <p className="text-2xl font-bold text-gray-900">#{challengeId}</p>
                <p className="text-xs text-gray-600 mt-1">ID</p>
              </div>
            </div>
          </div>

          {/* Video Preview - Use preview state if result.videoUrl is not available */}
          {(result.videoUrl || preview) && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">📹 Recorded Video</p>
              <video
                src={result.videoUrl || preview}
                controls
                className="w-full max-h-64 rounded-lg bg-black border border-gray-200 object-contain"
                onError={(e) => {
                  console.error('❌ [AIRepCounter] Video load error:', e);
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition"
            >
              Upload Another Video
            </button>
            <button
              onClick={downloadResultsCSV}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
            <button
              onClick={async () => {
                try {
                  await apiClient.patch(
                    `/api/user/training/${trainingPlanId}/challenge/${challengeId}/status`,
                    { status: 'COMPLETED' }
                  );
                  console.log('✅ Challenge marked as completed');
                } catch (err) {
                  console.error('❌ Failed to update status:', err);
                }
              }}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              Mark as Complete
            </button>
          </div>
        </div>
        
        {/* Debug Panel - Show connection and frame sending status */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded-lg">
          <h4 className="text-sm font-bold text-gray-700 mb-2">🔍 Debug Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="font-semibold">WebSocket: </span>
              <span className={isPythonConnected ? 'text-green-600' : 'text-red-600'}>
                {isPythonConnected ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
            <div>
              <span className="font-semibold">Video: </span>
              <span className={videoRef.current && !videoRef.current.paused ? 'text-green-600' : 'text-yellow-600'}>
                {videoRef.current 
                  ? (videoRef.current.paused ? '⏸️ Paused' : '▶️ Playing')
                  : '⏹️ No Video'}
              </span>
            </div>
            <div>
              <span className="font-semibold">Frames Sent: </span>
              <span className="text-blue-600">{framesSent}</span>
            </div>
            <div>
              <span className="font-semibold">Metrics Received: </span>
              <span className={metricsCount > 0 ? 'text-green-600' : 'text-red-600'}>
                {metricsCount} {pythonMetrics ? '(Latest: ' + pythonMetrics.reps + ' reps)' : ''}
              </span>
            </div>
          </div>
          {isPythonConnected && !pythonMetrics && videoRef.current && !videoRef.current.paused && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
              ⚠️ WebSocket connected but no metrics received. Check:
              <ul className="list-disc list-inside mt-1 ml-2">
                <li>Python AI service is running on port 8000</li>
                <li>Frames are being sent (check Frames Sent count above)</li>
                <li>Check browser console for WebSocket errors</li>
              </ul>
            </div>
          )}
        </div>

        {/* Real-time Metrics Display - Always show, even when result exists */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              Real-time Analysis Results
            </h3>
            <div className="flex items-center gap-2">
              {isPythonProcessing && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full animate-pulse">
                  Processing...
                </span>
              )}
              {!isPythonConnected && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Not Connected
                </span>
              )}
              {isPythonConnected && !pythonMetrics && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Waiting for data...
                </span>
              )}
              {isPythonConnected && pythonMetrics && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </span>
              )}
            </div>
          </div>
          
          {/* Connection Status Warning */}
          {!isPythonConnected && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-800 mb-1">WebSocket Not Connected</p>
                  <p className="text-xs text-orange-700">
                    {pythonError 
                      ? `Error: ${pythonError}. Please ensure the Python AI service is running on port 8000.`
                      : 'Please ensure the Python AI service is running on port 8000. The metrics will update once connected.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Reps</p>
              <p className="text-2xl font-bold text-gray-900">
                {pythonMetrics && typeof pythonMetrics.reps === 'number' ? pythonMetrics.reps : (result ? result.correctReps : 0)}
              </p>
              {!isPythonConnected && !result && (
                <p className="text-xs text-gray-400 mt-1">Not connected</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Quality Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {pythonMetrics && typeof pythonMetrics.quality_score === 'number' 
                  ? pythonMetrics.quality_score.toFixed(1) 
                  : (result ? (result.formScore * 100).toFixed(1) : '--')}
              </p>
              {!isPythonConnected && !result && (
                <p className="text-xs text-gray-400 mt-1">Not connected</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-1">State</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {pythonMetrics?.state || (result ? 'completed' : (isPythonConnected ? 'waiting' : 'disconnected'))}
              </p>
              {!isPythonConnected && !result && (
                <p className="text-xs text-gray-400 mt-1">WebSocket offline</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Form Valid</p>
              <p className={`text-lg font-semibold ${
                pythonMetrics && typeof pythonMetrics.is_valid_form === 'boolean' && pythonMetrics.is_valid_form
                  ? 'text-green-600' 
                  : result && result.isPassed
                  ? 'text-green-600'
                  : pythonMetrics && typeof pythonMetrics.is_valid_form === 'boolean'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {pythonMetrics && typeof pythonMetrics.is_valid_form === 'boolean'
                  ? (pythonMetrics.is_valid_form ? 'Yes' : 'No')
                  : (result ? (result.isPassed ? 'Yes' : 'No') : '--')}
              </p>
              {!isPythonConnected && !result && (
                <p className="text-xs text-gray-400 mt-1">Not connected</p>
              )}
            </div>
          </div>

          {/* Form Errors */}
          {pythonMetrics && Array.isArray(pythonMetrics.form_errors) && pythonMetrics.form_errors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Form Errors:</p>
              <ul className="space-y-1">
                {pythonMetrics.form_errors.map((error: any, idx: number) => (
                  <li
                    key={idx}
                    className={`text-sm p-2 rounded ${
                      error.severity === 'error'
                        ? 'bg-red-100 text-red-700'
                        : error.severity === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {error.message || (typeof error === 'string' ? error : 'Form issue detected')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Angles */}
          {pythonMetrics && pythonMetrics.angles && Object.keys(pythonMetrics.angles).length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Angles:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(pythonMetrics.angles).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium">{key}:</span>{' '}
                    <span className="text-gray-600">
                      {typeof value === 'number' ? value.toFixed(1) : value}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Rep Counter</h3>
            <p className="text-sm text-gray-600">
              Target: {targetReps} reps × {targetSets} sets ({targetTotalReps} total)
            </p>
          </div>
        </div>

        {/* Connection Status - Giống FitnessAIDemo */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {isPythonConnected ? (
              <>
                <Wifi className="text-green-600" size={20} />
                <span className="font-semibold text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="text-red-600" size={20} />
                <span className="font-semibold text-red-600">Disconnected</span>
              </>
            )}
          </div>
          {pythonError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{pythonError}</span>
            </div>
          )}
          {!pythonError && (
            <p className="text-xs text-gray-600">Exercise Type: {pythonExerciseType}</p>
          )}
        </div>

        {/* Video Upload Area */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={analyzing || isLoading}
            className="w-full p-2 border rounded-lg"
          />
          {preview && !result && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                ✅ Video đã được tải lên. Video sẽ tự động phát để bắt đầu phân tích.
              </p>
              {!isPythonConnected && (
                <p className="text-xs text-orange-600">
                  ⚠️ Đang kết nối với AI service...
                </p>
              )}
              {isPythonConnected && videoRef.current && videoRef.current.paused && (
                <button
                  onClick={() => {
                    if (videoRef.current && isPythonConnected) {
                      console.log('🔄 [AIRepCounter] Resetting AI counter and starting video');
                      resetPythonAI();
                      framesSentRef.current = 0;
                      setFramesSent(0);
                      metricsCountRef.current = 0;
                      setMetricsCount(0);
                      startTimeRef.current = Date.now();
                      videoRef.current.play().catch((err) => {
                        console.error('❌ [AIRepCounter] Failed to play video:', err);
                        setError('Failed to play video. Please try again.');
                      });
                    }
                  }}
                  className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  ▶️ Start Analysis
                </button>
              )}
            </div>
          )}
        </div>

        {/* Video Player - giống FitnessAIDemo - luôn render */}
        <div className="mb-4">
          {/* Status Message */}
          {preview && (
            <div className={`mb-3 p-3 rounded-lg border ${
              videoRef.current && !videoRef.current.paused && videoRef.current.readyState >= 2
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2">
                {videoRef.current && !videoRef.current.paused && videoRef.current.readyState >= 2 ? (
                  <>
                    <Activity className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-semibold text-green-800">✅ Video is playing - Analysis in progress</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm font-semibold text-yellow-800">
                      ⚠️ Please click the <strong>PLAY</strong> button below to start analysis
                    </p>
                  </>
                )}
              </div>
              {videoRef.current && (
                <p className="text-xs text-gray-600 mt-1">
                  Video state: {videoRef.current.paused ? 'Paused' : 'Playing'} | 
                  Ready: {videoRef.current.readyState >= 2 ? 'Yes' : 'No'} | 
                  WebSocket: {isPythonConnected ? 'Connected' : 'Disconnected'}
                </p>
              )}
            </div>
          )}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-h-64 rounded-lg bg-black object-contain"
              controls
              muted
              playsInline
              autoPlay={true}
              crossOrigin="anonymous"
              onPlay={() => {
                console.log('▶️ [AIRepCounter] Video play event triggered');
                // ✅ FIX: Only reset if this is a new video (not replaying)
                // Don't reset if we already have a result (user is replaying to see results)
                if (!result && startTimeRef.current === 0) {
                  console.log('🔄 [AIRepCounter] Resetting AI counter for new analysis');
                  startTimeRef.current = Date.now();
                  resetPythonAI(); // Only reset for new analysis
                  framesSentRef.current = 0;
                  setFramesSent(0);
                  metricsCountRef.current = 0;
                  setMetricsCount(0);
                }
              }}
              onEnded={() => {
                videoEndedRef.current = true;
                
                // ✅ FIX: Stop sending frames immediately when video ends
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
              }}
            />
              
              {/* Real-time Rep Counter Overlay */}
              {/* ✅ FIX: Luôn hiển thị overlay, ngay cả khi chưa có metrics */}
              {isPythonConnected && (
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-500 z-10">
                  <div className="text-center">
                    <p className="text-xs text-gray-300 uppercase mb-1">Reps</p>
                    <p className="text-5xl font-bold text-white mb-1">
                      {pythonMetrics && typeof pythonMetrics.reps === 'number' ? pythonMetrics.reps : 0}
                    </p>
                    <p className="text-xs text-gray-400">
                      Target: {targetTotalReps}
                    </p>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-2 overflow-hidden relative">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${Math.max(0, Math.min(100, ((pythonMetrics && typeof pythonMetrics.reps === 'number' ? pythonMetrics.reps : 0) / targetTotalReps) * 100))}%`,
                          minWidth: ((pythonMetrics && typeof pythonMetrics.reps === 'number' ? pythonMetrics.reps : 0) / targetTotalReps) * 100 > 0 ? '2px' : '0px'
                        }}
                      />
                    </div>
                    {(pythonMetrics?.quality_score !== undefined || pythonMetrics?.quality_score === 0) && (
                      <p className="text-xs text-gray-300 mt-2">
                        Quality: {pythonMetrics && typeof pythonMetrics.quality_score === 'number' ? pythonMetrics.quality_score.toFixed(0) : '--'}%
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* State Indicator Overlay */}
              {/* ✅ FIX: Luôn hiển thị state indicator khi connected */}
              {isPythonConnected && (
                <div className="absolute top-4 right-4 z-10">
                  <div
                    className={`px-3 py-2 rounded-lg backdrop-blur-sm font-medium ${
                      pythonMetrics?.state === 'up'
                        ? 'bg-green-500/80 text-white'
                        : pythonMetrics?.state === 'down'
                        ? 'bg-orange-500/80 text-white'
                        : pythonMetrics?.state === 'holding'
                        ? 'bg-blue-500/80 text-white'
                        : 'bg-gray-500/80 text-white'
                    }`}
                  >
                    {pythonMetrics?.state === 'up' ? '↑ Up' : 
                     pythonMetrics?.state === 'down' ? '↓ Down' : 
                     pythonMetrics?.state === 'holding' ? '⏸ Holding' : 
                     pythonMetrics?.state === 'rest' ? '⏸ Rest' :
                     'Waiting...'}
                  </div>
                </div>
              )}

              {/* Form Errors Overlay */}
              {/* ✅ FIX: Hiển thị ngay khi có metrics, không cần chờ video play */}
              {isPythonConnected && pythonMetrics && Array.isArray(pythonMetrics.form_errors) && pythonMetrics.form_errors.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-3 border-2 border-red-400 z-10">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white mb-1">Form Issues:</p>
                      {pythonMetrics.form_errors.slice(0, 2).map((error, idx) => (
                        <p key={idx} className="text-xs text-white/90">
                          • {error.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {videoRef.current && videoRef.current.readyState >= 2 && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                ✓ Video đã sẵn sàng để phân tích
              </p>
            )}
          </div>

        {/* Auto-analyze status - Giống FitnessAIDemo */}
        {/* ✅ FIX: Hiển thị status ngay cả khi chưa có preview */}
        {isPythonConnected && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              {isPythonProcessing ? (
                <>
                  <Loader className="animate-spin text-blue-600" size={16} />
                  <span className="text-sm font-medium text-blue-700">Đang phân tích frame...</span>
                </>
              ) : preview ? (
                <>
                  <Activity className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-blue-700">Tự động phân tích đang bật - Play video để bắt đầu</span>
                </>
              ) : (
                <>
                  <Activity className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-blue-700">Sẵn sàng phân tích - Upload video để bắt đầu</span>
                </>
              )}
            </div>
            {pythonMetrics && (
              <div className="mt-2 text-xs text-gray-600">
                {typeof pythonMetrics.reps === 'number' && (
                  <span>Reps: {pythonMetrics.reps} | </span>
                )}
                {typeof pythonMetrics.quality_score === 'number' && (
                  <span>Quality: {pythonMetrics.quality_score.toFixed(0)}%</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reset Button - Giống FitnessAIDemo */}
        <button
          onClick={() => resetPythonAI()}
          className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
        >
          Reset Counter
        </button>

        {/* Real-time Metrics Display - Giống FitnessAIDemo */}
        {/* ✅ FIX: Luôn hiển thị metrics area, ngay cả khi chưa có data hoặc không kết nối được */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              Real-time Analysis Results
            </h3>
            <div className="flex items-center gap-2">
              {isPythonProcessing && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full animate-pulse">
                  Processing...
                </span>
              )}
              {!isPythonConnected && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Not Connected
                </span>
              )}
              {isPythonConnected && !pythonMetrics && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Waiting for data...
                </span>
              )}
              {isPythonConnected && pythonMetrics && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </span>
              )}
            </div>
          </div>
          
          {/* Connection Status Warning */}
          {!isPythonConnected && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-800 mb-1">WebSocket Not Connected</p>
                  <p className="text-xs text-orange-700">
                    {pythonError 
                      ? `Error: ${pythonError}. Please ensure the Python AI service is running on port 8000.`
                      : 'Please ensure the Python AI service is running on port 8000. The metrics will update once connected.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Reps</p>
              <p className="text-2xl font-bold text-gray-900">
                {pythonMetrics && typeof pythonMetrics.reps === 'number' ? pythonMetrics.reps : 0}
              </p>
              {!isPythonConnected && (
                <p className="text-xs text-gray-400 mt-1">Not connected</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Quality Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {pythonMetrics && typeof pythonMetrics.quality_score === 'number' 
                  ? pythonMetrics.quality_score.toFixed(1) 
                  : '--'}
              </p>
              {!isPythonConnected && (
                <p className="text-xs text-gray-400 mt-1">Not connected</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-1">State</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {pythonMetrics?.state || (isPythonConnected ? 'waiting' : 'disconnected')}
              </p>
              {!isPythonConnected && (
                <p className="text-xs text-gray-400 mt-1">WebSocket offline</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Form Valid</p>
              <p className={`text-lg font-semibold ${
                pythonMetrics && typeof pythonMetrics.is_valid_form === 'boolean' && pythonMetrics.is_valid_form
                  ? 'text-green-600' 
                  : pythonMetrics && typeof pythonMetrics.is_valid_form === 'boolean'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {pythonMetrics && typeof pythonMetrics.is_valid_form === 'boolean'
                  ? (pythonMetrics.is_valid_form ? 'Yes' : 'No')
                  : '--'}
              </p>
              {!isPythonConnected && (
                <p className="text-xs text-gray-400 mt-1">Not connected</p>
              )}
            </div>
          </div>

          {/* Form Errors - Giống FitnessAIDemo */}
          {pythonMetrics && Array.isArray(pythonMetrics.form_errors) && pythonMetrics.form_errors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Form Errors:</p>
              <ul className="space-y-1">
                {pythonMetrics.form_errors.map((error: any, idx: number) => (
                  <li
                    key={idx}
                    className={`text-sm p-2 rounded ${
                      error.severity === 'error'
                        ? 'bg-red-100 text-red-700'
                        : error.severity === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {error.message || (typeof error === 'string' ? error : 'Form issue detected')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Angles - Giống FitnessAIDemo */}
          {(() => {
            // Debug angles data
            console.log('🔍 [AIRepCounter] ========== ANGLES DEBUG ==========');
            console.log('🔍 [AIRepCounter] pythonMetrics:', pythonMetrics);
            console.log('🔍 [AIRepCounter] pythonMetrics?.angles:', pythonMetrics?.angles);
            console.log('🔍 [AIRepCounter] typeof pythonMetrics?.angles:', typeof pythonMetrics?.angles);
            console.log('🔍 [AIRepCounter] pythonMetrics?.angles is null?', pythonMetrics?.angles === null);
            console.log('🔍 [AIRepCounter] pythonMetrics?.angles is undefined?', pythonMetrics?.angles === undefined);
            if (pythonMetrics?.angles) {
              console.log('🔍 [AIRepCounter] Object.keys(pythonMetrics.angles):', Object.keys(pythonMetrics.angles));
              console.log('🔍 [AIRepCounter] Object.keys(pythonMetrics.angles).length:', Object.keys(pythonMetrics.angles).length);
              console.log('🔍 [AIRepCounter] Object.keys(pythonMetrics.angles).length > 0?', Object.keys(pythonMetrics.angles).length > 0);
              console.log('🔍 [AIRepCounter] pythonMetrics.angles full object:', JSON.stringify(pythonMetrics.angles, null, 2));
            } else {
              console.log('🔍 [AIRepCounter] pythonMetrics.angles is falsy, cannot check keys');
            }
            console.log('🔍 [AIRepCounter] Condition check:', {
              hasPythonMetrics: !!pythonMetrics,
              hasAngles: !!pythonMetrics?.angles,
              anglesType: typeof pythonMetrics?.angles,
              isObject: typeof pythonMetrics?.angles === 'object',
              keysLength: pythonMetrics?.angles ? Object.keys(pythonMetrics.angles).length : 0,
              willRender: pythonMetrics && pythonMetrics.angles && Object.keys(pythonMetrics.angles).length > 0,
            });
            console.log('🔍 [AIRepCounter] ===========================================');
            
            const hasAngles = pythonMetrics && 
                             pythonMetrics.angles && 
                             typeof pythonMetrics.angles === 'object' && 
                             Object.keys(pythonMetrics.angles).length > 0;
            
            return hasAngles ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Angles:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(pythonMetrics.angles).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{key}:</span>{' '}
                      <span className="text-gray-600">
                        {typeof value === 'number' ? value.toFixed(1) : value}°
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
                No angles data available
                {!pythonMetrics && ' (no metrics)'}
                {pythonMetrics && !pythonMetrics.angles && ' (angles is missing)'}
                {pythonMetrics?.angles === null && ' (angles is null)'}
                {pythonMetrics?.angles === undefined && ' (angles is undefined)'}
                {pythonMetrics?.angles && Object.keys(pythonMetrics.angles).length === 0 && ' (angles object is empty)'}
              </div>
            );
          })()}
        </div>

        {/* Error Messages */}
        {(error || pythonError) && (
          <div className="mt-4 space-y-2">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            {pythonError && pythonError !== error && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-800 mb-1">Python AI Service Error</p>
                  <p className="text-sm text-orange-700">{pythonError}</p>
                  {!isPythonConnected && (
                    <p className="text-xs text-orange-600 mt-2">
                      Please ensure the Python AI service is running on port 8000.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Target Info */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Challenge:</span> {challengeName}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Play the video to start real-time analysis. Python AI service will analyze your form and count reps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
