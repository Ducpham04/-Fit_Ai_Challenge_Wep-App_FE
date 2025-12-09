import React from 'react';
import { Challenge } from '../types/myChallenge.type';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
import { AIAnalysisResult } from './AIRepCounter';

interface ChallengeCardProps {
  challenge: Challenge;
  onStartClick: (challenge: Challenge) => void;
  trainingPlanId?: number | string;
  onAnalysisComplete?: (challenge: Challenge, analysis: AIAnalysisResult) => void;
  isExpanded?: boolean;
  expandedContent?: React.ReactNode;
}
export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onStartClick,
  trainingPlanId,
  onAnalysisComplete,
  isExpanded = false,
  expandedContent,
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
        return '!bg-green-50 !border-green-200';
      case 'ACTIVE':
      case 'in_progress':
        return '!bg-blue-50 !border-blue-200';
      case 'INACTIVE':
      case 'not_started':
        return '!bg-gray-50 !border-gray-200';
      default:
        return '!bg-gray-50 !border-gray-200';
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
        return '!bg-green-100 !text-green-800';
      case 'ACTIVE':
      case 'in_progress':
        return '!bg-blue-100 !text-blue-800';
      case 'INACTIVE':
      case 'not_started':
        return '!bg-gray-100 !text-gray-800';
      default:
        return '!bg-gray-100 !text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '!bg-green-100 !text-green-800';
      case 'MEDIUM':
        return '!bg-yellow-100 !text-yellow-800';
      case 'HARD':
        return '!bg-red-100 !text-red-800';
      default:
        return '!bg-gray-100 !text-gray-800';
    }
  };


  return (
    <div className={`border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${getStatusColor(challenge.status)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-base text-gray-900 truncate">{challenge.challengeName}</h3>
            {getStatusIcon(challenge.status)}
          </div>
          {challenge.title && challenge.title !== challenge.challengeName && (
            <p className="text-xs text-gray-500 mb-1 truncate">{challenge.title}</p>
          )}
          {challenge.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{challenge.description}</p>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ml-3 flex-shrink-0 ${getStatusBadgeColor(challenge.status)}`}>
          {getStatusLabel(challenge.status)}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="bg-white rounded-md p-2.5 text-center">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Sets</p>
          <p className="text-lg font-bold text-gray-900">{challenge.sets}</p>
        </div>
        <div className="bg-white rounded-md p-2.5 text-center">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Reps</p>
          {challenge.customReps && challenge.customReps !== challenge.defaultReps ? (
            <div>
              <p className="text-base font-bold text-blue-600">{challenge.customReps}</p>
              <p className="text-[10px] text-gray-400 line-through">{challenge.defaultReps || challenge.reps}</p>
            </div>
          ) : (
            <p className="text-lg font-bold text-gray-900">{challenge.reps}</p>
          )}
        </div>
        <div className={`rounded-md p-2.5 text-center ${getDifficultyColor(challenge.difficulty)}`}>
          <p className="text-[10px] font-medium uppercase tracking-wide mb-0.5">Level</p>
          <p className="text-xs font-bold">{challenge.difficulty}</p>
        </div>
        {challenge.aiAnalysis ? (
          <div className="bg-white rounded-md p-2.5 text-center">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Score</p>
            <p className="text-base font-bold text-green-600">{challenge.aiAnalysis.accuracy}%</p>
          </div>
        ) : challenge.intensityLevel ? (
          <div className="bg-white rounded-md p-2.5 text-center">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Intensity</p>
            <p className="text-base font-bold text-purple-600">{challenge.intensityLevel}/10</p>
          </div>
        ) : (
          <div className="bg-white rounded-md p-2.5 text-center">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Status</p>
            <p className="text-xs font-bold text-gray-400">-</p>
          </div>
        )}
      </div>

      {/* Personalized Info */}
      {(challenge.customReps || challenge.exerciseVariant) && (
        <div className="!bg-blue-50/50 !border-l-2 !border-blue-400 rounded-md p-2.5 mb-3">
          <p className="text-xs font-semibold !text-blue-800 mb-1.5 flex items-center gap-1">
            <span>✨</span> Personalized
          </p>
          {challenge.customReps && challenge.customReps !== challenge.defaultReps && (
            <p className="text-[11px] text-blue-700">
              <span className="font-medium">Reps:</span> {challenge.defaultReps || challenge.reps} → {challenge.customReps}
              <span className={`ml-1 ${
                challenge.customReps > (challenge.defaultReps || challenge.reps)
                  ? "text-green-600"
                  : challenge.customReps < (challenge.defaultReps || challenge.reps)
                  ? "text-red-600"
                  : "text-gray-600"
              }`}>
                {challenge.customReps > (challenge.defaultReps || challenge.reps) ? '+' : ''}
                {Math.round(
                  ((challenge.customReps - (challenge.defaultReps || challenge.reps)) /
                    (challenge.defaultReps || challenge.reps)) * 100
                )}%
              </span>
            </p>
          )}
          {challenge.exerciseVariant && (
            <p className="text-[11px] text-blue-700 mt-1">
              <span className="font-medium">Variant:</span> {challenge.exerciseVariant}
            </p>
          )}
        </div>
      )}

      {/* AI Analysis Result - Hiển thị sau khi quét xong */}
      {(challenge.aiAnalysis || (challenge.status === 'COMPLETED' && (challenge.repsCompleted !== undefined || challenge.score !== undefined))) && (
        <div className="!bg-gradient-to-r !from-green-50/80 !to-emerald-50/80 !border-l-2 !border-green-400 rounded-md p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle className="w-4 h-4 !text-green-600" />
            <h4 className="text-xs font-semibold !text-green-900">Analysis Results</h4>
          </div>
          {(() => {
            // ✅ FIX: Tạo aiAnalysis từ challenge data nếu chưa có
            const analysis = challenge.aiAnalysis || (challenge.status === 'COMPLETED' && (challenge.repsCompleted !== undefined || challenge.score !== undefined) ? {
              correctReps: challenge.repsCompleted || 0,
              totalReps: challenge.repsCompleted || challenge.reps || 0,
              accuracy: challenge.score || (challenge.confidence ? Math.round(challenge.confidence * 100) : 0),
              feedback: challenge.score && challenge.score >= 80 ? 'Excellent form and execution! Keep up the great work.' : 
                       challenge.score && challenge.score >= 60 ? 'Good effort! Focus on maintaining proper form throughout.' : 
                       'Keep practicing to improve your form and technique.',
              posture: challenge.score && challenge.score >= 80 ? 'Excellent' : 
                      challenge.score && challenge.score >= 60 ? 'Good' : 'Fair',
            } : null);
            
            if (!analysis) return null;
            
            return (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="!bg-white/80 rounded-md p-2">
                    <p className="text-[10px] text-gray-500 font-medium mb-0.5">Reps</p>
                    <p className="text-base font-bold !text-green-600">
                      {analysis.correctReps}/{analysis.totalReps}
                    </p>
                  </div>
                  <div className="!bg-white/80 rounded-md p-2">
                    <p className="text-[10px] text-gray-500 font-medium mb-0.5">Posture</p>
                    <p className="text-xs font-semibold text-gray-900">{analysis.posture}</p>
                  </div>
                </div>
                {analysis.accuracy !== undefined && (
                  <div className="!bg-white/80 rounded-md p-2 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-gray-500 font-medium">Score</p>
                      <p className="text-xs font-bold !text-green-600">{analysis.accuracy}%</p>
                    </div>
                    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden relative">
                      <div 
                        className="!bg-green-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ 
                          width: `${Math.max(0, Math.min(100, analysis.accuracy || 0))}%`,
                          minWidth: (analysis.accuracy || 0) > 0 ? '2px' : '0px'
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="!bg-white/80 rounded-md p-2">
                  <p className="text-[10px] text-gray-500 font-medium mb-1">Feedback</p>
                  <p className="text-xs text-gray-700 line-clamp-2">{analysis.feedback}</p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-3">
          <button
          onClick={() => onStartClick(challenge)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 !bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white rounded-lg hover:!from-blue-700 hover:!to-blue-800 font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Play className="w-4 h-4" />
          {isExpanded ? 'Collapse Details' : 'Start Challenge'}
        </button>
      </div>

      {/* Expanded Detail Content */}
      {isExpanded && expandedContent && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {expandedContent}
        </div>
      )}
    </div>
  );
};
