import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Challenge } from '../types/myChallenge.type';
import { ChevronDown, CheckCircle, Activity, Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { useFitnessAI } from '@/hooks/useFitnessAI';
import { useFitnessAIWebSocket } from '@/hooks/useFitnessAIWebSocket';
import { ExerciseType } from '@/api/fitnessAI.api';
import { saveDailyTrainingLog } from '../api/myChallengeService';

interface ChallengeDetailExpandedProps {
  challenge: Challenge;
  trainingPlanId?: number | string;
  dayNumber?: number;
  onCollapse?: () => void;
  onSaveComplete?: (analysisData: {
    repsCompleted: number;
    setsCompleted: number;
    score: number;
    isPassed: boolean;
    status: 'completed' | 'in_progress';
  }) => void;
}

export const ChallengeDetailExpanded: React.FC<ChallengeDetailExpandedProps> = ({
  challenge,
  trainingPlanId,
  dayNumber,
  onCollapse,
  onSaveComplete,
}) => {
  const [useWebSocket, setUseWebSocket] = useState(true); // Default to WebSocket for real-time
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'warning'>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoEndedRef = useRef(false);
  const analysisSavedRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  // Map exerciseType from challenge to Python AI exercise type
  const mapExerciseType = (exerciseType?: string): ExerciseType => {
    if (!exerciseType) return 'push-up';
    const type = exerciseType.toLowerCase();
    if (type.includes('push') || type.includes('push-up')) return 'push-up';
    if (type.includes('squat')) return 'squat';
    if (type.includes('pull') || type.includes('pull-up')) return 'pull-up';
    if (type.includes('sit') || type.includes('sit-up')) return 'sit-up';
    if (type.includes('plank')) return 'plank';
    return 'push-up';
  };

  const exerciseType = mapExerciseType(challenge.exerciseType);

  // REST API hook
  const restAPI = useFitnessAI();
  
  // WebSocket hook
  const wsAPI = useFitnessAIWebSocket();

  const activeAPI = useWebSocket ? wsAPI : restAPI;

  // Connect WebSocket when enabled
  useEffect(() => {
    if (useWebSocket) {
      wsAPI.connect(exerciseType);
      return () => {
        wsAPI.disconnect();
      };
    } else {
      wsAPI.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWebSocket, exerciseType]);

  // Process video frames - WebSocket mode (continuous)
  useEffect(() => {
    if (!useWebSocket || !videoRef.current || !wsAPI.isConnected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // WebSocket: send frames continuously when video is playing
    intervalRef.current = setInterval(() => {
      if (videoRef.current && wsAPI.isConnected && !videoRef.current.paused) {
        wsAPI.sendFrame(videoRef.current);
      }
    }, 100); // 10 FPS

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWebSocket, wsAPI.isConnected]);

  // Process video frames - REST API mode (auto-analyze when playing)
  useEffect(() => {
    if (useWebSocket || !autoAnalyze || !videoRef.current || !restAPI.isConnected) {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
      return;
    }

    // REST API: analyze frames periodically when video is playing
    restIntervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && videoRef.current.readyState >= 2) {
        restAPI.analyzeVideoFrame(videoRef.current, exerciseType);
      }
    }, 500); // 2 FPS for REST API

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWebSocket, autoAnalyze, restAPI.isConnected, exerciseType]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '!bg-green-100 !text-green-800 !border-green-300';
      case 'MEDIUM':
        return '!bg-yellow-100 !text-yellow-800 !border-yellow-300';
      case 'HARD':
        return '!bg-red-100 !text-red-800 !border-red-300';
      default:
        return '!bg-gray-100 !text-gray-800 !border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '!bg-green-100 !text-green-800 !border-green-300';
      case 'ACTIVE':
        return '!bg-blue-100 !text-blue-800 !border-blue-300';
      case 'INACTIVE':
        return '!bg-gray-100 !text-gray-800 !border-gray-300';
      default:
        return '!bg-gray-100 !text-gray-800 !border-gray-300';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      
      // Reset state for new video
      restAPI.reset(exerciseType);
      wsAPI.reset();
      videoEndedRef.current = false;
      analysisSavedRef.current = false;
      startTimeRef.current = Date.now();
      setSaveStatus('idle');
      
      // Wait for video to load metadata
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
      };
    }
  };

  // Save analysis to DailyLog when video ends and we have metrics
  const saveAnalysisToDailyLog = useCallback(async () => {
    const metrics = useWebSocket ? wsAPI.metrics : restAPI.metrics;
    
    if (!metrics || !trainingPlanId || !dayNumber || analysisSavedRef.current) {
      return;
    }
    const targetTotalReps = challenge.reps * challenge.sets;
    const repsCompleted = typeof metrics.reps === 'number' ? metrics.reps : 0;
    const isPassed = repsCompleted >= targetTotalReps;
    const qualityScore = typeof metrics.quality_score === 'number' ? metrics.quality_score : 0;
    const processingTime = startTimeRef.current > 0 ? Date.now() - startTimeRef.current : 0;

    // Calculate sets completed based on reps
    const setsCompleted = Math.ceil(repsCompleted / challenge.reps);

    const dailyLogData = {
      repsCompleted: repsCompleted,
      setsCompleted: Math.min(setsCompleted, challenge.sets),
      score: Math.round(qualityScore), // 0-100
      confidence: typeof metrics.is_valid_form === 'boolean' && metrics.is_valid_form ? 0.95 : 0.75,
      actualDurationMinutes: Math.round(processingTime / 1000 / 60),
    };

    try {
      setIsSaving(true);
      setSaveStatus('saving');
      analysisSavedRef.current = true;

      const numTrainingPlanId = typeof trainingPlanId === 'string' ? parseInt(trainingPlanId, 10) : trainingPlanId;
      
      if (isNaN(numTrainingPlanId)) {
        throw new Error(`Invalid trainingPlanId: ${trainingPlanId}`);
      }

      console.log('💾 [ChallengeDetailExpanded] Saving analysis to DailyLog:', {
        trainingPlanId: numTrainingPlanId,
        dayNumber,
        challengeId: challenge.challengeId,
        dailyLogData,
      });

      await saveDailyTrainingLog(
        numTrainingPlanId,
        dayNumber,
        challenge.challengeId,
        isPassed ? 'completed' : 'in_progress',
        dailyLogData
      );

      console.log('✅ [ChallengeDetailExpanded] Analysis saved to DailyLog successfully');
      
      // ✅ FIX: Hiển thị thông báo phù hợp dựa trên kết quả
      if (isPassed) {
        setSaveStatus('success');
        setSaveMessage(`✅ Hoàn thành! Bạn đã thực hiện ${repsCompleted}/${targetTotalReps} reps với điểm số ${Math.round(qualityScore)}%.`);
      } else {
        // ✅ FIX: Chưa đủ rep - hiển thị warning rõ ràng, không reset trang
        setSaveStatus('warning');
        const remainingReps = targetTotalReps - repsCompleted;
        setSaveMessage(`⚠️ Chưa đủ số lần lặp! Bạn đã thực hiện ${repsCompleted}/${targetTotalReps} reps. Cần thêm ${remainingReps} reps nữa để hoàn thành. Vui lòng thử lại!`);
      }
      
      // Call onSaveComplete with analysis data to update status
      if (onSaveComplete) {
        onSaveComplete({
          repsCompleted,
          setsCompleted: Math.min(setsCompleted, challenge.sets),
          score: Math.round(qualityScore),
          isPassed,
          status: isPassed ? 'completed' : 'in_progress',
        });
      }

      // ✅ FIX: Không reset status ngay, giữ lại để user thấy thông báo
      // Chỉ reset sau 8 giây để user có thời gian đọc thông báo
      setTimeout(() => {
        setSaveStatus('idle');
      }, isPassed ? 5000 : 8000); // Warning message hiển thị lâu hơn
    } catch (error: any) {
      console.error('❌ [ChallengeDetailExpanded] Failed to save analysis to DailyLog:', error);
      setSaveStatus('error');
      analysisSavedRef.current = false; // Allow retry
      
      // Show user-friendly error message
      const errorMessage = error?.message || error?.originalError?.message || 'Failed to save. Please try again.';
      setSaveMessage(errorMessage);
      console.error('Error details:', {
        message: errorMessage,
        status: error?.status,
        responseData: error?.responseData,
        originalError: error?.originalError,
      });
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  }, [useWebSocket, wsAPI.metrics, restAPI.metrics, trainingPlanId, dayNumber, challenge.challengeId, challenge.reps, challenge.sets, onSaveComplete]);

  // Also watch metrics changes after video ended
  useEffect(() => {
    const metrics = useWebSocket ? wsAPI.metrics : restAPI.metrics;
    if (videoEndedRef.current && metrics && !analysisSavedRef.current && trainingPlanId && dayNumber) {
      console.log('💾 [ChallengeDetailExpanded] Metrics updated after video ended, saving to DailyLog...');
      saveAnalysisToDailyLog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsAPI.metrics, restAPI.metrics, useWebSocket, trainingPlanId, dayNumber]);

  const handleAnalyzeFrame = async () => {
    if (!videoRef.current) {
      alert('Vui lòng upload video trước');
      return;
    }
    
    if (videoRef.current.readyState < 2) {
      alert('Video chưa load xong. Vui lòng đợi một chút.');
      return;
    }
    
    if (!useWebSocket) {
      await restAPI.analyzeVideoFrame(videoRef.current, exerciseType);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t-2 border-gray-300">
      {/* Collapse Button */}
      {onCollapse && (
        <button
          onClick={onCollapse}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <ChevronDown className="w-4 h-4 rotate-180" />
          Collapse Details
        </button>
      )}

      <div className="space-y-6">
        {/* Challenge Info Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
            Challenge Information
          </h3>
          
          {/* Target Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="!bg-blue-50/50 !border !border-blue-200 rounded-md p-3">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Sets</p>
              <p className="text-2xl font-bold !text-blue-600">{challenge.sets}</p>
            </div>
            <div className="!bg-purple-50/50 !border !border-purple-200 rounded-md p-3">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Reps</p>
              <p className="text-2xl font-bold !text-purple-600">{challenge.reps}</p>
            </div>
            <div className={`!border rounded-md p-3 ${getDifficultyColor(challenge.difficulty)}`}>
              <p className="text-[10px] font-medium uppercase tracking-wide mb-1">Level</p>
              <p className="text-lg font-bold">{challenge.difficulty}</p>
            </div>
            <div className="!bg-orange-50/50 !border !border-orange-200 rounded-md p-3">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Total</p>
              <p className="text-xl font-bold text-gray-900">
                {challenge.reps * challenge.sets}
              </p>
            </div>
          </div>

          {/* Status */}
          {challenge.status && (
            <div className={`rounded-md p-2.5 border ${getStatusColor(challenge.status)}`}>
              <p className="text-xs font-semibold">Status: {challenge.status}</p>
            </div>
          )}

          {/* Description */}
          {challenge.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-xs text-gray-700 leading-relaxed">{challenge.description}</p>
            </div>
          )}

          {/* Completion Status */}
          {challenge.status === 'COMPLETED' && (
            <div className="bg-gradient-to-br from-green-50/80 to-green-100/80 border border-green-300 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold text-gray-900">Challenge Completed</h4>
              </div>
              {challenge.repsCompleted !== undefined && (
                <p className="text-xs text-gray-700">
                  Completed: {challenge.repsCompleted} / {challenge.reps * challenge.sets} reps
                </p>
              )}
              {challenge.score !== undefined && (
                <p className="text-xs text-gray-700 mt-1">
                  Score: {challenge.score}%
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* AI Analysis Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="text-base font-semibold text-gray-900">AI Video Analysis</h3>
            <div className="flex items-center gap-2">
              {activeAPI.isConnected ? (
                <span className="flex items-center gap-1.5 text-xs text-green-600">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="font-medium">Connected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-red-600">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="font-medium">Disconnected</span>
                </span>
              )}
            </div>
          </div>

          {activeAPI.error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-md">
              <AlertCircle size={14} />
              <span>{activeAPI.error}</span>
            </div>
          )}

          {/* Exercise Type & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Exercise Type</label>
              <div className="p-2 border rounded-md bg-gray-50">
                <p className="text-sm text-gray-900 capitalize">{exerciseType.replace('-', ' ')}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useWebSocket}
                    onChange={(e) => {
                      setUseWebSocket(e.target.checked);
                      if (e.target.checked) {
                        setAutoAnalyze(false);
                      }
                    }}
                    className="w-3.5 h-3.5"
                  />
                  <span>Real-time</span>
                </label>
                {!useWebSocket && (
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAnalyze}
                      onChange={(e) => setAutoAnalyze(e.target.checked)}
                      className="w-3.5 h-3.5"
                    />
                    <span>Auto</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Video Input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Upload Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="w-full text-xs p-2 border border-gray-300 rounded-md hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Video Player */}
          <div className="rounded-lg overflow-hidden bg-gray-900">
            <video
              ref={videoRef}
              className="w-full"
              controls
              muted
              playsInline
              crossOrigin="anonymous"
              onLoadedData={() => {
                console.log('Video data loaded, ready to analyze');
              }}
              onPlay={() => {
                console.log('Video playing');
                if (startTimeRef.current === 0) {
                  startTimeRef.current = Date.now();
                }
                // Reset save state when playing new video
                if (!videoEndedRef.current) {
                  analysisSavedRef.current = false;
                  setSaveStatus('idle');
                }
              }}
              onPause={() => {
                console.log('⏸️ [ChallengeDetailExpanded] Video paused');
                // Check if we have metrics and can save
                const metrics = useWebSocket ? wsAPI.metrics : restAPI.metrics;
                if (metrics && !analysisSavedRef.current && trainingPlanId && dayNumber) {
                  console.log('💾 [ChallengeDetailExpanded] Video paused with metrics, auto-saving after delay...');
                  // Auto-save after a short delay to ensure final metrics are received
                  setTimeout(() => {
                    const finalMetrics = useWebSocket ? wsAPI.metrics : restAPI.metrics;
                    if (finalMetrics && !analysisSavedRef.current && !videoRef.current?.ended) {
                      console.log('💾 [ChallengeDetailExpanded] Auto-saving on pause...');
                      saveAnalysisToDailyLog();
                    }
                  }, 500); // Wait 500ms for final metrics
                }
              }}
              onEnded={() => {
                console.log('🎬 [ChallengeDetailExpanded] Video ended event triggered');
                videoEndedRef.current = true;
                
                // Wait a bit for final metrics
                setTimeout(() => {
                  const metrics = useWebSocket ? wsAPI.metrics : restAPI.metrics;
                  if (metrics && !analysisSavedRef.current && trainingPlanId && dayNumber) {
                    console.log('💾 [ChallengeDetailExpanded] Video ended, auto-saving analysis...');
                    saveAnalysisToDailyLog();
                  } else {
                    console.log('⚠️ [ChallengeDetailExpanded] Video ended but no metrics or already saved:', {
                      hasMetrics: !!metrics,
                      alreadySaved: analysisSavedRef.current,
                      hasTrainingPlanId: !!trainingPlanId,
                      hasDayNumber: !!dayNumber,
                    });
                  }
                }, 1000);
              }}
            />
            {videoRef.current && videoRef.current.readyState >= 2 && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <span>✓</span> Ready to analyze
              </p>
            )}
          </div>

          {/* Analyze Button (REST API only - when auto-analyze is off) */}
          {!useWebSocket && !autoAnalyze && (
            <button
              onClick={handleAnalyzeFrame}
              disabled={activeAPI.isProcessing || !activeAPI.isConnected || !videoRef.current || videoRef.current.readyState < 2}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {activeAPI.isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={14} />
                  Analyzing...
                </span>
              ) : (
                'Analyze Current Frame'
              )}
            </button>
          )}

          {/* Auto-analyze status (REST API mode) */}
          {!useWebSocket && autoAnalyze && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                {activeAPI.isProcessing ? (
                  <>
                    <Loader2 className="animate-spin text-blue-600" size={14} />
                    <span className="text-xs font-medium text-blue-700">Analyzing frame...</span>
                  </>
                ) : (
                  <>
                    <Activity className="text-blue-600" size={14} />
                    <span className="text-xs font-medium text-blue-700">Auto-analyze enabled - Play video to start</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Metrics Display */}
          {activeAPI.metrics && (
            <div className="mt-4 p-4 !bg-gradient-to-br !from-blue-50/50 !to-purple-50/50 rounded-lg !border !border-blue-200">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900">
                <Activity className="!text-blue-600" size={16} />
                Analysis Results
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 !bg-white rounded-md shadow-sm">
                  <p className="text-xs text-gray-500 mb-0.5">Reps</p>
                  <p className="text-xl font-bold text-gray-900">{activeAPI.metrics.reps}</p>
                </div>
                
                <div className="p-2.5 !bg-white rounded-md shadow-sm">
                  <p className="text-xs text-gray-500 mb-0.5">Quality</p>
                  <p className="text-xl font-bold text-gray-900">{activeAPI.metrics.quality_score.toFixed(1)}</p>
                </div>
                
                <div className="p-2.5 !bg-white rounded-md shadow-sm">
                  <p className="text-xs text-gray-500 mb-0.5">State</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{activeAPI.metrics.state}</p>
                </div>
                
                <div className="p-2.5 !bg-white rounded-md shadow-sm">
                  <p className="text-xs text-gray-500 mb-0.5">Form</p>
                  <p className={`text-sm font-semibold ${activeAPI.metrics.is_valid_form ? '!text-green-600' : '!text-red-600'}`}>
                    {activeAPI.metrics.is_valid_form ? 'Valid' : 'Invalid'}
                  </p>
                </div>
              </div>

              {/* Form Errors */}
              {activeAPI.metrics.form_errors && activeAPI.metrics.form_errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">Form Errors:</p>
                  <ul className="space-y-1">
                    {activeAPI.metrics.form_errors.map((error: any, idx: number) => (
                      <li
                        key={idx}
                        className={`text-xs p-1.5 rounded ${
                          error.severity === 'error'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : error.severity === 'warning'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Angles */}
              {activeAPI.metrics.angles && Object.keys(activeAPI.metrics.angles).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">Angles:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(activeAPI.metrics.angles).map(([key, value]) => (
                      <div key={key} className="text-xs bg-white/80 p-1.5 rounded">
                        <span className="font-medium text-gray-700">{key.replace(/_/g, ' ')}:</span>{' '}
                        <span className="text-gray-600">{typeof value === 'number' ? value.toFixed(1) : value}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Save Button - Show when video has metrics but not saved yet */}
          {activeAPI.metrics && !analysisSavedRef.current && trainingPlanId && dayNumber && (
            <div className="mt-4 p-3 !bg-yellow-50/80 !border !border-yellow-300 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold !text-yellow-800 mb-0.5">Results Ready</p>
                  <p className="text-[11px] !text-yellow-700">
                    Reps: {activeAPI.metrics.reps} | Score: {typeof activeAPI.metrics.quality_score === 'number' ? activeAPI.metrics.quality_score.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    console.log('💾 [ChallengeDetailExpanded] Manual save button clicked');
                    saveAnalysisToDailyLog();
                  }}
                  disabled={isSaving || saveStatus === 'saving'}
                  className="px-3 py-1.5 !bg-yellow-600 hover:!bg-yellow-700 !text-white rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  {isSaving || saveStatus === 'saving' ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="animate-spin" size={12} />
                      Saving...
                    </span>
                  ) : (
                    '💾 Save Results'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <div className={`mt-4 p-3 rounded-lg !border ${
              saveStatus === 'success' 
                ? '!bg-gradient-to-r !from-green-50/80 !to-emerald-50/80 !border-green-300' 
                : saveStatus === 'warning'
                ? '!bg-gradient-to-r !from-orange-50/80 !to-amber-50/80 !border-orange-300'
                : saveStatus === 'error'
                ? '!bg-red-50 !border-red-300'
                : '!bg-blue-50 !border-blue-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="animate-spin text-blue-600" size={16} />
                    <div>
                      <p className="text-xs font-semibold text-blue-800">Saving results...</p>
                      <p className="text-[11px] text-blue-600 mt-0.5">Please wait</p>
                    </div>
                  </>
                )}
                {saveStatus === 'success' && (
                  <>
                    <CheckCircle className="text-green-600" size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800">✅ Saved successfully!</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Results saved to DailyLog. Challenge status updated.
                      </p>
                      {activeAPI.metrics && (
                        <div className="mt-1.5 text-[11px] text-green-600">
                          Reps: {activeAPI.metrics.reps} | Score: {typeof activeAPI.metrics.quality_score === 'number' ? activeAPI.metrics.quality_score.toFixed(1) : 'N/A'}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {saveStatus === 'warning' && (
                  <>
                    <AlertCircle className="text-orange-600" size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-orange-800">⚠️ Chưa đủ số lần lặp</p>
                      <p className="text-xs text-orange-700 mt-0.5">{saveMessage || 'Bạn cần thực hiện đủ số reps yêu cầu để hoàn thành challenge.'}</p>
                      {activeAPI.metrics && (
                        <div className="mt-1.5 text-[11px] text-orange-600">
                          Reps: {activeAPI.metrics.reps} / {challenge.reps * challenge.sets} | Score: {typeof activeAPI.metrics.quality_score === 'number' ? activeAPI.metrics.quality_score.toFixed(1) : 'N/A'}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="text-red-600" size={16} />
                    <div>
                      <p className="text-xs font-semibold text-red-800">❌ Save failed</p>
                      <p className="text-[11px] text-red-600 mt-0.5">{saveMessage || 'Please try again'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={() => {
              activeAPI.reset(exerciseType);
              videoEndedRef.current = false;
              analysisSavedRef.current = false;
              setSaveStatus('idle');
            }}
            className="mt-3 w-full px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium transition-colors"
          >
            Reset Counter
          </button>
        </div>
      </div>
    </div>
  );
};
