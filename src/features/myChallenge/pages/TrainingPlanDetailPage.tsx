import React, { useState, useEffect } from 'react';
import { getTrainingPlanDetail, submitChallengeVideo, updateChallengeStatus, getPersonalizedDayDetails } from '../api/myChallengeService';
import { TrainingPlanDetail, Challenge } from '../types/myChallenge.type';
import { TrainingPlanHeader } from '../components/TrainingPlanHeader';
import { DayTabs } from '../components/DayTabs';
import { ChallengeCard } from '../components/ChallengeCard';
import { ChallengeDetailModal } from '../components/ChallengeDetailModal';

interface TrainingPlanDetailPageProps {
  trainingPlanId: string | number;
  userName: string;
  userAvatar?: string;
  onBack: () => void;
  utId?: number; // UserTraining ID for personalized data
}

export const TrainingPlanDetailPage: React.FC<TrainingPlanDetailPageProps> = ({
  trainingPlanId,
  userName,
  userAvatar,
  onBack,
  utId,
}) => {
  const [plan, setPlan] = useState<TrainingPlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [personalizedData, setPersonalizedData] = useState<Map<number, any>>(new Map());

  useEffect(() => {
    loadTrainingPlan();
  }, [trainingPlanId]);

  // Load personalized data when day changes
  useEffect(() => {
    if (plan && utId) {
      loadPersonalizedData(utId, selectedDay);
    }
  }, [plan, utId, selectedDay]);

  const loadTrainingPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading Training Plan:');
      console.log('  trainingPlanId (raw):', trainingPlanId);
      console.log('  type:', typeof trainingPlanId);
      
      // Ensure trainingPlanId is a number
      const numId = typeof trainingPlanId === 'string' ? parseInt(trainingPlanId, 10) : trainingPlanId;
      console.log('  numId:', numId);
      console.log('  Number(trainingPlanId):', Number(trainingPlanId));
      
      if (isNaN(numId)) {
        throw new Error(`Invalid trainingPlanId: ${trainingPlanId}`);
      }
      
      const data = await getTrainingPlanDetail(numId);
      setPlan(data);
      setSelectedDay(1);
    } catch (err) {
      console.error('Error loading training plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load training plan');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPersonalizedData = async (utId: number, dayNumber: number) => {
    try {
      const personalizedDetails = await getPersonalizedDayDetails(utId, dayNumber);
      
      // Create a map: tpdId -> personalized data
      const personalizedMap = new Map();
      personalizedDetails.forEach((detail: any) => {
        personalizedMap.set(detail.tpdId, detail);
      });
      
      setPersonalizedData(personalizedMap);
      
      // Update plan with personalized data
      if (plan) {
        const updatedPlan = JSON.parse(JSON.stringify(plan));
        updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day: any) => ({
          ...day,
          challenges: day.challenges.map((ch: Challenge) => {
            const personalized = personalizedMap.get(ch.id);
            if (personalized) {
              return {
                ...ch,
                defaultReps: personalized.defaultReps,
                customReps: personalized.customReps,
                defaultDuration: personalized.defaultDuration,
                customTime: personalized.customTime,
                exerciseVariant: personalized.exerciseVariant,
                intensityLevel: personalized.intensityLevel,
                // Use personalized reps if available, otherwise use default
                reps: personalized.customReps || ch.reps,
              };
            }
            return ch;
          }),
        }));
        setPlan(updatedPlan);
      }
    } catch (err) {
      console.error('Error loading personalized data:', err);
      // Don't show error to user, just use default values
    }
  };


  const handleChallengeStart = (challenge: Challenge) => {
    console.log('Challenge Selected:', challenge);
    console.log('Challenge ID:', challenge.id);
    console.log('Challenge ID (goalId):', challenge.challengeId);
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const handleChallengeUpload = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const handleVideoUpload = async (file: File) => {
    if (!plan || !selectedChallenge) return;

    try {
      setIsUploading(true);
      console.log('📤 [MOCK] Video upload (no backend API call):');
      console.log('  Plan ID:', plan.id);
      console.log('  Challenge ID:', selectedChallenge.challengeId);
      console.log('  File:', file.name);
      
      // ⚠️ MOCK MODE: Không gọi API, chỉ update UI
      // const result = await submitChallengeVideo(...); // Commented out
      
      // Mock AI analysis result
      const mockAnalysis = {
        correctReps: selectedChallenge.reps * selectedChallenge.sets,
        totalReps: selectedChallenge.reps * selectedChallenge.sets + 2,
        accuracy: 0.92,
        feedback: 'Excellent form! Keep your back straight and maintain consistent pace.',
        posture: 'Excellent',
      };
      
      // Update challenge with AI analysis results (local state only)
      const updatedPlan = { ...plan };
      updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day) => ({
        ...day,
        challenges: day.challenges.map((ch) =>
          ch.id === selectedChallenge.id
            ? {
                ...ch,
                status: 'COMPLETED' as const,
                aiAnalysis: mockAnalysis,
              }
            : ch
        ),
      }));
      setPlan(updatedPlan);

      // Recalculate progress
      const completedCount = updatedPlan.dayChallenges.reduce(
        (sum, day) => sum + day.challenges.filter(c => c.status === 'COMPLETED').length,
        0
      );
      const totalChallenges = updatedPlan.dayChallenges.reduce(
        (sum, day) => sum + day.challenges.length,
        0
      );
      updatedPlan.progressPercentage = Math.round((completedCount / totalChallenges) * 100);
      setPlan(updatedPlan);

      console.log('✅ [MOCK] Challenge updated locally:', {
        challengeId: selectedChallenge.challengeId,
        status: 'COMPLETED',
        progress: updatedPlan.progressPercentage + '%',
      });

      // Close modal
      setIsModalOpen(false);
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Error in video upload handler:', error);
      setError('Failed to process video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId: number, userChallengeId?: number) => {
    // ⚠️ MOCK MODE: Không gọi API, chỉ update UI
    try {
      console.log('🎯 [MOCK] Would mark challenge as completed:', {
        challengeId,
        userChallengeId,
      });

      // Update challenge status locally (không gọi API)
      if (plan && selectedChallenge) {
        const updatedPlan = { ...plan };
        updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day) => ({
          ...day,
          challenges: day.challenges.map((ch) =>
            ch.id === selectedChallenge.id
              ? {
                  ...ch,
                  status: 'COMPLETED' as const,
                }
              : ch
          ),
        }));

        // Recalculate progress
        const completedCount = updatedPlan.dayChallenges.reduce(
          (sum, day) => sum + day.challenges.filter(c => c.status === 'COMPLETED').length,
          0
        );
        const totalChallenges = updatedPlan.dayChallenges.reduce(
          (sum, day) => sum + day.challenges.length,
          0
        );
        updatedPlan.progressPercentage = Math.round((completedCount / totalChallenges) * 100);
        setPlan(updatedPlan);

        console.log('✅ [MOCK] Challenge marked as completed locally');
      }

      // ⚠️ Commented out: Real API call
      // const { completeChallenge } = await import('../api/myChallengeService');
      // await completeChallenge(userChallengeId);
      // await loadTrainingPlan();
    } catch (error) {
      console.error('❌ Error in complete challenge handler:', error);
      // Don't throw, just log
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2"
        >
          ← Back
        </button>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Loading training plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2"
        >
          ← Back
        </button>
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTrainingPlan}
            style={{
              background: '#2563eb',
              color: '#ffffff'
            }}
            className="px-4 py-2 rounded-lg hover:opacity-90 font-medium text-white transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2"
        >
          ← Back
        </button>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-red-600">Training plan not found</p>
        </div>
      </div>
    );
  }

  const currentDayData = plan.dayChallenges.find((d) => d.dayNumber === selectedDay);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
        ← Back to Plans
      </button>

      <TrainingPlanHeader
        planName={plan.planName}
        description={plan.description}
        difficulty={plan.difficulty}
        progressPercentage={plan.progressPercentage}
        daysCompleted={plan.dayChallenges.reduce(
          (count, day) =>
            count +
            day.challenges.filter((ch) => ch.status === 'COMPLETED').length,
          0
        )}
        totalDays={plan.dayChallenges.reduce(
          (count, day) => count + day.challenges.length,
          0
        )}
        userName={userName}
        userAvatar={userAvatar}
      />

      {plan.dayChallenges.length > 0 && (
        <>
          <DayTabs
            dayChallenges={plan.dayChallenges}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          {currentDayData && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{currentDayData.dayName}</h2>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {currentDayData.challenges.length} Challenge{currentDayData.challenges.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentDayData.challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onStartClick={handleChallengeStart}
                    onUploadClick={handleChallengeUpload}
                    trainingPlanId={trainingPlanId}
                    onAnalysisComplete={async (challenge, analysis) => {
                      // Update challenge with AI analysis results
                      if (!plan) return;
                      
                      const targetTotalReps = challenge.reps * challenge.sets;
                      
                      // Kiểm tra lại: đạt yêu cầu nếu correctReps >= targetTotalReps
                      const isPassed = analysis.correctReps >= targetTotalReps;
                      
                      console.log('🎯 Checking completion requirement:', {
                        challengeId: challenge.id,
                        challengeName: challenge.challengeName,
                        targetReps: challenge.reps,
                        targetSets: challenge.sets,
                        targetTotalReps: targetTotalReps,
                        correctReps: analysis.correctReps,
                        isPassed: isPassed,
                        willMarkAsCompleted: isPassed,
                      });
                      
                      // Tạo bản copy mới của plan để trigger re-render
                      const updatedPlan = JSON.parse(JSON.stringify(plan));
                      
                      // Update challenge trong tất cả days
                      updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day: any) => ({
                        ...day,
                        challenges: day.challenges.map((ch: any) => {
                          // So sánh bằng cả id và challengeId để đảm bảo tìm đúng
                          if (ch.id === challenge.id || ch.challengeId === challenge.challengeId) {
                            console.log('✅ Updating challenge:', {
                              oldStatus: ch.status,
                              newStatus: isPassed ? 'COMPLETED' : ch.status,
                              challengeId: ch.id,
                            });
                            
                            return {
                              ...ch,
                              // Tự động đánh dấu hoàn thành nếu đạt yêu cầu
                              status: isPassed ? 'COMPLETED' : ch.status,
                              aiAnalysis: {
                                correctReps: analysis.correctReps,
                                totalReps: analysis.totalReps,
                                accuracy: Math.round(analysis.accuracy * 100),
                                feedback: analysis.feedback,
                                posture: analysis.posture,
                              },
                            };
                          }
                          return ch;
                        }),
                      }));

                      // Recalculate progress
                      const completedCount = updatedPlan.dayChallenges.reduce(
                        (sum: number, day: any) => sum + day.challenges.filter((c: any) => c.status === 'COMPLETED').length,
                        0
                      );
                      const totalChallenges = updatedPlan.dayChallenges.reduce(
                        (sum: number, day: any) => sum + day.challenges.length,
                        0
                      );
                      updatedPlan.progressPercentage = Math.round((completedCount / totalChallenges) * 100);
                      
                      // Force update state
                      setPlan(updatedPlan);
                      
                      // Force re-render bằng cách trigger state update
                      setTimeout(() => {
                        setPlan((prevPlan) => {
                          if (!prevPlan) return prevPlan;
                          return { ...prevPlan };
                        });
                      }, 100);

                        if (isPassed) {
                          console.log('🎉 Challenge COMPLETED!', {
                            challengeId: challenge.challengeId,
                            challengeName: challenge.challengeName,
                            correctReps: analysis.correctReps,
                            targetTotalReps: targetTotalReps,
                            newStatus: 'COMPLETED',
                            progress: updatedPlan.progressPercentage + '%',
                          });
                        } else {
                          console.log('⚠️ Challenge not completed yet:', {
                            challengeId: challenge.challengeId,
                            correctReps: analysis.correctReps,
                            targetTotalReps: targetTotalReps,
                            needed: targetTotalReps - analysis.correctReps,
                            status: challenge.status,
                          });
                        }
                      }
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedChallenge(null);
          }}
          onUpload={handleVideoUpload}
          onComplete={handleCompleteChallenge}
          isLoading={isUploading}
          trainingPlanId={trainingPlanId}
        />
      )}
      </div>
    </main>
  );
};
