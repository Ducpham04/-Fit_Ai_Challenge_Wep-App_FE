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
  
  // ✅ ĐỒNG BỘ: Load video từ challenge nếu có
  useEffect(() => {
    if (initialVideoUrl && initialVideoUrl !== preview) {
      console.log('🔵 [AIRepCounter] Loading initial video from challenge:', initialVideoUrl);
      setPreview(initialVideoUrl);
    }
  }, [initialVideoUrl, preview]);
  
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

  // Video ref - sử dụng trực tiếp như FitnessAIDemo
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoProcessedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const analysisCompleteCalledRef = useRef(false);
  const videoEndedRef = useRef(false); // Track video ended state

  const targetTotalReps = targetReps * targetSets;

  // Connect WebSocket when exercise type is available - giống FitnessAIDemo
  useEffect(() => {
    if (pythonExerciseType) {
      console.log('Connecting to Python AI for exercise:', pythonExerciseType);
      connectPythonAI(pythonExerciseType);
      return () => {
        resetPythonAI();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pythonExerciseType]);

  // Process video frames - WebSocket mode (continuous) - giống FitnessAIDemo
  useEffect(() => {
    if (!videoRef.current || !isPythonConnected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // WebSocket: send frames continuously when video is playing
    console.log('🎬 [AIRepCounter] Setting up frame sending interval...');
    console.log('🎬 [AIRepCounter] Video state:', {
      hasVideo: !!videoRef.current,
      isConnected: isPythonConnected,
      paused: videoRef.current?.paused,
      readyState: videoRef.current?.readyState,
    });
    
    intervalRef.current = setInterval(() => {
      if (videoRef.current && isPythonConnected && !videoRef.current.paused && videoRef.current.readyState >= 2) {
        sendFrameToPython(videoRef.current);
      } else {
        console.log('⏸️ [AIRepCounter] Skipping frame send:', {
          hasVideo: !!videoRef.current,
          isConnected: isPythonConnected,
          paused: videoRef.current?.paused,
          readyState: videoRef.current?.readyState,
        });
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
      pythonMetrics.reps <= 0
    ) {
      console.log('⏸️ [AIRepCounter] processAnalysis: Conditions not met', {
        hasVideo: !!videoRef.current,
        videoEnded: videoRef.current?.ended,
        videoEndedRef: videoEndedRef.current,
        isVideoEnded,
        videoProcessed: videoProcessedRef.current,
        analysisCompleteCalled: analysisCompleteCalledRef.current,
        hasMetrics: !!pythonMetrics,
        reps: pythonMetrics?.reps,
      });
      return;
    }

    console.log('✅ [AIRepCounter] processAnalysis: Conditions met, processing analysis...');
    videoProcessedRef.current = true;
    analysisCompleteCalledRef.current = true;

    const correctReps = pythonMetrics.reps;
    const isPassed = correctReps >= targetTotalReps;
    const qualityScore = typeof pythonMetrics.quality_score === 'number' ? pythonMetrics.quality_score : 0;
    const processingTimeMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    
    // Build feedback from form errors (safely)
    const formErrors = Array.isArray(pythonMetrics.form_errors) ? pythonMetrics.form_errors : [];
    const formErrorsText = formErrors.length > 0
      ? formErrors.map(e => e && e.message ? e.message : 'Form issue detected').join('. ')
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

    console.log('✅ [AIRepCounter] Python AI Analysis Complete:', {
      correctReps: analysis.correctReps,
      targetTotalReps: targetTotalReps,
      accuracy: (analysis.accuracy * 100).toFixed(1) + '%',
      formScore: (analysis.formScore * 100).toFixed(1) + '%',
      qualityScore: qualityScore,
      formErrors: formErrors,
      is_valid_form: is_valid_form,
      isPassed: analysis.isPassed,
      status: analysis.isPassed ? '✅ PASSED - Challenge will be marked as COMPLETED' : '❌ FAILED - Need more reps',
    });

    console.log('💾 [AIRepCounter] ========== SETTING RESULT STATE ==========');
    console.log('💾 [AIRepCounter] Setting result state with:', JSON.stringify(analysis, null, 2));
    setResult(analysis);
    setProcessingTime(processingTimeMs);
    console.log('✅ [AIRepCounter] Result state set successfully');
    
    // Call onAnalysisComplete only once
    try {
      console.log('📞 [AIRepCounter] ========== CALLING onAnalysisComplete ==========');
      console.log('📞 [AIRepCounter] Calling onAnalysisComplete with analysis:', JSON.stringify(analysis, null, 2));
      console.log('📞 [AIRepCounter] onAnalysisComplete function type:', typeof onAnalysisComplete);
      console.log('📞 [AIRepCounter] onAnalysisComplete function:', onAnalysisComplete);
      onAnalysisComplete(analysis);
      console.log('✅ [AIRepCounter] onAnalysisComplete called successfully');
    } catch (error) {
      console.error('❌ [AIRepCounter] ========== ERROR CALLING onAnalysisComplete ==========');
      console.error('❌ [AIRepCounter] Error calling onAnalysisComplete:', error);
      console.error('❌ [AIRepCounter] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }, [pythonMetrics, targetTotalReps, preview, onAnalysisComplete]);

  // Auto-complete analysis when video ends and we have Python AI metrics
  useEffect(() => {
    console.log('🔍 [AIRepCounter] useEffect triggered:', {
      hasVideo: !!videoRef.current,
      videoEnded: videoRef.current?.ended,
      videoEndedRef: videoEndedRef.current,
      videoProcessed: videoProcessedRef.current,
      analysisCompleteCalled: analysisCompleteCalledRef.current,
      hasMetrics: !!pythonMetrics,
      reps: pythonMetrics?.reps,
      targetTotalReps,
    });

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
      pythonMetrics.reps > 0
    ) {
      console.log('✅ [AIRepCounter] useEffect: Conditions met, calling processAnalysis...');
      processAnalysis();
    } else {
      console.log('⏸️ [AIRepCounter] useEffect: Conditions not met, skipping analysis', {
        hasVideo: !!videoRef.current,
        isVideoEnded,
        videoProcessed: videoProcessedRef.current,
        analysisCompleteCalled: analysisCompleteCalledRef.current,
        hasMetrics: !!pythonMetrics,
        reps: pythonMetrics?.reps,
      });
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
    videoEndedRef.current = false;

    // Create preview URL - giống FitnessAIDemo
    const url = URL.createObjectURL(file);
    setPreview(url);
    
    // Set video source - giống FitnessAIDemo
    // Use setTimeout to ensure video element is rendered
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = url;
        
        // Reset metrics when new video is loaded
        resetPythonAI();
        
        // Ensure WebSocket is connected
        if (!isPythonConnected && pythonExerciseType) {
          console.log('Connecting WebSocket after video upload');
          connectPythonAI(pythonExerciseType);
        }
        
        // Wait for video to load metadata
        videoRef.current.onloadedmetadata = () => {
          console.log('📥 [AIRepCounter] Video metadata loaded, ready to analyze');
          console.log('📥 [AIRepCounter] Video info:', {
            duration: videoRef.current?.duration,
            readyState: videoRef.current?.readyState,
            paused: videoRef.current?.paused,
          });
        };
        
        videoRef.current.oncanplay = () => {
          console.log('▶️ [AIRepCounter] Video can play now');
          console.log('▶️ [AIRepCounter] Video state:', {
            readyState: videoRef.current?.readyState,
            paused: videoRef.current?.paused,
            currentTime: videoRef.current?.currentTime,
            duration: videoRef.current?.duration,
          });
          // Auto-play video if possible (may be blocked by browser)
          if (videoRef.current && videoRef.current.paused) {
            console.log('▶️ [AIRepCounter] Attempting to auto-play video...');
            videoRef.current.play().then(() => {
              console.log('✅ [AIRepCounter] Video auto-played successfully');
            }).catch((err) => {
              console.warn('⚠️ [AIRepCounter] Auto-play blocked by browser, user needs to click play:', err);
              console.warn('⚠️ [AIRepCounter] Please click the play button to start analysis');
            });
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

  // Log result state for debugging
  console.log('🎨 [AIRepCounter] ========== RENDERING COMPONENT ==========');
  console.log('🎨 [AIRepCounter] result state:', result);
  console.log('🎨 [AIRepCounter] Will render results section:', !!result);
  if (result) {
    console.log('🎨 [AIRepCounter] Rendering results with:', JSON.stringify(result, null, 2));
  }
  
  if (result) {
    const isPassed = result.correctReps >= targetTotalReps;
    console.log('🎨 [AIRepCounter] isPassed:', isPassed, `(${result.correctReps} >= ${targetTotalReps})`);
    
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

          {/* Video Preview */}
          {result.videoUrl && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">📹 Recorded Video</p>
              <video
                src={result.videoUrl}
                controls
                className="w-full max-h-80 rounded-lg bg-black border border-gray-200"
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

        {/* Python AI Connection Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPythonConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Python AI Connected</p>
                    <p className="text-xs text-gray-600">Exercise: {pythonExerciseType}</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-600">Python AI Disconnected</p>
                    <p className="text-xs text-gray-600">Connecting to AI service...</p>
                  </div>
                </>
              )}
            </div>
            {pythonError && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">{pythonError}</span>
              </div>
            )}
          </div>
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
              className="w-full rounded-lg bg-black"
              controls
              muted
              playsInline
              autoPlay={false}
              onPlay={() => {
                console.log('▶️ [AIRepCounter] ========== VIDEO STARTED PLAYING ==========');
                console.log('▶️ [AIRepCounter] Video play event:', {
                  currentTime: videoRef.current?.currentTime,
                  duration: videoRef.current?.duration,
                  readyState: videoRef.current?.readyState,
                });
                startTimeRef.current = Date.now();
                console.log('▶️ [AIRepCounter] Start time set:', startTimeRef.current);
                resetPythonAI();
                console.log('▶️ [AIRepCounter] WebSocket state:', {
                  isConnected: isPythonConnected,
                  hasMetrics: !!pythonMetrics,
                  exerciseType: pythonExerciseType,
                });
              }}
              onPause={() => {
                console.log('⏸️ [AIRepCounter] Video paused at:', videoRef.current?.currentTime);
              }}
              onLoadedData={() => {
                console.log('📥 [AIRepCounter] Video data loaded, ready to analyze');
                console.log('📥 [AIRepCounter] Video state after load:', {
                  readyState: videoRef.current?.readyState,
                  paused: videoRef.current?.paused,
                  duration: videoRef.current?.duration,
                });
              }}
              onCanPlay={() => {
                console.log('▶️ [AIRepCounter] Video can play event fired');
                console.log('▶️ [AIRepCounter] Video state:', {
                  readyState: videoRef.current?.readyState,
                  paused: videoRef.current?.paused,
                  currentTime: videoRef.current?.currentTime,
                  duration: videoRef.current?.duration,
                });
                // Try to auto-play if video is paused
                if (videoRef.current && videoRef.current.paused) {
                  console.log('▶️ [AIRepCounter] Attempting to auto-play video...');
                  videoRef.current.play().then(() => {
                    console.log('✅ [AIRepCounter] Video auto-played successfully');
                  }).catch((err) => {
                    console.warn('⚠️ [AIRepCounter] Auto-play blocked, user needs to click play:', err);
                  });
                }
              }}
              onEnded={() => {
                console.log('🏁 [AIRepCounter] ========== VIDEO ENDED ==========');
                console.log('🏁 [AIRepCounter] Video ended event:', {
                  duration: videoRef.current?.duration,
                  currentTime: videoRef.current?.currentTime,
                  hasMetrics: !!pythonMetrics,
                  reps: pythonMetrics?.reps,
                  metricsFull: JSON.stringify(pythonMetrics, null, 2),
                });
                videoEndedRef.current = true;
                // Trigger analysis check immediately when video ends
                // Use setTimeout to ensure metrics are ready
                setTimeout(() => {
                  if (videoRef.current && videoRef.current.ended && !analysisCompleteCalledRef.current) {
                    console.log('🏁 [AIRepCounter] After delay, checking metrics:', {
                      hasMetrics: !!pythonMetrics,
                      reps: pythonMetrics?.reps,
                      metricsType: typeof pythonMetrics?.reps,
                      metricsFull: JSON.stringify(pythonMetrics, null, 2),
                    });
                    // processAnalysis will be called by useEffect when pythonMetrics updates
                    // But we can also try to call it directly here
                    if (pythonMetrics && typeof pythonMetrics.reps === 'number' && pythonMetrics.reps > 0) {
                      console.log('✅ [AIRepCounter] Video ended with metrics, calling processAnalysis...');
                      processAnalysis();
                    } else {
                      console.warn('⚠️ [AIRepCounter] Video ended but no valid metrics yet, waiting for useEffect...');
                    }
                  }
                }, 1000); // Delay to ensure metrics are ready
              }}
            />
              
              {/* Real-time Rep Counter Overlay */}
              {videoRef.current && !videoRef.current.paused && isPythonConnected && pythonMetrics && typeof pythonMetrics.reps === 'number' && (
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-500">
                  <div className="text-center">
                    <p className="text-xs text-gray-300 uppercase mb-1">Reps</p>
                    <p className="text-5xl font-bold text-white mb-1">
                      {pythonMetrics.reps}
                    </p>
                    <p className="text-xs text-gray-400">
                      Target: {targetTotalReps}
                    </p>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((pythonMetrics.reps / targetTotalReps) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* State Indicator Overlay */}
              {videoRef.current && !videoRef.current.paused && isPythonConnected && pythonMetrics && pythonMetrics.state && (
                <div className="absolute top-4 right-4">
                  <div
                    className={`px-3 py-2 rounded-lg backdrop-blur-sm font-medium ${
                      pythonMetrics.state === 'up'
                        ? 'bg-green-500/80 text-white'
                        : pythonMetrics.state === 'down'
                        ? 'bg-orange-500/80 text-white'
                        : pythonMetrics.state === 'holding'
                        ? 'bg-blue-500/80 text-white'
                        : 'bg-gray-500/80 text-white'
                    }`}
                  >
                    {pythonMetrics.state === 'up' ? '↑ Up' : 
                     pythonMetrics.state === 'down' ? '↓ Down' : 
                     pythonMetrics.state === 'holding' ? '⏸ Holding' : 
                     pythonMetrics.state === 'rest' ? '⏸ Rest' :
                     'Waiting...'}
                  </div>
                </div>
              )}

              {/* Form Errors Overlay */}
              {videoRef.current && !videoRef.current.paused && isPythonConnected && pythonMetrics && Array.isArray(pythonMetrics.form_errors) && pythonMetrics.form_errors.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-3 border-2 border-red-400">
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

        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg mb-4 border border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            {isPythonConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">AI Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-600">Connecting...</span>
              </div>
            )}
            {isPythonProcessing && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Analyzing...</span>
              </div>
            )}
            {pythonMetrics && typeof pythonMetrics.is_valid_form === 'boolean' && pythonMetrics.is_valid_form === false && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-600">Form Issues Detected</span>
              </div>
            )}
          </div>
          <button
            onClick={resetPythonAI}
            disabled={!pythonMetrics || typeof pythonMetrics.reps !== 'number' || pythonMetrics.reps === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Real-time Metrics Cards */}
        {preview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {/* Reps Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">Reps</p>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {pythonMetrics && typeof pythonMetrics.reps === 'number' ? pythonMetrics.reps : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Target: {targetTotalReps} | Progress: {
                  pythonMetrics && typeof pythonMetrics.reps === 'number' 
                    ? Math.round((pythonMetrics.reps / targetTotalReps) * 100) 
                    : 0
                }%
              </p>
            </div>
            
            {/* State Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">State</p>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600 capitalize">
                {pythonMetrics && pythonMetrics.state ? pythonMetrics.state : 'waiting'}
              </p>
              <p className="text-xs text-gray-600 mt-1">Current position</p>
            </div>
            
            {/* Quality Score Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">Quality</p>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {pythonMetrics && typeof pythonMetrics.quality_score === 'number' 
                  ? pythonMetrics.quality_score.toFixed(0) 
                  : '--'}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {pythonMetrics 
                  ? (typeof pythonMetrics.is_valid_form === 'boolean'
                      ? (pythonMetrics.is_valid_form ? 'Valid form' : 'Form issues')
                      : 'Analyzing...')
                  : 'Waiting for data'}
              </p>
            </div>

            {/* Form Errors Card */}
            {pythonMetrics && Array.isArray(pythonMetrics.form_errors) && pythonMetrics.form_errors.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Form Errors</p>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="space-y-1">
                  {pythonMetrics.form_errors.slice(0, 2).map((error, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-red-600 text-xs">•</span>
                      <p className="text-xs text-red-700">{error.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
