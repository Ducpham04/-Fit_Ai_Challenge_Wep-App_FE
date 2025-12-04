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

  return (
  <div className="p-4 space-y-4">
    {plans.map((plan) => (
      <div
        key={plan.id}
        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
        onClick={() => {
          console.log('Selected Plan:', plan);
          console.log('Plan trainingPlanId:', plan.trainingPlanId);
          onSelectPlan(plan);
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900">{plan.planName}</h3>
            <p className="text-xs text-gray-500">ID: {plan.trainingPlanId}</p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {plan.status}
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 my-3">
          <div>
            <p className="text-xs text-gray-600">Start</p>
            <p className="font-semibold text-gray-900">
              {new Date(plan.startDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">End</p>
            <p className="font-semibold text-gray-900">
              {new Date(plan.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-bold text-gray-900">
              {plan.progressPercentage}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all"
              style={{ width: `${plan.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);


};
