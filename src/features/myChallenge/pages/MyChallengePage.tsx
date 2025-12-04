import React, { useState } from 'react';
import { MyTrainingPlans } from '../components/MyTrainingPlans';
import { TrainingPlanDetailPage } from './TrainingPlanDetailPage';
import { UserCurrentTrainingPlan } from '../types/myChallenge.type';
import { useAuth } from '@/context/AuthContext';

export const MyChallengePage: React.FC = () => {
  
  const { user, isLoading, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<UserCurrentTrainingPlan | null>(null);

  // Loading state
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Not login
  if (!isAuthenticated || !user) {
    return <p>Please login to see your challenge.</p>;
  }

  const userName = user.fullName;
  const userAvatar =
    user.linkImage ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=MyFit";

  const handleBackToPlans = () => {
    setSelectedPlan(null);
  };

  if (selectedPlan) {
    console.log('Navigating to training plan detail:');
    console.log('  selectedPlan:', selectedPlan);
    console.log('  trainingPlanId:', selectedPlan.trainingPlanId || selectedPlan.id);
    
    return (
      <TrainingPlanDetailPage
        trainingPlanId={selectedPlan.trainingPlanId || selectedPlan.id}
        userName={userName}
        userAvatar={userAvatar}
        onBack={handleBackToPlans}
      />
    );
  }

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">

            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full"
            />

            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Challenge</h1>
              <p className="text-gray-600">Welcome back, {userName}</p>
            </div>
          </div>

          <p className="text-gray-600">
            Track your training plans and complete daily challenges with AI-powered feedback.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Active Plans</p>
            <p className="text-3xl font-bold text-gray-900">3</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Challenges Completed</p>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Current Streak</p>
            <p className="text-3xl font-bold text-green-600">15 days</p>
          </div>
        </div>

        {/* Training Plans List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Training Plans
          </h2>

          <MyTrainingPlans
            onSelectPlan={(plan: UserCurrentTrainingPlan) => setSelectedPlan(plan)}
            selectedPlanId={undefined}
          />

        </div>
      </div>
    </main>
  );
};
