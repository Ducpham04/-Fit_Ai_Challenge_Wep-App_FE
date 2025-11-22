import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Clock,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Send,
  Gauge,
} from 'lucide-react';
import { VideoPlayer, VideoPlayerRef } from '../components/video/VideoPlayer';
import { MetricCard } from '../components/metrics/MetricCard';
import { useSquatCounter } from '../hooks/useSquatCounter';
import { uploadVideoForSquatAnalysis, SquatAnalysisResult } from '../api/squatAnalysis';

export const SquatCounter = () => {
  const {
    metrics,
    isModelReady,
    isProcessing,
    error,
    startProcessing,
    stopProcessing,
    resetCounter,
    processFrame,
  } = useSquatCounter();

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Backend integration state
  const [targetReps] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendResult, setBackendResult] = useState<SquatAnalysisResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const processingRef = useRef<number | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const hasSubmittedRef = useRef(false);

  // Handle video load
  const handleVideoLoad = useCallback((video: HTMLVideoElement, file?: File) => {
    setVideoElement(video);
    setVideoError(null);
    if (file) {
      setVideoFile(file);
    }
  }, []);

  // Handle video error
  const handleVideoError = useCallback((errorMsg: string) => {
    setVideoError(errorMsg);
  }, []);

  // Handle play state change
  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    console.log(`📹 Video play state changed to: ${isPlaying ? 'PLAYING' : 'PAUSED'}`);
    setIsVideoPlaying(isPlaying);
  }, []);

  // Processing loop
  useEffect(() => {
    if (!isProcessing || !videoElement || !isVideoPlaying || !canvasRef.current) {
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
  }, [isProcessing, videoElement, isVideoPlaying, processFrame]);

  useEffect(() => {
    if (isModelReady && videoElement && isVideoPlaying && !isProcessing) {
      console.log('🚀 Auto-starting processing: Model ready, video playing, not currently processing');
      startProcessing();
    }
    if ((!isVideoPlaying || !videoElement) && isProcessing) {
      console.log('⏸️ Auto-stopping processing: Video paused or removed');
      stopProcessing();
    }
  }, [isModelReady, videoElement, isVideoPlaying, isProcessing, startProcessing, stopProcessing]);

  // Monitor for target reps reached and submit to backend
  useEffect(() => {
    const submitToBackend = async () => {
      if (metrics.reps >= targetReps && !hasSubmittedRef.current && videoFile && !isCompleted) {
        console.log(`🎯 Target of ${targetReps} squats reached! Submitting to backend...`);
        hasSubmittedRef.current = true;
        
        // Lock the counter
        setIsCompleted(true);
        stopProcessing();
        
        // Pause video
        if (videoPlayerRef.current) {
          videoPlayerRef.current.resetVideo();
        }

        // Submit to backend
        setIsSubmitting(true);
        setSubmissionError(null);

        try {
          console.log('📤 Uploading video for backend analysis...');
          const result = await uploadVideoForSquatAnalysis(
            {
              video: videoFile,
              targetReps: targetReps,
            },
            (progress) => {
              console.log(`📊 Progress: ${progress.status} - ${progress.progress}%`);
            }
          );

          console.log('✅ Backend analysis complete:', result);
          setBackendResult(result);
        } catch (err: any) {
          console.error('❌ Backend submission failed:', err);
          setSubmissionError(
            err.response?.data?.message || err.message || 'Failed to submit to backend'
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    submitToBackend();
  }, [metrics.reps, targetReps, videoFile, isCompleted, stopProcessing]);

  // Dual-action reset handler: Reset metrics AND reload video
  const handleReset = useCallback(() => {
    console.log('🔄 Reset button clicked');
    
    // 1. Stop current processing immediately
    stopProcessing();
    console.log('  ✓ Processing stopped');
    
    // 2. Reset the video to beginning
    if (videoPlayerRef.current) {
      videoPlayerRef.current.resetVideo();
      console.log('  ✓ Video reset to beginning');
    }
    
    // 3. Reset all metrics to initial values
    resetCounter();
    console.log('  ✓ Metrics reset');
    
    // 4. Reset backend-related states
    setIsCompleted(false);
    setBackendResult(null);
    setSubmissionError(null);
    setIsSubmitting(false);
    hasSubmittedRef.current = false;
    console.log('  ✓ Backend states reset');
    
    console.log('  ℹ️ When you click play, processing will auto-start');
  }, [stopProcessing, resetCounter]);

  // Get state display
  const getStateDisplay = () => {
    switch (metrics.state) {
      case 'up':
        return { text: 'Standing', color: 'text-lime-600', bg: 'bg-lime-100' };
      case 'down':
        return { text: 'Squatting', color: 'text-orange-600', bg: 'bg-orange-100' };
      default:
        return { text: 'Waiting...', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const stateDisplay = getStateDisplay();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Squat Counter</h1>
          <p className="text-xl text-gray-600">
            Upload a video and let AI count your squats automatically
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Video</h2>
              </div>

              <div className="relative" ref={videoContainerRef}>
                <VideoPlayer
                  ref={videoPlayerRef}
                  onVideoLoad={handleVideoLoad}
                  onVideoError={handleVideoError}
                  onPlayStateChange={handlePlayStateChange}
                  className="mb-4"
                />
                
                {/* Canvas overlay for pose visualization */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ display: isProcessing && videoElement ? 'block' : 'none' }}
                />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {/* Model Status */}
                  <div className="flex items-center gap-2">
                    {isModelReady ? (
                      <>
                        <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-600">Model Ready</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                        <span className="text-sm text-gray-600">Loading Model...</span>
                      </>
                    )}
                  </div>

                  {/* Processing Status */}
                  {isProcessing && !isCompleted && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-600">Processing...</span>
                    </div>
                  )}
                  
                  {/* Completed Status */}
                  {isCompleted && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-600">
                        Target Reached! {metrics.reps}/{targetReps}
                      </span>
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                  )}

                  {/* State Display */}
                  {videoElement && !isCompleted && (
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${stateDisplay.bg} ${stateDisplay.color}`}
                    >
                      {stateDisplay.text}
                    </div>
                  )}
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  disabled={metrics.reps === 0 && !isCompleted}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Reset metrics and reload video"
                >
                  Reset
                </button>

                {/* Error Display */}
                {(error || videoError) && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error || videoError}</span>
                  </div>
                )}
              </div>

              {/* Completion Notification & Backend Submission Status */}
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 mb-1">
                        🎉 Challenge Completed!
                      </h3>
                      <p className="text-sm text-gray-700 mb-2">
                        You've reached the target of {targetReps} squats! Great job!
                      </p>
                      
                      {/* Backend Submission Status */}
                      {isSubmitting && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">
                            Submitting to backend for detailed analysis...
                          </span>
                        </div>
                      )}
                      
                      {submissionError && (
                        <div className="flex items-center gap-2 text-red-600 mt-2">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{submissionError}</span>
                        </div>
                      )}
                      
                      {backendResult && !isSubmitting && (
                        <div className="flex items-center gap-2 text-green-700 mt-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Analysis submitted successfully! Results received from backend.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Metrics Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Metrics</h2>

              {/* Reps Counter - Highlighted */}
              <div role="status" aria-live="polite" aria-atomic="true">
                <MetricCard
                  title="Squats"
                  value={metrics.reps}
                  icon={Activity}
                  subtitle="total reps"
                  color="sky"
                  isHighlighted={true}
                />
              </div>

              {/* Pace */}
              <MetricCard
                title="Pace"
                value={metrics.pace}
                icon={TrendingUp}
                subtitle="reps/min"
                color="lime"
              />

              {/* Elapsed Time */}
              <MetricCard
                title="Time"
                value={metrics.elapsed}
                icon={Clock}
                subtitle="seconds"
                color="orange"
              />

              {/* Knee Angle */}
              <MetricCard
                title="Knee Angle"
                value={metrics.angle}
                icon={Gauge}
                subtitle="degrees"
                color="pink"
              />

              {/* Quality Score */}
              <MetricCard
                title="Quality"
                value={metrics.qualityScore}
                icon={Award}
                subtitle="form score"
                color="purple"
              />

              {/* Backend Analysis Results */}
              {backendResult && backendResult.success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900">Backend Analysis</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Reps:</span>
                      <span className="font-bold text-gray-900">
                        {backendResult.data.totalReps}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Duration:</span>
                      <span className="font-bold text-gray-900">
                        {backendResult.data.duration.toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Avg Speed:</span>
                      <span className="font-bold text-gray-900">
                        {backendResult.data.averageRepSpeed.toFixed(1)} reps/min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Form Score:</span>
                      <span className="font-bold text-gray-900">
                        {backendResult.data.formScore}/100
                      </span>
                    </div>
                    
                    {/* Quality Metrics */}
                    <div className="pt-2 mt-2 border-t border-blue-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Quality Breakdown:
                      </p>
                      {Object.entries(backendResult.data.qualityMetrics).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-900 w-8 text-right">
                                {value}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-blue-200">
                      Analysis ID: {backendResult.analysisId}
                    </p>
                  </div>
                </motion.div>
              )}

              
            </motion.div>
          </div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Video</h3>
                <p className="text-sm text-gray-600">
                  Upload a front-view video of yourself doing squats. Ensure both legs are visible.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Press Play & Count</h3>
                <p className="text-sm text-gray-600">
                  The AI counts your reps in real-time. When you reach {targetReps} squats, it automatically stops and submits to backend.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Get Analysis</h3>
                <p className="text-sm text-gray-600">
                  Receive detailed performance metrics from the backend AI service including form score and quality breakdown.
                </p>
              </div>
            </div>
          </div>
          
          {/* Target Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-gray-900">
                Target: {targetReps} squats
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              The counter will automatically lock and submit for backend analysis when you complete {targetReps} reps.
            </p>
          </div>
          
          {/* Squat Tips */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Tips for Best Results:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Position camera in front of you (front view)</li>
              <li>• Ensure both legs are fully visible</li>
              <li>• Squat below 120° knee angle for accurate counting</li>
              <li>• Stand up straight (150°+) between reps</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
