import React, { useState, useRef } from 'react';
import { Challenge } from '../types/myChallenge.type';
import { Play, RotateCcw, CheckCircle, AlertCircle, Upload, Loader } from 'lucide-react';
import { AIAnalysisResult } from './AIRepCounter';

interface ChallengeCardProps {
  challenge: Challenge;
  onStartClick: (challenge: Challenge) => void;
  onUploadClick: (challenge: Challenge) => void;
  trainingPlanId?: number | string;
  onAnalysisComplete?: (challenge: Challenge, analysis: AIAnalysisResult) => void;
  onVideoUpload?: (challenge: Challenge, file: File) => Promise<void>; // ✅ Tự động analyze khi upload
}
const url = "localhost://8080/"
export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onStartClick,
  onUploadClick,
  trainingPlanId,
  onAnalysisComplete,
  onVideoUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  console.log("In ra :", challenge.videoUrl)
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ACTIVE':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 border-green-200';
      case 'ACTIVE':
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      case 'INACTIVE':
      case 'not_started':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '✓ Completed';
      case 'ACTIVE':
      case 'in_progress':
        return '⏳ In Progress';
      case 'INACTIVE':
      case 'not_started':
        return 'Not Started';
      default:
        return 'Not Started';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('🔵 [ChallengeCard] File selected:', file.name);
    
    // Validate video file
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      alert('Video file too large (max 100MB)');
      return;
    }
    
    // ✅ Tự động analyze khi upload
    if (onVideoUpload) {
      setIsAnalyzing(true);
      try {
        await onVideoUpload(challenge, file);
        console.log('✅ [ChallengeCard] Video analyzed successfully');
      } catch (error) {
        console.error('❌ [ChallengeCard] Error analyzing video:', error);
        alert('Failed to analyze video. Please try again.');
      } finally {
        setIsAnalyzing(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
      // Fallback: Mở modal upload
      onUploadClick(challenge);
    }
  };

  return (
    <div className={`border-2 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 ${getStatusColor(challenge.status)} hover:scale-[1.02]`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900">{challenge.challengeName}</h3>
            {getStatusIcon(challenge.status)}
          </div>
          {challenge.title && challenge.title !== challenge.challengeName && (
            <p className="text-sm text-gray-600 mb-2">{challenge.title}</p>
          )}
          {challenge.description && (
            <p className="text-sm text-gray-700">{challenge.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getStatusBadgeColor(challenge.status)}`}>
          {getStatusLabel(challenge.status)}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Sets</p>
          <p className="text-xl font-bold text-gray-900">{challenge.sets}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Reps</p>
          {challenge.customReps && challenge.customReps !== challenge.defaultReps ? (
            <div>
              <p className="text-lg font-bold text-blue-600">{challenge.customReps}</p>
              <p className="text-xs text-gray-500 line-through">{challenge.defaultReps || challenge.reps}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">Personalized</p>
            </div>
          ) : (
            <p className="text-xl font-bold text-gray-900">{challenge.reps}</p>
          )}
        </div>
        <div className={`rounded-lg p-3 text-center ${getDifficultyColor(challenge.difficulty)}`}>
          <p className="text-xs font-semibold uppercase mb-1">Difficulty</p>
          <p className="text-sm font-bold">{challenge.difficulty}</p>
        </div>
        {challenge.aiAnalysis ? (
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Accuracy</p>
            <p className="text-lg font-bold text-green-600">{challenge.aiAnalysis.accuracy}%</p>
          </div>
        ) : challenge.intensityLevel ? (
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Intensity</p>
            <p className="text-lg font-bold text-purple-600">{challenge.intensityLevel}/10</p>
          </div>
        ) : null}
      </div>

      {/* Personalized Info */}
      {(challenge.customReps || challenge.exerciseVariant) && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">✨ Personalized for You</p>
          {challenge.customReps && challenge.customReps !== challenge.defaultReps && (
            <p className="text-xs text-blue-800 mb-1">
              <span className="font-medium">Reps:</span> {challenge.defaultReps || challenge.reps} → {challenge.customReps} 
             <span
  className={
    challenge.customReps > (challenge.defaultReps || challenge.reps)
      ? "text-green-600 ml-1"
      : challenge.customReps < (challenge.defaultReps || challenge.reps)
      ? "text-red-600 ml-1"
      : "text-gray-600 ml-1"
  }
>
  {challenge.customReps > (challenge.defaultReps || challenge.reps) ? '+' : ''}
  {Math.round(
    ((challenge.customReps - (challenge.defaultReps || challenge.reps)) /
      (challenge.defaultReps || challenge.reps)) * 100
  )}%
</span>

            </p>
          )}
          {challenge.exerciseVariant && (
            <p className="text-xs text-blue-800">
              <span className="font-medium">Modified Exercise:</span> {challenge.exerciseVariant}
            </p>
          )}
        </div>
      )}

      {/* AI Analysis Result */}
      {challenge.aiAnalysis && (
        <div className="bg-white border-l-4 border-green-500 rounded p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Correct Reps</p>
              <p className="text-lg font-bold text-green-600">
                {challenge.aiAnalysis.correctReps}/{challenge.aiAnalysis.totalReps}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Posture</p>
              <p className="text-sm font-semibold text-gray-900">{challenge.aiAnalysis.posture}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💡 Feedback:</span> {challenge.aiAnalysis.feedback}
          </p>
        </div>
      )}

      {/* Guidance Video */}
      {challenge.videoUrl && challenge.videoUrl.trim() !== '' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <span className="text-sm font-semibold text-purple-900">📹 Guidance Video Available</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        {challenge.status !== 'COMPLETED' && (
          <button
            onClick={() => onStartClick(challenge)}
            style={{
              background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
              color: '#ffffff'
            }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-white rounded-lg hover:opacity-90 font-semibold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Play className="w-4 h-4" />
            Start Challenge
          </button>
        )}
        <label
          style={{
            background: isAnalyzing 
              ? 'linear-gradient(to right, #6b7280, #4b5563)'
              : 'linear-gradient(to right, #4b5563, #374151)',
            color: '#ffffff'
          }}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-white rounded-lg hover:opacity-90 font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {challenge.videoUrl && challenge.videoUrl.trim() !== '' ? 'Re-upload Video' : 'Upload & Analyze'}
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isAnalyzing}
          />
        </label>
      </div>
    </div>
  );
};
