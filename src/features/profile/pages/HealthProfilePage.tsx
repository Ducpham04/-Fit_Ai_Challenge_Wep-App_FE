import { useState, useEffect } from "react";
import { ArrowLeft, Save, User, Activity, Target, Heart, Utensils, Calculator, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import client from "@/api/client";

interface HealthProfileForm {
  // Nhóm A: Thông tin cơ thể
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: string;
  waistCm?: number;
  hipCm?: number;
  neckCm?: number;
  bodyImageUrl?: string;

  // Nhóm B: Thói quen sinh hoạt
  dailyActivityLevel?: string;
  workoutFrequencyPerWeek?: number;
  favoriteExerciseType?: string;
  currentDietType?: string;
  sleepHoursPerDay?: number;
  stressLevel?: string;
  occupation?: string;

  // Nhóm C: Mục tiêu
  primaryGoal?: string;
  goalWeightKg?: number;
  goalBodyFatPercent?: number;
  goalTimelineDays?: number;
  goalDescription?: string;

  // Nhóm D: Sức khỏe
  medicalHistory?: string;
  currentInjuries?: string;
  mobilityLevel?: string;
  availableEquipment?: string;

  // Nhóm E: Hành vi ăn uống
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

const STEPS = [
  { id: 1, name: "Thông tin cơ thể", icon: User },
  { id: 2, name: "Thói quen sinh hoạt", icon: Activity },
  { id: 3, name: "Mục tiêu cá nhân", icon: Target },
  { id: 4, name: "Tình trạng sức khỏe", icon: Heart },
  { id: 5, name: "Hành vi ăn uống", icon: Utensils },
  { id: 6, name: "Kết quả & Gợi ý", icon: Calculator },
];

export const HealthProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HealthProfileForm>({});
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics>({});
  const [recommendedPlans, setRecommendedPlans] = useState<any[]>([]);

  // Load existing health profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
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
            bodyImageUrl: profile.bodyImageUrl,
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
  }, [user?.id]);

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
          }
        } catch (err) {
          console.error("Error loading recommended plans:", err);
        }

        toast.success("Health profile saved successfully!");
        setCurrentStep(6); // Move to results step
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Thông tin cơ thể
        return !!(formData.heightCm && formData.weightKg && formData.age && formData.gender);
      case 2: // Thói quen sinh hoạt
        return !!(formData.dailyActivityLevel && formData.workoutFrequencyPerWeek);
      case 3: // Mục tiêu
        return !!formData.primaryGoal;
      case 4: // Sức khỏe
        return true; // Optional
      case 5: // Hành vi ăn uống
        return true; // Optional
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
      toast.error("Please fill in all required fields");
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
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin cơ thể</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiều cao (cm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.heightCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="175.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cân nặng (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weightKg || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weightKg: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tuổi *
                </label>
                <input
                  type="number"
                  required
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính *
                </label>
                <select
                  required
                  value={formData.gender || ""}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vòng eo (cm) - Để tính Body Fat chính xác
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waistCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, waistCm: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="80.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vòng hông (cm) - Cần cho nữ
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hipCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, hipCm: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="95.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vòng cổ (cm) - Để tính Body Fat chính xác
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.neckCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, neckCm: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="38.0"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Lưu ý:</strong> Nếu bạn có đủ 3 số đo (vòng eo, hông, cổ), hệ thống sẽ tính Body Fat % cực chính xác bằng Navy Method (sai số chỉ 1-3%).
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thói quen sinh hoạt</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ vận động hằng ngày *
                </label>
                <select
                  required
                  value={formData.dailyActivityLevel || ""}
                  onChange={(e) => setFormData({ ...formData, dailyActivityLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn mức độ</option>
                  <option value="sedentary">Ít vận động (ngồi nhiều)</option>
                  <option value="lightly_active">Vận động nhẹ (đi lại ít)</option>
                  <option value="moderately_active">Vận động vừa (đi lại nhiều)</option>
                  <option value="very_active">Vận động nhiều (lao động nặng)</option>
                  <option value="extra_active">Vận động rất nhiều</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tần suất tập luyện (buổi/tuần) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  required
                  value={formData.workoutFrequencyPerWeek || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, workoutFrequencyPerWeek: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại bài tập yêu thích
                </label>
                <select
                  value={formData.favoriteExerciseType || ""}
                  onChange={(e) => setFormData({ ...formData, favoriteExerciseType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn loại bài tập</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Strength">Strength Training</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chế độ ăn hiện tại
                </label>
                <select
                  value={formData.currentDietType || ""}
                  onChange={(e) => setFormData({ ...formData, currentDietType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn chế độ ăn</option>
                  <option value="high_carb">Giàu carb</option>
                  <option value="high_fat">Giàu fat</option>
                  <option value="high_protein">High protein</option>
                  <option value="balanced">Cân bằng</option>
                  <option value="keto">Keto</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số giờ ngủ/ngày
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={formData.sleepHoursPerDay || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sleepHoursPerDay: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ stress
                </label>
                <select
                  value={formData.stressLevel || ""}
                  onChange={(e) => setFormData({ ...formData, stressLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn mức độ</option>
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công việc
                </label>
                <input
                  type="text"
                  value={formData.occupation || ""}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Văn phòng, Tài xế, Công nhân..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mục tiêu cá nhân</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mục tiêu chính *
                </label>
                <select
                  required
                  value={formData.primaryGoal || ""}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn mục tiêu</option>
                  <option value="lose_weight">Giảm cân</option>
                  <option value="build_muscle">Tăng cơ</option>
                  <option value="lose_fat">Giảm mỡ</option>
                  <option value="maintain_health">Duy trì sức khỏe</option>
                  <option value="prepare_event">Chuẩn bị event/biển</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cân nặng mục tiêu (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.goalWeightKg || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, goalWeightKg: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="65.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    % Mỡ mục tiêu
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.goalBodyFatPercent || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, goalBodyFatPercent: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="15.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian đạt mục tiêu (ngày)
                  </label>
                  <input
                    type="number"
                    value={formData.goalTimelineDays || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, goalTimelineDays: parseInt(e.target.value) || undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả mục tiêu chi tiết
                </label>
                <textarea
                  rows={4}
                  value={formData.goalDescription || ""}
                  onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Giảm 4kg trong 30 ngày để chuẩn bị đi biển..."
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tình trạng sức khỏe</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền sử bệnh lý
                </label>
                <textarea
                  rows={3}
                  value={formData.medicalHistory || ""}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tim mạch, huyết áp, tiểu đường..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chấn thương hiện tại
                </label>
                <textarea
                  rows={3}
                  value={formData.currentInjuries || ""}
                  onChange={(e) => setFormData({ ...formData, currentInjuries: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Đau lưng, đau gối, cổ tay..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khả năng vận động (Mobility)
                </label>
                <select
                  value={formData.mobilityLevel || ""}
                  onChange={(e) => setFormData({ ...formData, mobilityLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn mức độ</option>
                  <option value="excellent">Xuất sắc</option>
                  <option value="good">Tốt</option>
                  <option value="limited">Hạn chế</option>
                  <option value="restricted">Rất hạn chế</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thiết bị sẵn có
                </label>
                <select
                  value={formData.availableEquipment || ""}
                  onChange={(e) => setFormData({ ...formData, availableEquipment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn thiết bị</option>
                  <option value="none">Không có</option>
                  <option value="bodyweight_only">Chỉ bodyweight</option>
                  <option value="dumbbells">Tạ đơn</option>
                  <option value="resistance_bands">Dây kháng lực</option>
                  <option value="full_gym">Phòng gym đầy đủ</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hành vi ăn uống</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số bữa ăn/ngày
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.mealsPerDay || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mealsPerDay: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lượng nước uống (L/ngày)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.waterIntakeLitersPerDay || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, waterIntakeLitersPerDay: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Món ăn thường xuyên
                </label>
                <input
                  type="text"
                  value={formData.frequentFoods || ""}
                  onChange={(e) => setFormData({ ...formData, frequentFoods: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Dầu mỡ, đồ ngọt, thức ăn nhanh..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uống rượu
                </label>
                <select
                  value={formData.alcoholConsumption || ""}
                  onChange={(e) => setFormData({ ...formData, alcoholConsumption: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn</option>
                  <option value="none">Không</option>
                  <option value="occasional">Thỉnh thoảng</option>
                  <option value="regular">Thường xuyên</option>
                  <option value="heavy">Nhiều</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hút thuốc
                </label>
                <select
                  value={formData.smokingStatus || ""}
                  onChange={(e) => setFormData({ ...formData, smokingStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn</option>
                  <option value="none">Không</option>
                  <option value="occasional">Thỉnh thoảng</option>
                  <option value="regular">Thường xuyên</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kết quả tính toán & Gợi ý</h3>
            
            {/* Calculated Metrics */}
            {calculatedMetrics.bmi && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Chỉ số cơ thể
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase mb-1">BMI</p>
                    <p className="text-2xl font-bold text-blue-600">{calculatedMetrics.bmi?.toFixed(1)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase mb-1">BMR</p>
                    <p className="text-2xl font-bold text-purple-600">{calculatedMetrics.bmr?.toFixed(0)} kcal</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase mb-1">TDEE</p>
                    <p className="text-2xl font-bold text-green-600">{calculatedMetrics.tdee?.toFixed(0)} kcal</p>
                  </div>
                  {calculatedMetrics.bodyFatPercent && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs text-gray-600 uppercase mb-1">Body Fat %</p>
                      <p className="text-2xl font-bold text-orange-600">{calculatedMetrics.bodyFatPercent?.toFixed(1)}%</p>
                    </div>
                  )}
                  {calculatedMetrics.leanBodyMassKg && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs text-gray-600 uppercase mb-1">Lean Mass</p>
                      <p className="text-2xl font-bold text-indigo-600">{calculatedMetrics.leanBodyMassKg?.toFixed(1)} kg</p>
                    </div>
                  )}
                  {calculatedMetrics.recommendedCalories && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs text-gray-600 uppercase mb-1">Calories</p>
                      <p className="text-2xl font-bold text-red-600">{calculatedMetrics.recommendedCalories?.toFixed(0)} kcal</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommended Plans */}
            {recommendedPlans.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Training Plans được gợi ý
                </h4>
                <div className="space-y-3">
                  {recommendedPlans.slice(0, 5).map((plan: any) => (
                    <div key={plan.id} className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-gray-900">{plan.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {plan.difficulty}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                              {plan.duration} tuần
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate(`/training-plans/${plan.id}`)}
                          className="ml-4"
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => navigate("/profile")} variant="outline">
                Quay lại Profile
              </Button>
              <Button onClick={() => setCurrentStep(1)}>
                Cập nhật thông tin
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Health Profile</h1>
          <p className="text-gray-600 mt-2">
            Điền thông tin để nhận gợi ý Training Plan phù hợp
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={24} />
                      ) : (
                        <Icon size={24} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center ${isActive ? "font-bold text-blue-600" : "text-gray-500"}`}>
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

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          {currentStep < 6 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
              >
                Quay lại
              </Button>
              <Button
                onClick={nextStep}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Đang lưu..." : currentStep === STEPS.length - 1 ? "Hoàn thành" : "Tiếp theo"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


