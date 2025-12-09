import React, { useState, useEffect, useRef } from 'react';
import { Challenge } from '../types/myChallenge.type';
import { AIAnalysisResult } from './AIRepCounter';
import { useFitnessAI } from '@/hooks/useFitnessAI';
import { useFitnessAIWebSocket } from '@/hooks/useFitnessAIWebSocket';
import { ExerciseType } from '@/api/fitnessAI.api';
import { X, PlayCircle, Activity, Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';

const baseURL = "http://localhost:8080/";

interface ChallengeDetailModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onComplete?: (challengeId: number, userChallengeId?: number, analysisData?: AIAnalysisResult) => Promise<void>;
  isLoading?: boolean;
  trainingPlanId?: number | string;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onUpload,
  onComplete,
  isLoading = false,
  trainingPlanId,
}) => {
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [latestAnalysisResult, setLatestAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [useWebSocket, setUseWebSocket] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    };
  }, []);

  // Connect WebSocket when enabled
  useEffect(() => {
    if (useWebSocket && isOpen) {
      wsAPI.connect(exerciseType);
      return () => {
        wsAPI.disconnect();
      };
    } else {
      wsAPI.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWebSocket, exerciseType, isOpen]);
  
  // Auto-enable WebSocket by default for better UX
  useEffect(() => {
    if (isOpen && !useWebSocket) {
      setUseWebSocket(true);
    }
  }, [isOpen, useWebSocket]);

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
      if (videoRef.current && wsAPI.isConnected && !videoRef.current.paused && !videoRef.current.ended) {
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

  // Reset metrics when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset metrics when modal opens
      restAPI.reset(exerciseType);
      wsAPI.reset();
      setLatestAnalysisResult(null);
      setIsProcessingComplete(false);
    }
  }, [isOpen, exerciseType, restAPI, wsAPI]);


  if (!isOpen) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HARD':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAnalysisComplete = async (analysis: AIAnalysisResult & { userChallengeId?: number }) => {
    if (!isMountedRef.current || isProcessingComplete) return;

    setIsProcessingComplete(true);
    setLatestAnalysisResult(analysis);
    
    try {
      const targetTotalReps = challenge.reps * challenge.sets;
      const isPassed = analysis.correctReps >= targetTotalReps;

      const dailyLogPayload = {
        challengeId: challenge.challengeId,
        challengeName: challenge.challengeName,
        trainingPlanId: trainingPlanId,
        repsCompleted: analysis.correctReps || analysis.totalReps || 0,
        setsCompleted: challenge.sets || 1,
        score: analysis.formScore ? Math.round(analysis.formScore * 100) : (analysis.accuracy ? Math.round(analysis.accuracy * 100) : 0),
        confidence: analysis.confidence || 0,
        accuracy: analysis.accuracy || 0,
        formScore: analysis.formScore || 0,
        posture: analysis.posture || 'Unknown',
        feedback: analysis.feedback || '',
        processingTime: analysis.processingTime || 0,
        actualDurationMinutes: analysis.processingTime ? Math.round(analysis.processingTime / 1000 / 60) : undefined,
        status: isPassed ? 'completed' : 'in_progress',
      };

      if (onComplete && isMountedRef.current) {
        await onComplete(challenge.challengeId, analysis.userChallengeId, {
          ...analysis,
          ...dailyLogPayload,
        });
      }
    } catch (error) {
      console.error('❌ [ChallengeDetailModal] Analysis complete handler failed:', error);
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (isMountedRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setIsProcessingComplete(false);
          timeoutRef.current = null;
        }, 2000);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      
      // Reset metrics when new video is loaded
      restAPI.reset(exerciseType);
      wsAPI.reset();
      setLatestAnalysisResult(null);
      setIsProcessingComplete(false);
      
      // Ensure WebSocket is connected if using WebSocket mode
      if (useWebSocket && !wsAPI.isConnected) {
        wsAPI.connect(exerciseType);
      }
    }
  };

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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{
          margin: 'auto',
          position: 'relative',
          zIndex: 1000
        }}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{challenge.challengeName}</h2>
            {challenge.title && challenge.title !== challenge.challengeName && (
              <p className="text-sm text-gray-500 mt-1">{challenge.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content - Gộp Challenge Info và AI Rep Counter */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Challenge Info Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Challenge Information</h3>
              
              {/* Target Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Sets</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{challenge.sets}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Reps</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{challenge.reps}</p>
                </div>
                <div className={`border rounded-lg p-4 ${getDifficultyColor(challenge.difficulty)}`}>
                  <p className="text-xs font-semibold uppercase">Difficulty</p>
                  <p className="text-xl font-bold mt-2">{challenge.difficulty}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Challenge ID</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{challenge.challengeId}</p>
                </div>
              </div>

              {/* Status */}
              {challenge.status && (
                <div className={`rounded-lg p-4 ${getStatusColor(challenge.status)}`}>
                  <p className="text-sm font-semibold">Status: {challenge.status}</p>
                </div>
              )}

              {/* Description */}
              {challenge.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
                </div>
              )}

              {/* Guidance Video */}
              {challenge.videoUrl && challenge.videoUrl.trim() !== '' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                    Guidance Video
                  </h4>
                  <div className="bg-gray-900 rounded-lg overflow-hidden max-h-40">
                    <video
                      src={challenge.videoUrl.startsWith('http') ? challenge.videoUrl : `${baseURL}${challenge.videoUrl}`}
                      controls
                      className="w-full h-full max-h-40 object-contain"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* AI Analysis Results */}
              {(latestAnalysisResult || challenge.aiAnalysis || 
                (challenge.status === 'COMPLETED' && (challenge.repsCompleted !== undefined || challenge.score !== undefined))) && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✓</span> AI Analysis Results
                    {latestAnalysisResult && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Latest</span>
                    )}
                  </h4>
                  {(() => {
                    let analysis: AIAnalysisResult | null = latestAnalysisResult || null;
                    
                    if (!analysis && challenge.aiAnalysis) {
                      const targetTotalReps = challenge.reps * challenge.sets;
                      const accuracy = typeof challenge.aiAnalysis.accuracy === 'number' 
                        ? (challenge.aiAnalysis.accuracy <= 1 ? challenge.aiAnalysis.accuracy : challenge.aiAnalysis.accuracy / 100)
                        : 0;
                      
                      analysis = {
                        correctReps: challenge.aiAnalysis.correctReps,
                        totalReps: challenge.aiAnalysis.totalReps || challenge.aiAnalysis.correctReps,
                        accuracy: accuracy,
                        feedback: challenge.aiAnalysis.feedback || 'Analysis completed',
                        posture: challenge.aiAnalysis.posture || 'Good',
                        formScore: accuracy,
                        isPassed: challenge.aiAnalysis.correctReps >= targetTotalReps,
                        videoUrl: challenge.videoUrl || '',
                        confidence: 0.75,
                      };
                    }
                    
                    if (!analysis && challenge.status === 'COMPLETED' && (challenge.repsCompleted !== undefined || challenge.score !== undefined)) {
                      const score = challenge.score || (challenge.confidence ? Math.round(challenge.confidence * 100) : 0);
                      const targetTotalReps = challenge.reps * challenge.sets;
                      const correctReps = challenge.repsCompleted || 0;
                      
                      analysis = {
                        correctReps: correctReps,
                        totalReps: correctReps || challenge.reps || 0,
                        accuracy: score / 100,
                        feedback: score >= 80 ? 'Excellent form and execution! Keep up the great work.' : 
                                 score >= 60 ? 'Good effort! Focus on maintaining proper form throughout.' : 
                                 'Keep practicing to improve your form and technique.',
                        posture: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair',
                        formScore: score / 100,
                        isPassed: correctReps >= targetTotalReps,
                        videoUrl: challenge.videoUrl || '',
                        confidence: challenge.confidence || 0.75,
                      };
                    }
                    if (!analysis) return null;
                    
                    return (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Accuracy</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              {typeof analysis.accuracy === 'number' 
                                ? (analysis.accuracy <= 1 ? (analysis.accuracy * 100).toFixed(0) : analysis.accuracy.toFixed(0))
                                : analysis.accuracy}%
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Correct Reps</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              {analysis.correctReps}/{analysis.totalReps || analysis.correctReps}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Form Score</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">
                              {typeof analysis.formScore === 'number' 
                                ? (analysis.formScore <= 1 ? (analysis.formScore * 100).toFixed(0) : analysis.formScore.toFixed(0))
                                : analysis.formScore || 'N/A'}%
                            </p>
                          </div>
                          <div className={`bg-white rounded-lg p-3 ${analysis.isPassed ? 'border-2 border-green-500' : 'border-2 border-yellow-500'}`}>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
                            <p className={`text-xl font-bold mt-1 ${analysis.isPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                              {analysis.isPassed ? '✓ Passed' : '⚠ Incomplete'}
                            </p>
                          </div>
                        </div>
                        <div className="mb-3 bg-white rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Posture</p>
                          <p className="font-semibold text-gray-900">{analysis.posture || 'N/A'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Feedback</p>
                          <p className="text-gray-900">{analysis.feedback || 'No feedback available'}</p>
                        </div>
                        {analysis.confidence && (
                          <div className="mt-3 bg-white rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Confidence</p>
                            <p className="text-gray-900">
                              {typeof analysis.confidence === 'number' 
                                ? (analysis.confidence <= 1 ? (analysis.confidence * 100).toFixed(0) : analysis.confidence.toFixed(0))
                                : analysis.confidence}%
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* AI Rep Counter Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">AI Rep Counter</h3>
              
              {/* Connection Status */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {activeAPI.isConnected ? (
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
                {activeAPI.error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{activeAPI.error}</span>
                  </div>
                )}
              </div>

              {/* API Mode Toggle */}
              <div className="mb-4 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useWebSocket}
                    onChange={(e) => {
                      setUseWebSocket(e.target.checked);
                      if (e.target.checked) {
                        setAutoAnalyze(false); // Disable auto-analyze when WebSocket is on
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span>Use WebSocket (Real-time)</span>
                </label>
                
                {!useWebSocket && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoAnalyze}
                      onChange={(e) => setAutoAnalyze(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Tự động phân tích khi video đang play (REST API)</span>
                  </label>
                )}
              </div>

              {/* Video Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Video Player */}
              <div className="mb-4">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg bg-black"
                  controls
                  muted
                  playsInline
                  onPlay={() => {
                    // Reset metrics when starting new analysis
                    if (useWebSocket) {
                      wsAPI.reset();
                    } else {
                      restAPI.reset(exerciseType);
                    }
                  }}
                  onEnded={() => {
                    // Process analysis when video ends
                    // Wait a bit for final metrics to arrive (WebSocket might be delayed)
                    setTimeout(() => {
                      const finalMetrics = activeAPI.metrics;
                      
                      if (finalMetrics && typeof finalMetrics.reps === 'number' && finalMetrics.reps >= 0) {
                        const targetTotalReps = challenge.reps * challenge.sets;
                        const correctReps = finalMetrics.reps;
                        const isPassed = correctReps >= targetTotalReps;
                        const qualityScore = typeof finalMetrics.quality_score === 'number' 
                          ? finalMetrics.quality_score 
                          : 0;
                        
                        const formErrors = Array.isArray(finalMetrics.form_errors) 
                          ? finalMetrics.form_errors.filter(e => e != null && typeof e === 'object' && 'message' in e)
                          : [];
                        const formErrorsText = formErrors.length > 0
                          ? formErrors.map(e => (e as { message?: string }).message || 'Form issue detected').join('. ')
                          : 'Good form maintained throughout.';
                        
                        const feedback = isPassed
                          ? `Excellent! You completed ${correctReps} reps with ${qualityScore}% quality score. ${formErrorsText}`
                          : correctReps > 0
                          ? `You completed ${correctReps} reps. Need ${targetTotalReps - correctReps} more to reach the target. ${formErrorsText}`
                          : `No reps detected. Please ensure you are visible in the video and performing the exercise correctly. ${formErrorsText}`;
                        
                        const analysis: AIAnalysisResult = {
                          correctReps,
                          totalReps: correctReps,
                          accuracy: qualityScore / 100,
                          feedback,
                          posture: qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : 'Fair',
                          formScore: qualityScore / 100,
                          isPassed,
                          videoUrl: videoRef.current?.src || '',
                          confidence: finalMetrics.is_valid_form ? 0.95 : 0.75,
                          processingTime: 0,
                        };
                        
                        handleAnalysisComplete(analysis);
                      } else {
                        console.warn('⚠️ Video ended but no valid metrics available. Check WebSocket connection and Python AI service.');
                        
                        // Still call handleAnalysisComplete with zero reps
                        const analysis: AIAnalysisResult = {
                          correctReps: 0,
                          totalReps: 0,
                          accuracy: 0,
                          feedback: 'No analysis data available. Please ensure the Python AI service is running and try again.',
                          posture: 'Unknown',
                          formScore: 0,
                          isPassed: false,
                          videoUrl: videoRef.current?.src || '',
                          confidence: 0,
                          processingTime: 0,
                        };
                        handleAnalysisComplete(analysis);
                      }
                    }, 1000); // Wait 1 second for final metrics
                  }}
                />
                {videoRef.current && videoRef.current.readyState >= 2 && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    ✓ Video đã sẵn sàng để phân tích
                  </p>
                )}
              </div>

              {/* Analyze Button (REST API only - when auto-analyze is off) */}
              {!useWebSocket && !autoAnalyze && (
                <div className="space-y-2">
                  <button
                    onClick={handleAnalyzeFrame}
                    disabled={activeAPI.isProcessing || !activeAPI.isConnected || !videoRef.current || videoRef.current.readyState < 2}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {activeAPI.isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Analyzing...
                      </span>
                    ) : (
                      '📸 Phân tích Frame hiện tại'
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    💡 Tip: Bật "Tự động phân tích" để phân tích liên tục khi video đang play
                  </p>
                </div>
              )}

              {/* Auto-analyze status (REST API mode) */}
              {!useWebSocket && autoAnalyze && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    {activeAPI.isProcessing ? (
                      <>
                        <Loader2 className="animate-spin text-blue-600" size={16} />
                        <span className="text-sm font-medium text-blue-700">Đang phân tích frame...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="text-blue-600" size={16} />
                        <span className="text-sm font-medium text-blue-700">Tự động phân tích đang bật - Play video để bắt đầu</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics Display */}
              {activeAPI.metrics && (
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="text-blue-600" size={20} />
                    Analysis Results
                  </h3>
                  
                  {/* Debug: Log metrics data */}
                  {(() => {
                    console.log('🔍 [ChallengeDetailModal] ========== METRICS DEBUG ==========');
                    console.log('🔍 [ChallengeDetailModal] activeAPI.metrics:', activeAPI.metrics);
                    console.log('🔍 [ChallengeDetailModal] activeAPI.metrics.angles:', activeAPI.metrics.angles);
                    console.log('🔍 [ChallengeDetailModal] typeof activeAPI.metrics.angles:', typeof activeAPI.metrics.angles);
                    console.log('🔍 [ChallengeDetailModal] activeAPI.metrics.angles is null?', activeAPI.metrics.angles === null);
                    console.log('🔍 [ChallengeDetailModal] activeAPI.metrics.angles is undefined?', activeAPI.metrics.angles === undefined);
                    if (activeAPI.metrics.angles) {
                      console.log('🔍 [ChallengeDetailModal] Object.keys(activeAPI.metrics.angles):', Object.keys(activeAPI.metrics.angles));
                      console.log('🔍 [ChallengeDetailModal] Object.keys(activeAPI.metrics.angles).length:', Object.keys(activeAPI.metrics.angles).length);
                      console.log('🔍 [ChallengeDetailModal] Object.keys(activeAPI.metrics.angles).length > 0?', Object.keys(activeAPI.metrics.angles).length > 0);
                      console.log('🔍 [ChallengeDetailModal] activeAPI.metrics.angles full object:', JSON.stringify(activeAPI.metrics.angles, null, 2));
                    } else {
                      console.log('🔍 [ChallengeDetailModal] activeAPI.metrics.angles is falsy, cannot check keys');
                    }
                    console.log('🔍 [ChallengeDetailModal] ===========================================');
                    return null;
                  })()}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Reps</p>
                      <p className="text-2xl font-bold text-gray-900">{activeAPI.metrics.reps}</p>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Quality Score</p>
                      <p className="text-2xl font-bold text-gray-900">{activeAPI.metrics.quality_score.toFixed(1)}</p>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">State</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{activeAPI.metrics.state}</p>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Form Valid</p>
                      <p className={`text-lg font-semibold ${activeAPI.metrics.is_valid_form ? 'text-green-600' : 'text-red-600'}`}>
                        {activeAPI.metrics.is_valid_form ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Form Errors */}
                  {activeAPI.metrics.form_errors && activeAPI.metrics.form_errors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Form Errors:</p>
                      <ul className="space-y-1">
                        {activeAPI.metrics.form_errors.map((error, idx) => (
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
                            {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Angles - Always show if metrics exist */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Angles:</p>
                    {activeAPI.metrics.angles && 
                     typeof activeAPI.metrics.angles === 'object' && 
                     Object.keys(activeAPI.metrics.angles).length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(activeAPI.metrics.angles).map(([key, value]) => {
                          console.log(`✅ [ChallengeDetailModal] Rendering angle: ${key} = ${value}`);
                          const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                          return (
                            <div 
                              key={key} 
                              className="text-sm p-3 bg-white rounded-lg border-2 border-blue-200 shadow-sm"
                              style={{ minHeight: '40px' }}
                            >
                              <span className="font-semibold text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                              <span className="text-blue-600 font-bold text-base">
                                {!isNaN(numValue) ? numValue.toFixed(1) : String(value)}°
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-700">
                        <p className="font-semibold">No angles data available</p>
                        <p className="mt-1">
                          Debug: angles exists? {activeAPI.metrics.angles ? 'Yes' : 'No'} | 
                          Type: {typeof activeAPI.metrics.angles} | 
                          Keys: {activeAPI.metrics.angles ? Object.keys(activeAPI.metrics.angles).length : 0}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={() => activeAPI.reset(exerciseType)}
                className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset Counter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
