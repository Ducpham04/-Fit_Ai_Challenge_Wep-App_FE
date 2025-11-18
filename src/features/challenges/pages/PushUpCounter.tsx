import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Clock,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { VideoPlayer } from '../../../components/video/VideoPlayer';
import { MetricCard } from '../../../components/metrics/MetricCard';
import { usePushUpCounter } from '../../../hooks/usePushUpCounter';

export const PushUpCounter = () => {
  const {
    metrics,
    isModelReady,
    isProcessing,
    error,
    startProcessing,
    stopProcessing,
    resetCounter,
    processFrame,
  } = usePushUpCounter();

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const processingRef = useRef<number | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle video load
  const handleVideoLoad = useCallback((video: HTMLVideoElement) => {
    setVideoElement(video);
    setVideoError(null);
  }, []);

  // Handle video error
  const handleVideoError = useCallback((errorMsg: string) => {
    setVideoError(errorMsg);
  }, []);

  // Handle play state change
  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    setIsVideoPlaying(isPlaying);
    if (isPlaying) {
      startProcessing();
    } else {
      stopProcessing();
    }
  }, [startProcessing, stopProcessing]);

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
      startProcessing();
    }
    if ((!isVideoPlaying || !videoElement) && isProcessing) {
      stopProcessing();
    }
  }, [isModelReady, videoElement, isVideoPlaying, isProcessing, startProcessing, stopProcessing]);

  // Get state display
  const getStateDisplay = () => {
    switch (metrics.state) {
      case 'up':
        return { text: 'At Top', color: 'text-lime-600', bg: 'bg-lime-100' };
      case 'down':
        return { text: 'At Bottom', color: 'text-orange-600', bg: 'bg-orange-100' };
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Push-Up Counter</h1>
          <p className="text-xl text-gray-600">
            Upload a video and let AI count your push-ups automatically
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
                  {isProcessing && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-600">Processing...</span>
                    </div>
                  )}

                  {/* State Display */}
                  {videoElement && (
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${stateDisplay.bg} ${stateDisplay.color}`}
                    >
                      {stateDisplay.text}
                    </div>
                  )}
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetCounter}
                  disabled={metrics.reps === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Reset counter"
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
                  title="Push-Ups"
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

              {/* Quality Score */}
              <MetricCard
                title="Quality"
                value={metrics.qualityScore}
                icon={Award}
                subtitle="form score"
                color="purple"
              />

              
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
                  Upload a video of yourself doing push-ups. Ensure your full body is visible.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Press Play</h3>
                <p className="text-sm text-gray-600">
                  When the video starts, the model runs automatically and begins counting.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Track Progress</h3>
                <p className="text-sm text-gray-600">
                  See reps, pace, time, and quality update in real-time while playing.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};