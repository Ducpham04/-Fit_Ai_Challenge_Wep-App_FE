import React, { useState, useRef, useEffect } from 'react';
import { Challenge } from '../types/myChallenge.type';
import { ChevronDown, CheckCircle, Activity, Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { useFitnessAI } from '@/hooks/useFitnessAI';
import { useFitnessAIWebSocket } from '@/hooks/useFitnessAIWebSocket';
import { ExerciseType } from '@/api/fitnessAI.api';

interface ChallengeDetailExpandedProps {
  challenge: Challenge;
  onCollapse?: () => void;
}

export const ChallengeDetailExpanded: React.FC<ChallengeDetailExpandedProps> = ({
  challenge,
  onCollapse,
}) => {
  const [useWebSocket, setUseWebSocket] = useState(true); // Default to WebSocket for real-time
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
      
      // Wait for video to load metadata
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
      };
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
              <p className="text-xs font-semibold text-gray-600 uppercase">Total Reps</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {challenge.reps * challenge.sets}
              </p>
            </div>
          </div>

          {/* Status */}
          {challenge.status && (
            <div className={`rounded-lg p-4 border ${getStatusColor(challenge.status)}`}>
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

          {/* Completion Status */}
          {challenge.status === 'COMPLETED' && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Challenge Completed</h4>
              </div>
              {challenge.repsCompleted !== undefined && (
                <p className="text-sm text-gray-700">
                  Completed: {challenge.repsCompleted} / {challenge.reps * challenge.sets} reps
                </p>
              )}
              {challenge.score !== undefined && (
                <p className="text-sm text-gray-700 mt-1">
                  Score: {challenge.score}%
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* AI Analysis Section - Giống FitnessAIDemo */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
            AI Video Analysis
          </h3>

          {/* Connection Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
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

          {/* Exercise Type Display */}
          <div>
            <label className="block text-sm font-medium mb-2">Exercise Type</label>
            <div className="p-2 border rounded-lg bg-gray-50">
              <p className="text-gray-900 capitalize">{exerciseType.replace('-', ' ')}</p>
            </div>
          </div>

          {/* API Mode Toggle */}
          <div className="space-y-2">
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
          <div>
            <label className="block text-sm font-medium mb-2">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Video Player */}
          <div>
            <video
              ref={videoRef}
              className="w-full rounded-lg bg-black"
              controls
              muted
              playsInline
              crossOrigin="anonymous"
              onLoadedData={() => {
                console.log('Video data loaded, ready to analyze');
              }}
              onPlay={() => {
                console.log('Video playing');
              }}
              onPause={() => {
                console.log('Video paused');
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
                    {activeAPI.metrics.form_errors.map((error: any, idx: number) => (
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

              {/* Angles */}
              {activeAPI.metrics.angles && Object.keys(activeAPI.metrics.angles).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Angles:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(activeAPI.metrics.angles).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
                        <span className="text-gray-600">{typeof value === 'number' ? value.toFixed(1) : value}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
  );
};
