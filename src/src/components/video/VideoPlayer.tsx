import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Upload, Play, Pause, RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';

export interface VideoPlayerRef {
  resetVideo: () => void;
}

interface VideoPlayerProps {
  onVideoLoad?: (video: HTMLVideoElement, file?: File) => void;
  onVideoError?: (error: string) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  onVideoLoad,
  onVideoError,
  onPlayStateChange,
  className = '',
}, ref) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentFileRef = useRef<File | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        const errorMsg = 'Please upload a valid video file (MP4, WebM, or MOV)';
        setError(errorMsg);
        onVideoError?.(errorMsg);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = 'File size must be less than 100MB';
        setError(errorMsg);
        onVideoError?.(errorMsg);
        return;
      }

      // Revoke previous object URL to avoid memory leaks
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }

      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Store the file reference
      currentFileRef.current = file;
    },
    [videoSrc, onVideoError]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Video event handlers
  const handleVideoLoad = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      onVideoLoad?.(videoRef.current, currentFileRef.current || undefined);
    }
  }, [onVideoLoad]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  // Playback controls
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        console.log('⏸️ Video paused, notifying parent');
        onPlayStateChange?.(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        console.log('▶️ Video playing, notifying parent');
        onPlayStateChange?.(true);
      }
    }
  }, [isPlaying, onPlayStateChange]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (videoRef.current) {
      console.log('🔄 VideoPlayer: Resetting video');
      videoRef.current.pause(); // Explicitly pause the video
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      console.log('  ✓ Video paused and reset to 0');
      onPlayStateChange?.(false);
    }
  }, [onPlayStateChange]);

  const handleClearVideo = useCallback(() => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [videoSrc]);

  // Expose reset method to parent via ref
  useImperativeHandle(ref, () => ({
    resetVideo: handleReset,
  }), [handleReset]);

  // Format time helper
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Upload Area or Video */}
      {!videoSrc ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging
              ? 'border-sky-500 bg-sky-50'
              : 'border-gray-300 bg-white hover:border-sky-400'
          }`}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upload Your Push-Up Video
          </h3>
          <p className="text-gray-600 mb-6">
            Drag and drop a video file here, or click to browse
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: MP4, WebM, MOV (max 100MB)
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative bg-black rounded-xl overflow-hidden"
          ref={containerRef}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoSrc}
            onLoadedMetadata={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            className="w-full h-auto max-h-[600px]"
            playsInline
          />

          {/* Clear Button */}
          <button
            onClick={handleClearVideo}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            aria-label="Clear video"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Seek Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Reset to start"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Playback Rate */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white">Speed:</span>
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      playbackRate === rate
                        ? 'bg-sky-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
