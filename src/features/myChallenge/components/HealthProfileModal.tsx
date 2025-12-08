import { useState, useEffect } from "react";
import { X, User, Activity, Target, Heart, Utensils, Calculator, CheckCircle, ArrowRight, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import client from "@/api/client";
import { TrainingAPI } from "@/api/training.api";
import { SimpleModal } from "../../../components/ui/simple-modal";

interface HealthProfileForm {
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: string;
  waistCm?: number;
  hipCm?: number;
  neckCm?: number;
  dailyActivityLevel?: string;
  workoutFrequencyPerWeek?: number;
  favoriteExerciseType?: string;
  currentDietType?: string;
  sleepHoursPerDay?: number;
  stressLevel?: string;
  occupation?: string;
  primaryGoal?: string;
  goalWeightKg?: number;
  goalBodyFatPercent?: number;
  goalTimelineDays?: number;
  goalDescription?: string;
  medicalHistory?: string;
  currentInjuries?: string;
  mobilityLevel?: string;
  availableEquipment?: string;
  mealsPerDay?: number;
  frequentFoods?: string;
  waterIntakeLitersPerDay?: number;
  alcoholConsumption?: string;
  smokingStatus?: string;
}

interface CalculatedMetrics {
  bmi?: number;
  bmr?: number;
  tdee?: number;
  bodyFatPercent?: number;
  leanBodyMassKg?: number;
  recommendedCalories?: number;
}

interface RecommendedPlan {
  id: number;
  title: string;
  description?: string;
  difficulty?: string;
  duration?: number;
  goalId?: number;
  goalName?: string;
}

interface HealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelected?: (planId: number) => void;
}

const STEPS = [
  { id: 1, name: "Cơ thể", icon: User },
  { id: 2, name: "Sinh hoạt", icon: Activity },
  { id: 3, name: "Mục tiêu", icon: Target },
  { id: 4, name: "Sức khỏe", icon: Heart },
  { id: 5, name: "Ăn uống", icon: Utensils },
  { id: 6, name: "Kết quả", icon: Calculator },
];

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({
  isOpen,
  onClose,
  onPlanSelected,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HealthProfileForm>({});
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics>({});
  const [recommendedPlans, setRecommendedPlans] = useState<RecommendedPlan[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [startedPlanInfo, setStartedPlanInfo] = useState<{
    planTitle: string;
    startDate: string;
    endDate: string;
    utId: number;
    personalized: boolean;
  } | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({});
      setCalculatedMetrics({});
      setRecommendedPlans([]);
    }
  }, [isOpen]);

  // Load existing health profile
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    const loadProfile = async () => {
      try {
        const response = await client.get("/user/health-profile", {
          headers: { userId: user.id.toString() }
        });
        if (response.data?.success && response.data?.data) {
          const profile = response.data.data;
          setFormData({
            heightCm: profile.heightCm,
            weightKg: profile.weightKg,
            age: profile.age,
            gender: profile.gender,
            waistCm: profile.waistCm,
            hipCm: profile.hipCm,
            neckCm: profile.neckCm,
            dailyActivityLevel: profile.dailyActivityLevel,
            workoutFrequencyPerWeek: profile.workoutFrequencyPerWeek,
            favoriteExerciseType: profile.favoriteExerciseType,
            currentDietType: profile.currentDietType,
            sleepHoursPerDay: profile.sleepHoursPerDay,
            stressLevel: profile.stressLevel,
            occupation: profile.occupation,
            primaryGoal: profile.primaryGoal,
            goalWeightKg: profile.goalWeightKg,
            goalBodyFatPercent: profile.goalBodyFatPercent,
            goalTimelineDays: profile.goalTimelineDays,
            goalDescription: profile.goalDescription,
            medicalHistory: profile.medicalHistory,
            currentInjuries: profile.currentInjuries,
            mobilityLevel: profile.mobilityLevel,
            availableEquipment: profile.availableEquipment,
            mealsPerDay: profile.mealsPerDay,
            frequentFoods: profile.frequentFoods,
            waterIntakeLitersPerDay: profile.waterIntakeLitersPerDay,
            alcoholConsumption: profile.alcoholConsumption,
            smokingStatus: profile.smokingStatus,
          });
          setCalculatedMetrics({
            bmi: profile.bmi,
            bmr: profile.bmr,
            tdee: profile.tdee,
            bodyFatPercent: profile.bodyFatPercent,
            leanBodyMassKg: profile.leanBodyMassKg,
            recommendedCalories: profile.recommendedCalories,
          });
        }
      } catch (err) {
        console.log("No existing health profile");
      }
    };
    loadProfile();
  }, [isOpen, user?.id]);

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const response = await client.post(
        "/user/health-profile",
        formData,
        {
          headers: { userId: user.id.toString() }
        }
      );

      if (response.data?.success) {
        const profile = response.data.data;
        setCalculatedMetrics({
          bmi: profile.bmi,
          bmr: profile.bmr,
          tdee: profile.tdee,
          bodyFatPercent: profile.bodyFatPercent,
          leanBodyMassKg: profile.leanBodyMassKg,
          recommendedCalories: profile.recommendedCalories,
        });

        // Load recommended plans
        try {
          const plansResponse = await client.get(
            "/user/health-profile/recommended-plans",
            {
              headers: { userId: user.id.toString() }
            }
          );
          if (plansResponse.data?.success && plansResponse.data?.data?.recommendedPlans) {
            setRecommendedPlans(plansResponse.data.data.recommendedPlans);
            setCurrentStep(6); // Move to results step
          }
        } catch (err) {
          console.error("Error loading recommended plans:", err);
          toast.error("Không thể tải danh sách gợi ý");
        }

        toast.success("Health profile saved successfully!");
      } else {
        toast.error(response.data?.message || "Error saving health profile");
      }
    } catch (error: any) {
      console.error("Error saving health profile:", error);
      toast.error(error?.response?.data?.message || "Error saving health profile");
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = async (planId: number) => {
    try {
      setLoading(true);
      const apiResponse = await TrainingAPI.startTrainingPlan(planId);
      
      // Axios wraps response in .data, and backend returns NotificationResponse
      // So structure is: apiResponse.data.success, apiResponse.data.data
      const response = apiResponse.data || apiResponse;
      console.log(response)
      if (response.success && response.data) {
        const planData = response.data;
        
        // Tìm plan title từ recommended plans
        const selectedPlan = recommendedPlans.find(p => p.id === planId);
        const planTitle = selectedPlan?.title || "Training Plan";
        
        // Format dates
        const startDate = new Date(planData.startDate).toLocaleDateString('vi-VN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const endDate = new Date(planData.endDate).toLocaleDateString('vi-VN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        // Lưu thông tin để hiển thị trong success modal
        setStartedPlanInfo({
          planTitle,
          startDate,
          endDate,
          utId: planData.utId,
          personalized: planData.personalized || false,
        });
        
        // Hiển thị success modal
        setShowSuccessModal(true);
        
        // Callback để parent component có thể reload plans
        if (onPlanSelected) {
          onPlanSelected(planId);
        }
      } else {
        toast.error(response.message || "Error starting training plan");
      }
    } catch (error: any) {
      console.error("Error starting training plan:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.data?.message ||
                          error?.message || 
                          "Có lỗi xảy ra khi bắt đầu training plan";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    onClose();
    // Reload page để hiển thị plan mới
    window.location.reload();
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.heightCm && formData.weightKg && formData.age && formData.gender);
      case 2:
        return !!(formData.dailyActivityLevel && formData.workoutFrequencyPerWeek);
      case 3:
        return !!formData.primaryGoal;
      case 4:
      case 5:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Thông tin cơ thể</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.heightCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="175.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weightKg || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weightKg: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="70.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi *</label>
                <input
                  type="number"
                  required
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
                <select
                  required
                  value={formData.gender || ""}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Chọn</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vòng eo (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waistCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, waistCm: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="80.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vòng cổ (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.neckCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, neckCm: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="38.0"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Thói quen sinh hoạt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ vận động *</label>
                <select
                  required
                  value={formData.dailyActivityLevel || ""}
                  onChange={(e) => setFormData({ ...formData, dailyActivityLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Chọn</option>
                  <option value="sedentary">Ít vận động</option>
                  <option value="lightly_active">Vận động nhẹ</option>
                  <option value="moderately_active">Vận động vừa</option>
                  <option value="very_active">Vận động nhiều</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tần suất tập (buổi/tuần) *</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  required
                  value={formData.workoutFrequencyPerWeek || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, workoutFrequencyPerWeek: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài tập yêu thích</label>
                <select
                  value={formData.favoriteExerciseType || ""}
                  onChange={(e) => setFormData({ ...formData, favoriteExerciseType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Chọn</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Strength">Strength</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Yoga">Yoga</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thiết bị sẵn có</label>
                <select
                  value={formData.availableEquipment || ""}
                  onChange={(e) => setFormData({ ...formData, availableEquipment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Chọn</option>
                  <option value="none">Không có</option>
                  <option value="bodyweight_only">Bodyweight</option>
                  <option value="dumbbells">Tạ đơn</option>
                  <option value="full_gym">Phòng gym</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Mục tiêu cá nhân</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu chính *</label>
                <select
                  required
                  value={formData.primaryGoal || ""}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Chọn</option>
                  <option value="lose_weight">Giảm cân</option>
                  <option value="build_muscle">Tăng cơ</option>
                  <option value="lose_fat">Giảm mỡ</option>
                  <option value="maintain_health">Duy trì</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng mục tiêu (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.goalWeightKg || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, goalWeightKg: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="65.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (ngày)</label>
                  <input
                    type="number"
                    value={formData.goalTimelineDays || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, goalTimelineDays: parseInt(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tình trạng sức khỏe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chấn thương hiện tại</label>
                <textarea
                  rows={3}
                  value={formData.currentInjuries || ""}
                  onChange={(e) => setFormData({ ...formData, currentInjuries: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Đau lưng, đau gối..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiền sử bệnh lý</label>
                <textarea
                  rows={2}
                  value={formData.medicalHistory || ""}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Tim mạch, huyết áp..."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Hành vi ăn uống</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số bữa/ngày</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.mealsPerDay || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, mealsPerDay: parseInt(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nước (L/ngày)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.waterIntakeLitersPerDay || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, waterIntakeLitersPerDay: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="2.0"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Kết quả & Gợi ý
            </h3>

            {/* Metrics */}
            {calculatedMetrics.bmi && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Chỉ số cơ thể</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white rounded p-2 text-center">
                    <p className="text-gray-600">BMI</p>
                    <p className="text-lg font-bold text-blue-600">{calculatedMetrics.bmi?.toFixed(1)}</p>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <p className="text-gray-600">BMR</p>
                    <p className="text-lg font-bold text-purple-600">{calculatedMetrics.bmr?.toFixed(0)}</p>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <p className="text-gray-600">TDEE</p>
                    <p className="text-lg font-bold text-green-600">{calculatedMetrics.tdee?.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Plans */}
            {recommendedPlans.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-bold text-gray-900">Training Plans được gợi ý:</h4>
                {recommendedPlans.slice(0, 3).map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 text-sm">{plan.title}</h5>
                        {plan.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{plan.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {plan.difficulty && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {plan.difficulty}
                            </span>
                          )}
                          {plan.duration && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                              {plan.duration} tuần
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartPlan(plan.id)}
                        disabled={loading}
                        size="sm"
                        className="ml-3 bg-blue-600 hover:bg-blue-700"
                      >
                        Bắt đầu
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-600 text-sm">
                Đang tải danh sách gợi ý...
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Success Modal */}
      <SimpleModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="🎉 Training Plan đã được bắt đầu!"
        className="max-w-md"
        footer={
          <Button
            onClick={handleCloseSuccessModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Xem Training Plan
          </Button>
        }
      >
        {startedPlanInfo && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-bold text-lg text-gray-900 mb-3">{startedPlanInfo.planTitle}</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ngày bắt đầu</p>
                    <p className="text-base font-semibold text-gray-900">{startedPlanInfo.startDate}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ngày kết thúc</p>
                    <p className="text-base font-semibold text-gray-900">{startedPlanInfo.endDate}</p>
                  </div>
                </div>
                
                {startedPlanInfo.personalized && (
                  <div className="flex items-start gap-3 bg-blue-100 rounded-lg p-3 border border-blue-200">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">✨ Plan đã được cá nhân hóa</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Training Plan này đã được tùy chỉnh dựa trên Health Profile của bạn để đạt hiệu quả tối đa
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>UserTraining ID:</strong> {startedPlanInfo.utId}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Bạn có thể bắt đầu thực hiện các bài tập hàng ngày ngay bây giờ!
              </p>
            </div>
          </div>
        )}
      </SimpleModal>

      {/* Health Profile Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-[10000] w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Health Profile</h2>
            <p className="text-sm text-gray-600 mt-1">Điền thông tin để nhận gợi ý phù hợp</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-white rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <span className={`text-xs mt-1 text-center ${isActive ? "font-bold text-blue-600" : "text-gray-500"}`}>
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        {currentStep < 6 && (
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              size="sm"
            >
              Quay lại
            </Button>
            <Button
              onClick={nextStep}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Đang lưu..." : currentStep === STEPS.length - 1 ? "Hoàn thành" : "Tiếp theo"}
            </Button>
          </div>
        )}

        {currentStep === 6 && (
          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
            <Button onClick={onClose} variant="outline" size="sm">
              Đóng
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

