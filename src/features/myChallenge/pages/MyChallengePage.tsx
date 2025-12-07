import React, { useState, useEffect } from 'react';
import { MyTrainingPlans } from '../components/MyTrainingPlans';
import { TrainingPlanDetailPage } from './TrainingPlanDetailPage';
import { UserCurrentTrainingPlan } from '../types/myChallenge.type';
import { useAuth } from '@/context/AuthContext';
import { getMyChallengeStats, MyChallengeStats } from '../api/myChallengeService';

export const MyChallengePage: React.FC = () => {
  
  const { user, isLoading, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<UserCurrentTrainingPlan | null>(null);
  const [stats, setStats] = useState<MyChallengeStats>({
    activePlans: 0,
    completedChallenges: 0,
    currentStreak: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

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

  // Load stats from backend
  useEffect(() => {
    if (!user?.id) return;

    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const statsData = await getMyChallengeStats(user.id.toString());
        setStats(statsData);
        console.log('My Challenge Stats loaded:', statsData);
      } catch (error) {
        console.error('Error loading My Challenge stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  const handleBackToPlans = () => {
    setSelectedPlan(null);
  };

  if (selectedPlan) {
    console.log('Navigating to training plan detail:');
    console.log('  selectedPlan:', selectedPlan);
    console.log('  trainingPlanId:', selectedPlan.trainingPlanId || selectedPlan.id);
    console.log('  utId:', selectedPlan.id); // utId is the UserTraining ID
    
    return (
      <TrainingPlanDetailPage
        trainingPlanId={selectedPlan.trainingPlanId || selectedPlan.id}
        userName={userName}
        userAvatar={userAvatar}
        onBack={handleBackToPlans}
        utId={selectedPlan.id} // Pass utId for personalized data
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={userAvatar}
                alt={userName}
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-1">My Challenge</h1>
              <p className="text-lg text-gray-600">Welcome back, <span className="font-semibold">{userName}</span></p>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl">
            Track your training plans and complete daily challenges with AI-powered feedback.
          </p>
        </div>

        {/* Stats Overview - Improved Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Plans</p>
                {statsLoading ? (
                  <div className="h-10 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-4xl font-bold text-gray-900">{stats.activePlans}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Challenges Completed</p>
                {statsLoading ? (
                  <div className="h-10 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-4xl font-bold text-green-600">{stats.completedChallenges}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Streak</p>
                {statsLoading ? (
                  <div className="h-10 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-purple-600">{stats.currentStreak}</p>
                    <p className="text-sm text-gray-500">days</p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Training Plans List - Improved Layout */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Training Plans</h2>
              <p className="text-gray-600 mt-1">Select a plan to view daily challenges</p>
            </div>
          </div>

          <MyTrainingPlans
            onSelectPlan={(plan: UserCurrentTrainingPlan) => setSelectedPlan(plan)}
            selectedPlanId={undefined}
          />
        </div>
      </div>
    </main>
  );
};
