import React, { useState } from 'react';
import { Challenge } from '../types/myChallenge.type';
import { AIRepCounter, AIAnalysisResult } from './AIRepCounter';
import { X, PlayCircle } from 'lucide-react';

const baseURL = "http://localhost:8080/";

interface ChallengeDetailModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onComplete?: (challengeId: number, userChallengeId?: number, analysisData?: AIAnalysisResult) => Promise<void>;
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
  const [isUploading, setIsUploading] = useState(false);
  const [userChallengeId, setUserChallengeId] = useState<number | undefined>(undefined);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [latestAnalysisResult, setLatestAnalysisResult] = useState<AIAnalysisResult | null>(null);

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
    console.log('🟢 [ChallengeDetailModal] ========== FLOW 2: AI Counter in ChallengeDetailModal ==========');
    console.log('🟢 [ChallengeDetailModal] handleAnalysisComplete called:', {
      isProcessingComplete,
      challengeId: challenge.challengeId,
      correctReps: analysis.correctReps,
      targetReps: challenge.reps,
      targetSets: challenge.sets,
    });

    // ✅ LƯU KẾT QUẢ ANALYSIS ĐỂ HIỂN THỊ NGAY
    console.log('📊 [ChallengeDetailModal] ========== RECEIVED ANALYSIS RESULT ==========');
    console.log('📊 [ChallengeDetailModal] Full analysis data received:', JSON.stringify(analysis, null, 2));
    console.log('📊 [ChallengeDetailModal] Saving analysis result to state for display...');
    console.log('📊 [ChallengeDetailModal] Analysis keys:', Object.keys(analysis));
    console.log('📊 [ChallengeDetailModal] Analysis values:', {
      correctReps: analysis.correctReps,
      totalReps: analysis.totalReps,
      accuracy: analysis.accuracy,
      formScore: analysis.formScore,
      isPassed: analysis.isPassed,
      posture: analysis.posture,
      feedback: analysis.feedback,
    });
    setLatestAnalysisResult(analysis);
    console.log('✅ [ChallengeDetailModal] latestAnalysisResult state updated');

    // Prevent multiple calls
    if (isProcessingComplete) {
      console.warn('⚠️ [ChallengeDetailModal] Analysis complete already processing, skipping duplicate call');
      return;
    }

    console.log('🔄 [ChallengeDetailModal] Setting processing flags...');
    setIsProcessingComplete(true);
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

      console.log('✅ [ChallengeDetailModal] ========== ANALYSIS COMPLETE ==========');
      console.log('✅ [ChallengeDetailModal] Analysis Results:', {
        challengeName: challenge.challengeName,
        challengeId: challenge.challengeId,
        targetReps: challenge.reps,
        targetSets: challenge.sets,
        targetTotalReps: targetTotalReps,
        correctReps: analysis.correctReps,
        totalReps: analysis.totalReps,
        isPassed: isPassed,
        accuracy: analysis.accuracy ? (analysis.accuracy * 100).toFixed(1) + '%' : 'N/A',
        formScore: analysis.formScore ? (analysis.formScore * 100).toFixed(1) + '%' : 'N/A',
        posture: analysis.posture || 'N/A',
        feedback: analysis.feedback || 'N/A',
        requirement: `correctReps (${analysis.correctReps}) >= targetTotalReps (${targetTotalReps})`,
      });

      // 📊 LOG TOÀN BỘ DỮ LIỆU ANALYSIS ĐỂ LƯU VÀO DAILY LOG
      const dailyLogPayload = {
        challengeId: challenge.challengeId,
        challengeName: challenge.challengeName,
        trainingPlanId: trainingPlanId,
        repsCompleted: analysis.correctReps || analysis.totalReps || 0,
        setsCompleted: challenge.sets || 1,
        score: analysis.formScore ? Math.round(analysis.formScore * 100) : (analysis.accuracy ? Math.round(analysis.accuracy * 100) : 0),
        confidence: analysis.confidence || 0,
        accuracy: analysis.accuracy || 0,
        formScore: analysis.formScore || 0,
        posture: analysis.posture || 'Unknown',
        feedback: analysis.feedback || '',
        processingTime: analysis.processingTime || 0,
        actualDurationMinutes: analysis.processingTime ? Math.round(analysis.processingTime / 1000 / 60) : undefined,
        status: isPassed ? 'completed' : 'in_progress',
      };

      console.log('📊 [ChallengeDetailModal] ========== DAILY LOG PAYLOAD ==========');
      console.log('📊 [ChallengeDetailModal] Data to save to DailyTrainingLog:', JSON.stringify(dailyLogPayload, null, 2));

      // Nếu phân tích thành công và đạt target, đánh dấu hoàn thành
      console.log('🔍 [ChallengeDetailModal] Checking completion conditions:', {
        isPassed,
        hasOnComplete: !!onComplete,
        onCompleteType: typeof onComplete,
      });
      
      if (isPassed && onComplete) {
        try {
          console.log('🎉 [ChallengeDetailModal] ========== CHALLENGE PASSED - SAVING TO DAILY LOG ==========');
          console.log('🎉 [ChallengeDetailModal] Challenge PASSED - Marking as COMPLETED:', {
            challengeId: challenge.challengeId,
            challengeName: challenge.challengeName,
            correctReps: analysis.correctReps,
            targetTotalReps: targetTotalReps,
            userChallengeId: analysis.userChallengeId,
            hasOnComplete: !!onComplete,
          });
          
          // Gọi onComplete để update UI và lưu vào BE (truyền analysis data với đầy đủ thông tin)
          console.log('📞 [ChallengeDetailModal] Calling onComplete with full analysis data:', {
            challengeId: challenge.challengeId,
            userChallengeId: analysis.userChallengeId,
            hasAnalysisData: !!analysis,
            analysisKeys: analysis ? Object.keys(analysis) : [],
            dailyLogPayload,
          });
          
          // Truyền analysis data với đầy đủ thông tin để lưu vào daily log
          const enrichedAnalysis = {
            ...analysis,
            ...dailyLogPayload,
          };
          
          await onComplete(challenge.challengeId, analysis.userChallengeId, enrichedAnalysis);
          console.log('✅ [ChallengeDetailModal] onComplete returned successfully - Daily log should be saved');
        } catch (error) {
          console.error('❌ [ChallengeDetailModal] ========== ERROR SAVING TO DAILY LOG ==========');
          console.error('❌ [ChallengeDetailModal] Error in onComplete:', error);
          console.error('❌ [ChallengeDetailModal] Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          // Don't throw, just log - UI will show error if needed
        }
      } else {
        if (!isPassed) {
          console.log('⚠️ [ChallengeDetailModal] Challenge not passed yet - NOT saving to daily log:', {
            challengeId: challenge.challengeId,
            correctReps: analysis.correctReps,
            targetTotalReps: targetTotalReps,
            needed: targetTotalReps - analysis.correctReps,
          });
        }
        if (!onComplete) {
          console.error('❌ [ChallengeDetailModal] onComplete callback is NOT provided! Cannot complete challenge and save to daily log.');
        }
      }
    } catch (error) {
      console.error('❌ [ChallengeDetailModal] Analysis complete handler failed:', error);
    } finally {
      console.log('🏁 [ChallengeDetailModal] Finally block - resetting flags...');
      setIsUploading(false);
      // Reset flag after a delay to allow for potential retries if needed
      setTimeout(() => {
        console.log('🔄 [ChallengeDetailModal] Resetting isProcessingComplete flag');
        setIsProcessingComplete(false);
      }, 2000);
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

        {/* Content - Gộp Challenge Info và AI Rep Counter */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Challenge Info Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Challenge Information</h3>
              
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
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
                </div>
              )}

              {/* Guidance Video */}
              {challenge.videoUrl && challenge.videoUrl.trim() !== '' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                    Guidance Video
                  </h4>
                  <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    <video
                      src={challenge.videoUrl.startsWith('http') ? challenge.videoUrl : `${baseURL}${challenge.videoUrl}`}
                      controls
                      className="w-full h-full"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* AI Analysis Results - Hiển thị kết quả mới nhất hoặc từ challenge */}
              {(() => {
                const hasResult = !!(latestAnalysisResult || challenge.aiAnalysis);
                console.log('🔍 [ChallengeDetailModal] ========== RENDERING AI ANALYSIS RESULTS ==========');
                console.log('🔍 [ChallengeDetailModal] latestAnalysisResult:', latestAnalysisResult);
                console.log('🔍 [ChallengeDetailModal] challenge.aiAnalysis:', challenge.aiAnalysis);
                console.log('🔍 [ChallengeDetailModal] Will render results:', hasResult);
                if (hasResult) {
                  const analysis = latestAnalysisResult || challenge.aiAnalysis;
                  console.log('🔍 [ChallengeDetailModal] Rendering with analysis:', JSON.stringify(analysis, null, 2));
                }
                return null;
              })()}
              {(latestAnalysisResult || challenge.aiAnalysis) && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✓</span> AI Analysis Results
                    {latestAnalysisResult && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Latest</span>
                    )}
                  </h4>
                  {(() => {
                    const analysis = latestAnalysisResult || challenge.aiAnalysis;
                    if (!analysis) return null;
                    
                    return (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Accuracy</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              {typeof analysis.accuracy === 'number' 
                                ? (analysis.accuracy * 100).toFixed(0) 
                                : analysis.accuracy}%
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Correct Reps</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              {analysis.correctReps}/{analysis.totalReps || analysis.correctReps}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Form Score</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">
                              {typeof analysis.formScore === 'number' 
                                ? (analysis.formScore * 100).toFixed(0) 
                                : analysis.formScore || 'N/A'}%
                            </p>
                          </div>
                          <div className={`bg-white rounded-lg p-3 ${analysis.isPassed ? 'border-2 border-green-500' : 'border-2 border-yellow-500'}`}>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
                            <p className={`text-xl font-bold mt-1 ${analysis.isPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                              {analysis.isPassed ? '✓ Passed' : '⚠ Incomplete'}
                            </p>
                          </div>
                        </div>
                        <div className="mb-3 bg-white rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Posture</p>
                          <p className="font-semibold text-gray-900">{analysis.posture || 'N/A'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Feedback</p>
                          <p className="text-gray-900">{analysis.feedback || 'No feedback available'}</p>
                        </div>
                        {analysis.confidence && (
                          <div className="mt-3 bg-white rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Confidence</p>
                            <p className="text-gray-900">
                              {typeof analysis.confidence === 'number' 
                                ? (analysis.confidence * 100).toFixed(0) 
                                : analysis.confidence}%
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* AI Rep Counter Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">AI Rep Counter</h3>
              <AIRepCounter
                targetReps={challenge.reps}
                targetSets={challenge.sets}
                challengeName={challenge.challengeName}
                challengeId={challenge.challengeId}
                trainingPlanId={trainingPlanId || 0}
                exerciseType={challenge.exerciseType}
                initialVideoUrl={challenge.videoUrl} // ✅ ĐỒNG BỘ: Load video từ challenge
                onAnalysisComplete={handleAnalysisComplete}
                isLoading={isUploading || isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
