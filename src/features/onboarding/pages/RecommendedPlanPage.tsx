import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { TrainingAPI } from '@/api/training.api';
import { CheckCircle, ArrowRight, Sparkles, TrendingUp, Clock, Target } from 'lucide-react';

interface RecommendedPlanPageProps {
  bodyInfo?: any;
  bmi?: number;
  bodyType?: string;
  workoutFrequency?: number;
  goalId?: number;
}

export const RecommendedPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as RecommendedPlanPageProps;

  const [recommendedPlans, setRecommendedPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    loadRecommendedPlans();
  }, []);

  const loadRecommendedPlans = async () => {
    try {
      setLoading(true);
      // Get training plans filtered by goal
      const res = await TrainingAPI.getTrainingPlans({
        goalId: state?.goalId,
        page: 0,
        limit: 10,
      });

      // Filter by difficulty based on body type and workout frequency
      let difficultyFilter = 'Beginner';
      if (state?.bodyType === 'Normal' && (state?.workoutFrequency || 0) >= 4) {
        difficultyFilter = 'Intermediate';
      } else if (state?.bodyType === 'Normal' && (state?.workoutFrequency || 0) >= 5) {
        difficultyFilter = 'Advanced';
      }

      const plans = res.content || [];
      const filtered = plans.filter((plan: any) => 
        plan.difficulty === difficultyFilter || 
        plan.difficulty === 'Beginner' ||
        !plan.difficulty
      );

      setRecommendedPlans(filtered.slice(0, 3)); // Top 3 recommendations
      
      if (filtered.length > 0) {
        setSelectedPlan(filtered[0]);
      }
    } catch (error) {
      console.error('Error loading recommended plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = async () => {
    if (!selectedPlan || !user) {
      alert('Please login to start a training plan');
      return;
    }

    try {
      // Start the training plan (userId comes from JWT)
      const response = await TrainingAPI.startTrainingPlan(
        selectedPlan.id.toString(),
        new Date().toISOString().split('T')[0]
      );

      if (response.data?.success) {
        // Navigate to My Challenge page
        navigate('/my-challenge');
      } else {
        alert(response.data?.message || 'Failed to start training plan');
      }
    } catch (error: any) {
      console.error('Error starting plan:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to start training plan. Please try again.';
      alert(errorMsg);
    }
  };

  const getBodyTypeColor = (bodyType?: string) => {
    switch (bodyType) {
      case 'Underweight':
        return 'text-yellow-600 bg-yellow-50';
      case 'Normal':
        return 'text-green-600 bg-green-50';
      case 'Overweight':
        return 'text-orange-600 bg-orange-50';
      case 'Obese':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Personalized Training Plan
          </h1>
          <p className="text-gray-600 text-lg">
            Based on your body composition and fitness goals
          </p>
        </div>

        {/* Analysis Summary */}
        {state && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">BMI</p>
                <p className="text-2xl font-bold text-blue-600">{state.bmi?.toFixed(1)}</p>
              </div>
              <div className={`p-4 rounded-lg ${getBodyTypeColor(state.bodyType)}`}>
                <p className="text-sm text-gray-600 mb-1">Body Type</p>
                <p className="text-xl font-bold">{state.bodyType}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Workout Frequency</p>
                <p className="text-2xl font-bold text-purple-600">{state.workoutFrequency} days/week</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Training Plans</h2>
          
          {recommendedPlans.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No training plans available at the moment.</p>
              <button
                onClick={() => navigate('/my-challenge')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Go to My Challenge
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendedPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all border-2 ${
                    selectedPlan?.id === plan.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{plan.name || plan.title}</h3>
                        {selectedPlan?.id === plan.id && (
                          <CheckCircle className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4" />
                          <span className="font-medium">{plan.difficulty || 'Beginner'}</span>
                        </div>
                        {plan.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{plan.duration} days</span>
                          </div>
                        )}
                        {plan.exercises && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>{plan.exercises.length} exercises</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        {selectedPlan && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-blue-100 mb-6">
              Begin with the recommended plan and track your progress daily
            </p>
            <button
              onClick={handleStartPlan}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all flex items-center gap-2 mx-auto"
            >
              Start Training Now
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/my-challenge')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Skip for now, I'll choose later
          </button>
        </div>
      </div>
    </div>
  );
};

