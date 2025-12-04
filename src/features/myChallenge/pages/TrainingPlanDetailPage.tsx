import React, { useState, useEffect } from 'react';
import { getTrainingPlanDetail, submitChallengeVideo, updateChallengeStatus } from '../api/myChallengeService';
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
}

export const TrainingPlanDetailPage: React.FC<TrainingPlanDetailPageProps> = ({
  trainingPlanId,
  userName,
  userAvatar,
  onBack,
}) => {
  const [plan, setPlan] = useState<TrainingPlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadTrainingPlan();
  }, [trainingPlanId]);

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
      console.log('Submitting Video:');
      console.log('  Plan ID:', plan.id);
      console.log('  Challenge ID:', selectedChallenge.challengeId);
      console.log('  File:', file.name);
      
      const result = await submitChallengeVideo(
        typeof plan.id === 'string' ? parseInt(plan.id) : plan.id,
        selectedChallenge.challengeId,
        file
      ) as any;
      
      // Update challenge with AI analysis results
      const updatedPlan = { ...plan };
      updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day) => ({
        ...day,
        challenges: day.challenges.map((ch) =>
          ch.id === selectedChallenge.id
            ? {
                ...ch,
                status: 'COMPLETED' as const,
                aiAnalysis: result.aiAnalysis,
              }
            : ch
        ),
      }));
      setPlan(updatedPlan);

      // Close modal
      setIsModalOpen(false);
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    <main className="p-8 bg-gray-50 min-h-screen">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2"
      >
        ← Back
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentDayData.dayName}</h2>
              <div className="space-y-4">
                {currentDayData.challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onStartClick={handleChallengeStart}
                    onUploadClick={handleChallengeUpload}
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
          isLoading={isUploading}
          trainingPlanId={trainingPlanId}
        />
      )}
    </main>
  );
};
