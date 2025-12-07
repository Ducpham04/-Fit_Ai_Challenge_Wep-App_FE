import React, { useState } from 'react';
import { Challenge } from '../types/myChallenge.type';
import { AIRepCounter, AIAnalysisResult } from './AIRepCounter';
import { X, PlayCircle } from 'lucide-react';

interface ChallengeDetailModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onComplete?: (challengeId: number, userChallengeId?: number) => Promise<void>;
  isLoading?: boolean;
  trainingPlanId?: number | string;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onUpload,
  onComplete,
  isLoading = false,
  trainingPlanId,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'counter'>('info');
  const [isUploading, setIsUploading] = useState(false);
  const [userChallengeId, setUserChallengeId] = useState<number | undefined>(undefined);

  if (!isOpen) return null;

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
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAnalysisComplete = async (analysis: AIAnalysisResult & { userChallengeId?: number }) => {
    setIsUploading(true);
    try {
      // Lưu userChallengeId nếu có trong response
      if (analysis.userChallengeId) {
        setUserChallengeId(analysis.userChallengeId);
      }

      // Tính target total reps
      const targetTotalReps = challenge.reps * challenge.sets;
      
      // Kiểm tra lại: đạt yêu cầu nếu correctReps >= targetTotalReps
      const isPassed = analysis.correctReps >= targetTotalReps;

      console.log('✅ [MOCK] Analysis complete:', {
        challengeName: challenge.challengeName,
        targetReps: challenge.reps,
        targetSets: challenge.sets,
        targetTotalReps: targetTotalReps,
        correctReps: analysis.correctReps,
        isPassed: isPassed,
        accuracy: (analysis.accuracy * 100).toFixed(1) + '%',
        requirement: `correctReps (${analysis.correctReps}) >= targetTotalReps (${targetTotalReps})`,
      });

      // Nếu phân tích thành công và đạt target, đánh dấu hoàn thành
      if (isPassed && onComplete) {
        try {
          console.log('🎉 Challenge PASSED - Marking as COMPLETED:', {
            challengeId: challenge.challengeId,
            challengeName: challenge.challengeName,
            correctReps: analysis.correctReps,
            targetTotalReps: targetTotalReps,
            userChallengeId: analysis.userChallengeId,
          });
          
          // Gọi onComplete để update UI (không gọi API trong mock mode)
          await onComplete(challenge.challengeId, analysis.userChallengeId);
          
          console.log('✅ Challenge marked as COMPLETED successfully');
        } catch (error) {
          console.warn('⚠️ Could not mark challenge as completed:', error);
        }
      } else if (!isPassed) {
        console.log('⚠️ Challenge not passed yet:', {
          challengeId: challenge.challengeId,
          correctReps: analysis.correctReps,
          targetTotalReps: targetTotalReps,
          needed: targetTotalReps - analysis.correctReps,
        });
      }
    } catch (error) {
      console.error('Analysis complete handler failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{
          margin: 'auto',
          position: 'relative',
          zIndex: 1000
        }}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{challenge.challengeName}</h2>
            {challenge.title && challenge.title !== challenge.challengeName && (
              <p className="text-sm text-gray-500 mt-1">{challenge.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 bg-gray-50">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Challenge Info
          </button>
          <button
            onClick={() => setActiveTab('counter')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'counter'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Rep Counter
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {activeTab === 'info' ? (
            <div className="p-6 space-y-6">
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
                  <p className="text-xs font-semibold text-gray-600 uppercase">Challenge ID</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{challenge.challengeId}</p>
                </div>
              </div>

              {/* Status */}
              {challenge.status && (
                <div className={`rounded-lg p-4 ${getStatusColor(challenge.status)}`}>
                  <p className="text-sm font-semibold">Status: {challenge.status}</p>
                </div>
              )}

              {/* Description */}
              {challenge.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
                </div>
              )}

              {/* Guidance Video */}
              {challenge.videoUrl && challenge.videoUrl.trim() !== '' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                    Guidance Video
                  </h3>
                  <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    <video
                      src=  { challenge.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* AI Analysis Results */}
              {challenge.aiAnalysis && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✓</span> AI Analysis Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Accuracy</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{challenge.aiAnalysis.accuracy}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Correct Reps</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {challenge.aiAnalysis.correctReps}/{challenge.aiAnalysis.totalReps}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3 bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Posture</p>
                    <p className="font-semibold text-gray-900">{challenge.aiAnalysis.posture}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Feedback</p>
                    <p className="text-gray-900">{challenge.aiAnalysis.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <AIRepCounter
                targetReps={challenge.reps}
                targetSets={challenge.sets}
                challengeName={challenge.challengeName}
                challengeId={challenge.challengeId}
                trainingPlanId={trainingPlanId || 0}
                onAnalysisComplete={handleAnalysisComplete}
                isLoading={isUploading || isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
