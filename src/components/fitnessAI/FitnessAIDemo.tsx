/**
 * Demo component showing how to use Fitness AI Service
 * This is an example - you can integrate this into your existing components
 */
import React, { useState, useRef, useEffect } from 'react';
import { useFitnessAI } from '@/hooks/useFitnessAI';
import { useFitnessAIWebSocket } from '@/hooks/useFitnessAIWebSocket';
import { ExerciseType } from '@/api/fitnessAI.api';
import { Activity, Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';

export const FitnessAIDemo: React.FC = () => {
  const [exerciseType, setExerciseType] = useState<ExerciseType>('push-up');
  const [useWebSocket, setUseWebSocket] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    }, 500); // 2 FPS for REST API (slower than WebSocket)

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWebSocket, autoAnalyze, restAPI.isConnected, exerciseType]);

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
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Fitness AI Service Demo</h2>
        
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

        {/* Exercise Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Exercise Type</label>
          <select
            value={exerciseType}
            onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
            className="w-full p-2 border rounded-lg"
            disabled={useWebSocket && wsAPI.isConnected}
          >
            <option value="push-up">Push-up</option>
            <option value="squat">Squat</option>
            <option value="pull-up">Pull-up</option>
            <option value="sit-up">Sit-up</option>
            <option value="plank">Plank</option>
          </select>
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
            {activeAPI.metrics.form_errors.length > 0 && (
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

            {/* Angles */}
            {Object.keys(activeAPI.metrics.angles).length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Angles:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(activeAPI.metrics.angles).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{key}:</span>{' '}
                      <span className="text-gray-600">{value.toFixed(1)}°</span>
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
  );
};

