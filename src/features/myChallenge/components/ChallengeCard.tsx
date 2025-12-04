import React from 'react';
import { Challenge } from '../types/myChallenge.type';
import { Play, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onStartClick: (challenge: Challenge) => void;
  onUploadClick: (challenge: Challenge) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onStartClick,
  onUploadClick,
}) => {
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
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'ACTIVE':
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      case 'INACTIVE':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'completed':
        return '✓ Completed';
      case 'ACTIVE':
      case 'in_progress':
        return '⏳ In Progress';
      case 'INACTIVE':
        return 'Not Started';
      default:
        return 'Not Started';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
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

  return (
    <div className={`border rounded-lg p-5 shadow-sm hover:shadow-md transition-all ${getStatusColor(challenge.status)}`}>
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
          <p className="text-xl font-bold text-gray-900">{challenge.reps}</p>
        </div>
        <div className={`rounded-lg p-3 text-center ${getDifficultyColor(challenge.difficulty)}`}>
          <p className="text-xs font-semibold uppercase mb-1">Difficulty</p>
          <p className="text-sm font-bold">{challenge.difficulty}</p>
        </div>
        {challenge.aiAnalysis && (
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Accuracy</p>
            <p className="text-lg font-bold text-green-600">{challenge.aiAnalysis.accuracy}%</p>
          </div>
        )}
      </div>

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
      <div className="flex gap-2">
        {challenge.status !== 'COMPLETED' && challenge.status !== 'completed' && (
          <button
            onClick={() => onStartClick(challenge)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        )}
        <button
          onClick={() => onUploadClick(challenge)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {challenge.videoUrl && challenge.videoUrl.trim() !== '' ? 'Re-upload' : 'Upload'}
        </button>
      </div>
    </div>
  );
};
