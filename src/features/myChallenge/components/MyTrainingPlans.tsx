import React, { useState, useEffect } from 'react';
import { getCurrentTrainingPlans, deleteUserTraining } from '../api/myChallengeService';
import { UserCurrentTrainingPlan } from '../types/myChallenge.type';
import { useAuth } from '@/context/AuthContext';
import { HealthProfileModal } from './HealthProfileModal';
import { Button } from '../../../components/ui/button';
import { Sparkles, Trash2, AlertCircle } from 'lucide-react';
interface MyTrainingPlansProps {
  onSelectPlan: (plan: UserCurrentTrainingPlan) => void;
  selectedPlanId?: number;
}

export const MyTrainingPlans: React.FC<MyTrainingPlansProps> = ({ onSelectPlan, selectedPlanId }) => {
  const [plans, setPlans] = useState<UserCurrentTrainingPlan[]>([]);
  const [showHealthProfileModal, setShowHealthProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    loadPlans();
  }, [user?.id]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        console.warn('User ID not available, skipping plan load');
        setLoading(false);
        return;
      }
      
      const res = await getCurrentTrainingPlans(user.id);
      
      setPlans(res);
      console.log('Training Plans Loaded:', res);
      
      // Check if user has no active plans and show modal
      const activePlans = res.filter(plan => 
        plan.status === 'active' || plan.status === 'pending' || !plan.status
      );
      
      if (activePlans.length === 0 && res.length === 0) {
        // User has no plans at all - show modal after a short delay
        setTimeout(() => {
          setShowHealthProfileModal(true);
        }, 500);
      }
      
      res.forEach((plan, idx) => {
        console.log(`Plan ${idx}:`, {
          id: plan.id,
          trainingPlanId: plan.id,
          planName: plan.name,
        });
      });
    } catch (error) {
      console.error('Error loading plans:', error);
      // If error, still show modal to help user get started
      if (plans.length === 0) {
        setTimeout(() => {
          setShowHealthProfileModal(true);
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelected = (planId: number) => {
    // Reload plans after user selects a plan
    loadPlans();
    setShowHealthProfileModal(false);
  };

  const handleDeletePlan = async (utId: number, planName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa training plan "${planName}"?\n\nHành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa.`)) {
      return;
    }

    try {
      setDeletingPlanId(utId);
      await deleteUserTraining(utId);
      
      // Reload plans after deletion
      await loadPlans();
      
      // Show success message (có thể dùng toast nếu có)
      alert('Training plan đã được xóa thành công!');
    } catch (error) {
      console.error('Error deleting training plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa training plan';
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setDeletingPlanId(null);
      setShowDeleteConfirm(null);
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
      <>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có Training Plan</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Để bắt đầu hành trình fitness của bạn, hãy điền Health Profile để nhận gợi ý Training Plan phù hợp nhất
          </p>
          <Button
            onClick={() => setShowHealthProfileModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Điền Health Profile
          </Button>
        </div>
        
        <HealthProfileModal
          isOpen={showHealthProfileModal}
          onClose={() => setShowHealthProfileModal(false)}
          onPlanSelected={handlePlanSelected}
        />
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
          onClick={() => {
            if (showDeleteConfirm !== plan.id) {
              console.log('Selected Plan:', plan);
              console.log('Plan trainingPlanId:', plan.trainingPlanId);
              onSelectPlan(plan);
            }
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
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                plan.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : plan.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {plan.status || 'Active'}
              </span>
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn trigger onClick của card
                  setShowDeleteConfirm(plan.id);
                }}
                disabled={deletingPlanId === plan.id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Xóa training plan"
              >
                {deletingPlanId === plan.id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm === plan.id && (
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(null);
              }}
            >
              <div 
                className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Xóa Training Plan</h3>
                    <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-6">
                  Bạn có chắc chắn muốn xóa training plan <strong>"{plan.planName || plan.name}"</strong>?
                  Tất cả dữ liệu liên quan (PersonalizedPlanDetail, DailyTrainingLog) sẽ bị xóa vĩnh viễn.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(plan.id, plan.planName || plan.name);
                    }}
                    disabled={deletingPlanId === plan.id}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingPlanId === plan.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          )}

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
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner relative">
              <div
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-full transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${Math.max(0, Math.min(100, plan.progressPercentage || 0))}%`,
                  minWidth: (plan.progressPercentage || 0) > 0 ? '2px' : '0px'
                }}
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
