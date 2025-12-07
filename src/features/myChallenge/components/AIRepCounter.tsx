import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Activity, Upload, CheckCircle, AlertCircle, Loader, Download, RotateCcw, TrendingUp, Clock, Award } from 'lucide-react';
import apiClient from '@/api/client';
import { usePushUpCounter, PushUpMetrics } from '@/hooks/usePushUpCounter';
import { VideoPlayer } from '@/components/video/VideoPlayer';

interface AIRepCounterProps {
  targetReps: number;
  targetSets: number;
  challengeName: string;
  challengeId: number;
  trainingPlanId: number | string;
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
  onAnalysisComplete,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [useAccurateModel, setUseAccurateModel] = useState(true); // Sử dụng mô hình chính xác hơn

  // MediaPipe pose detection hook (chính xác hơn)
  const {
    metrics: pushUpMetrics,
    isModelReady,
    isProcessing: isProcessingVideo,
    error: modelError,
    startProcessing,
    stopProcessing,
    resetCounter,
    processFrame,
  } = usePushUpCounter();

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const processingRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoProcessedRef = useRef(false);

  const targetTotalReps = targetReps * targetSets;

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

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  // Handle video load from VideoPlayer
  const handleVideoLoad = useCallback((video: HTMLVideoElement) => {
    setVideoElement(video);
    setError(null);
  }, []);

  // Handle video error
  const handleVideoError = useCallback((errorMsg: string) => {
    setError(errorMsg);
  }, []);

  // Handle play state change
  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    setIsVideoPlaying(isPlaying);
    if (isPlaying && isModelReady) {
      startProcessing();
    } else {
      stopProcessing();
    }
  }, [isModelReady, startProcessing, stopProcessing]);

  // Processing loop for accurate video analysis
  useEffect(() => {
    if (!isProcessingVideo || !videoElement || !isVideoPlaying || !canvasRef.current || !useAccurateModel) {
      if (processingRef.current) {
        cancelAnimationFrame(processingRef.current);
        processingRef.current = null;
      }
      return;
    }

    const processLoop = async () => {
      if (videoElement && !videoElement.paused && !videoElement.ended && canvasRef.current) {
        await processFrame(videoElement, canvasRef.current);
      }
      processingRef.current = requestAnimationFrame(processLoop);
    };

    processingRef.current = requestAnimationFrame(processLoop);

    return () => {
      if (processingRef.current) {
        cancelAnimationFrame(processingRef.current);
        processingRef.current = null;
      }
    };
  }, [isProcessingVideo, videoElement, isVideoPlaying, processFrame, useAccurateModel]);

  // Auto-complete analysis when video ends and we have accurate metrics
  useEffect(() => {
    if (
      useAccurateModel &&
      videoElement &&
      videoElement.ended &&
      !videoProcessedRef.current &&
      pushUpMetrics.reps > 0 &&
      isModelReady
    ) {
      videoProcessedRef.current = true;
      stopProcessing();
      
      // Use accurate metrics from MediaPipe
      const correctReps = pushUpMetrics.reps;
      const isPassed = correctReps >= targetTotalReps;
      
      const analysis: AIAnalysisResult = {
        correctReps,
        totalReps: correctReps,
        accuracy: pushUpMetrics.qualityScore / 100,
        feedback: isPassed
          ? `Excellent! You completed ${correctReps} reps with good form.`
          : `You completed ${correctReps} reps. Need ${targetTotalReps - correctReps} more to reach the target.`,
        posture: pushUpMetrics.qualityScore >= 80 ? 'Excellent' : pushUpMetrics.qualityScore >= 60 ? 'Good' : 'Fair',
        formScore: pushUpMetrics.qualityScore / 100,
        isPassed,
        videoUrl: preview,
        confidence: 0.95, // High confidence from MediaPipe
        processingTime: pushUpMetrics.elapsed * 1000,
        userChallengeId: undefined,
      };

      console.log('✅ Accurate AI Analysis Complete (MediaPipe):', {
        correctReps: analysis.correctReps,
        targetTotalReps: targetTotalReps,
        accuracy: (analysis.accuracy * 100).toFixed(1) + '%',
        formScore: (analysis.formScore * 100).toFixed(1) + '%',
        isPassed: analysis.isPassed,
        status: analysis.isPassed ? '✅ PASSED - Challenge will be marked as COMPLETED' : '❌ FAILED - Need more reps',
      });

      setResult(analysis);
      setProcessingTime(pushUpMetrics.elapsed * 1000);
      onAnalysisComplete(analysis);
    }
  }, [videoElement, pushUpMetrics, targetTotalReps, preview, isModelReady, useAccurateModel, stopProcessing, onAnalysisComplete]);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    setAnalyzing(true);
    setError(null);
    const startTime = Date.now();

    try {
      console.log('🎬 [MOCK] Analyzing video (no backend API call):');
      console.log('  Training Plan ID:', trainingPlanId);
      console.log('  Challenge ID:', challengeId);
      console.log('  File:', selectedFile.name);
      console.log('  File Size:', (selectedFile.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('  Target Reps:', targetReps, 'x', targetSets, '=', targetTotalReps);

      // ⚠️ MOCK MODE: Không gọi API, chỉ simulate phân tích
      // Simulate processing time (2-4 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      const processingTimeMs = Date.now() - startTime;

      // Generate mock analysis results
      // Đảm bảo có khả năng đạt yêu cầu (70% chance để test)
      const randomFactor = Math.random();
      const correctReps = randomFactor > 0.3 
        ? Math.floor(targetTotalReps + Math.random() * 3) // Đạt yêu cầu (70% chance)
        : Math.floor(targetTotalReps * 0.7 + Math.random() * (targetTotalReps * 0.3)); // Chưa đạt (30% chance)
      
      // Kiểm tra: đạt yêu cầu nếu correctReps >= targetTotalReps
      const isPassed = correctReps >= targetTotalReps;
      
      console.log('📊 AI Analysis Check:', {
        targetReps: targetReps,
        targetSets: targetSets,
        targetTotalReps: targetTotalReps,
        correctReps: correctReps,
        isPassed: isPassed,
        requirement: `correctReps (${correctReps}) >= targetTotalReps (${targetTotalReps})`,
      });
      
      // Mock userChallengeId (sẽ được backend tạo khi có API thật)
      const mockUserChallengeId = Math.floor(Math.random() * 1000) + 1;
      
      const analysis: AIAnalysisResult = {
        correctReps,
        totalReps: targetTotalReps + Math.floor(Math.random() * 5),
        accuracy: Math.random() * 0.3 + (isPassed ? 0.8 : 0.5),
        feedback: [
          'Excellent form! Keep your back straight and maintain consistent pace.',
          'Good range of motion. Try to engage your core more.',
          'Maintain consistent speed throughout the set.',
          'Your posture is excellent! Great job.',
          'Try to go deeper for maximum muscle engagement.',
          'Nice control! Avoid rushing through the movements.',
        ][Math.floor(Math.random() * 6)],
        posture: ['Excellent', 'Good', 'Fair', 'Good'][Math.floor(Math.random() * 4)],
        formScore: Math.random() * 0.2 + (isPassed ? 0.75 : 0.55),
        isPassed,
        videoUrl: preview,
        confidence: Math.random() * 0.2 + 0.8,
        processingTime: processingTimeMs,
        userChallengeId: mockUserChallengeId, // Mock ID, sẽ được thay bằng real ID khi có API
      };

      console.log('✅ AI Analysis Complete:', {
        correctReps: analysis.correctReps,
        targetTotalReps: targetTotalReps,
        accuracy: (analysis.accuracy * 100).toFixed(1) + '%',
        formScore: (analysis.formScore * 100).toFixed(1) + '%',
        isPassed: analysis.isPassed,
        status: analysis.isPassed ? '✅ PASSED - Challenge will be marked as COMPLETED' : '❌ FAILED - Need more reps',
        processingTime: processingTimeMs + 'ms',
      });

      setResult(analysis);
      setProcessingTime(processingTimeMs);
      onAnalysisComplete(analysis);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to analyze video';
      setError(errorMsg);
      console.error('❌ Analysis Error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview('');
    setResult(null);
    setError(null);
    setProcessingTime(0);
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

  if (result) {
    const isPassed = result.correctReps >= targetTotalReps;
    
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

          {/* Results Grid - Similar to AILogsPage */}
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
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700  rounded-lg font-medium transition flex items-center justify-center gap-2"
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
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700  rounded-lg font-medium transition"
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

        {/* Mode Toggle */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Analysis Mode</p>
              <p className="text-xs text-gray-600">
                {useAccurateModel ? '🎯 Accurate (MediaPipe)' : '⚡ Quick (Mock)'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useAccurateModel}
                onChange={(e) => {
                  setUseAccurateModel(e.target.checked);
                  if (e.target.checked) {
                    resetCounter();
                    setResult(null);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Upload Area */}
        {useAccurateModel && selectedFile ? (
          <div className="border-2 border-blue-400 bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Video Section */}
              <div className="lg:col-span-2">
                <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
                  <VideoPlayer
                    onVideoLoad={handleVideoLoad}
                    onVideoError={handleVideoError}
                    onPlayStateChange={handlePlayStateChange}
                    className="mb-0"
                    externalFile={selectedFile}
                    externalVideoSrc={preview}
                  />
                  
                  {/* Canvas overlay for pose visualization */}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ display: isProcessingVideo && videoElement ? 'block' : 'none' }}
                  />
                  
                  {/* Real-time Rep Counter Overlay */}
                  {isProcessingVideo && videoElement && (
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-500">
                      <div className="text-center">
                        <p className="text-xs text-gray-300 uppercase mb-1">Reps</p>
                        <p className="text-5xl font-bold text-white mb-1">
                          {pushUpMetrics.reps}
                        </p>
                        <p className="text-xs text-gray-400">
                          Target: {targetTotalReps}
                        </p>
                        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((pushUpMetrics.reps / targetTotalReps) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* State Indicator Overlay */}
                  {isProcessingVideo && videoElement && (
                    <div className="absolute top-4 right-4">
                      <div
                        className={`px-3 py-2 rounded-lg backdrop-blur-sm font-medium ${
                          pushUpMetrics.state === 'up'
                            ? 'bg-green-500/80 text-white'
                            : pushUpMetrics.state === 'down'
                            ? 'bg-orange-500/80 text-white'
                            : 'bg-gray-500/80 text-white'
                        }`}
                      >
                        {pushUpMetrics.state === 'up' ? '↑ Up' : pushUpMetrics.state === 'down' ? '↓ Down' : 'Waiting...'}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Status Bar */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg mb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {isModelReady ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-600">Model Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-sm text-gray-600">Loading Model...</span>
                      </div>
                    )}
                    {isProcessingVideo && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={resetCounter}
                    disabled={pushUpMetrics.reps === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              {/* Real-time Metrics Cards */}
              <div className="lg:col-span-1 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Live Metrics</h4>
                
                {/* Reps Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Reps</p>
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{pushUpMetrics.reps}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Target: {targetTotalReps} | Progress: {Math.round((pushUpMetrics.reps / targetTotalReps) * 100)}%
                  </p>
                </div>
                
                {/* Pace Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Pace</p>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{pushUpMetrics.pace}</p>
                  <p className="text-xs text-gray-600 mt-1">reps/min</p>
                </div>
                
                {/* Time Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Time</p>
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{pushUpMetrics.elapsed}s</p>
                  <p className="text-xs text-gray-600 mt-1">elapsed</p>
                </div>
                
                {/* Quality Score Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Quality</p>
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{pushUpMetrics.qualityScore}%</p>
                  <p className="text-xs text-gray-600 mt-1">form score</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 text-center mt-3">
              Play the video to start accurate rep counting. The AI will analyze your form in real-time.
            </p>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              selectedFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {preview ? (
              <div>
                <video
                  src={preview}
                  controls
                  className="w-full max-h-48 rounded-lg bg-black mb-4"
                />
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-600">
                  {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="py-6">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Your Video
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  MP4, WebM, or MOV (max 100MB)
                </p>
              </div>
            )}

            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={analyzing}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <button
                type="button"
                onClick={() => document.getElementById('video-upload')?.click()}
                disabled={analyzing}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400  rounded-lg font-medium transition"
              >
                {selectedFile ? 'Choose Another' : 'Select Video'}
              </button>
            </label>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Target Info */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Challenge:</span> {challengeName}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              The AI will analyze your form and count reps to ensure you meet the target.
            </p>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || analyzing || isLoading}
          className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400  rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          {analyzing || isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Analyzing Video...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Analyze with AI
            </>
          )}
        </button>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-3">
          Processing time: ~2-3 seconds per video
        </p>
      </div>
    </div>
  );
};
