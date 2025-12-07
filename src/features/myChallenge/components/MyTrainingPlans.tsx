import React, { useState, useEffect } from 'react';
import { getCurrentTrainingPlans } from '../api/myChallengeService';
import { UserCurrentTrainingPlan } from '../types/myChallenge.type';
import { useAuth } from '@/context/AuthContext';
import { data } from 'react-router-dom';
interface MyTrainingPlansProps {
  onSelectPlan: (plan: UserCurrentTrainingPlan) => void;
  selectedPlanId?: number;
}

export const MyTrainingPlans: React.FC<MyTrainingPlansProps> = ({ onSelectPlan, selectedPlanId }) => {
  const [plans, setPlans] = useState<UserCurrentTrainingPlan[]>([]);
  
   const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      if(user){
        const res = await getCurrentTrainingPlans(user.id);
        
        setPlans(res);
        console.log('Training Plans Loaded:', res);
        res.forEach((plan, idx) => {
          console.log(`Plan ${idx}:`, {
            id: plan.id,
            trainingPlanId: plan.id,
            planName: plan.name,
          });
        });
      }
      
      
      
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
   
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">Loading training plans...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📋</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Training Plans Yet</h3>
        <p className="text-gray-600 mb-6">Start your fitness journey by selecting a training plan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
          onClick={() => {
            console.log('Selected Plan:', plan);
            console.log('Plan trainingPlanId:', plan.trainingPlanId);
            onSelectPlan(plan);
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {plan.planName || plan.name}
              </h3>
              <p className="text-xs text-gray-500">Plan #{plan.trainingPlanId || plan.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              plan.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : plan.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {plan.status || 'Active'}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 my-4 pb-4 border-b border-gray-200">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Start Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(plan.startDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">End Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(plan.endDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-lg font-bold text-blue-600">
                {plan.progressPercentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${plan.progressPercentage || 0}%` }}
              />
            </div>
          </div>

          {/* View Details Hint */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center group-hover:text-blue-600 transition-colors">
              Click to view details →
            </p>
          </div>
        </div>
      ))}
    </div>
  );


};
