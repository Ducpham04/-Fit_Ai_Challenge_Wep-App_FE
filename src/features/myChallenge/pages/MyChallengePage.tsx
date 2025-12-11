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

  // Load stats from backend - MUST be called before any early returns (Rules of Hooks)
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

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-lime-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your challenges...</p>
        </div>
      </main>
    );
  }

  // Not login
  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-lime-50/50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your challenges.</p>
        </div>
      </main>
    );
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
    console.log('  trainingPlanId (template):', selectedPlan.trainingPlanId);
    console.log('  utId (UserTraining ID):', selectedPlan.id);
    
    // IMPORTANT: 
    // - trainingPlanId: ID của template plan (dùng để load plan details)
    // - utId: ID của UserTraining record (dùng để load personalized data)
    const templatePlanId = selectedPlan.trainingPlanId || selectedPlan.id;
    const userTrainingId = selectedPlan.id;
    
    return (
      <TrainingPlanDetailPage
        trainingPlanId={templatePlanId} // Template plan ID để load details
        userName={userName}
        userAvatar={userAvatar}
        onBack={handleBackToPlans}
        utId={userTrainingId} // UserTraining ID để load personalized data
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-lime-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={userAvatar}
                alt={userName}
                className="w-16 h-16 rounded-full border-4 border-white shadow-xl"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
            </div>
            <div className="flex-1">
              <h1 
                className="text-4xl font-bold mb-1"
                style={{
                  background: 'linear-gradient(to right, #0284c7, #65a30d)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                My Challenge
              </h1>
              <p className="text-lg text-gray-600">Welcome back, <span className="font-semibold text-gray-900">{userName}</span></p>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl">
            Track your training plans and complete daily challenges with AI-powered feedback.
          </p>
        </div>

        {/* Stats Overview - Improved Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Plans</p>
                {statsLoading ? (
                  <div className="h-10 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p 
                    className="text-4xl font-bold"
                    style={{
                      background: 'linear-gradient(to right, #0284c7, #2563eb)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {stats.activePlans}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Challenges Completed</p>
                {statsLoading ? (
                  <div className="h-10 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p 
                    className="text-4xl font-bold"
                    style={{
                      background: 'linear-gradient(to right, #16a34a, #65a30d)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {stats.completedChallenges}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-lime-100 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Streak</p>
                {statsLoading ? (
                  <div className="h-10 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <p 
                      className="text-4xl font-bold"
                      style={{
                        background: 'linear-gradient(to right, #9333ea, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {stats.currentStreak}
                    </p>
                    <p className="text-sm text-gray-500">days</p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Training Plans List - Improved Layout */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 
                className="text-3xl font-bold"
                style={{
                  background: 'linear-gradient(to right, #0284c7, #65a30d)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Your Training Plans
              </h2>
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
