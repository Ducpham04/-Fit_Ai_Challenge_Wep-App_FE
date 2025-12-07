import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserInfoAPI, BodyMetricHistoryDTO } from "../../../api/userInfo.api";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

export const BodyRecordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BodyMetricHistoryDTO>({
    weightKg: 0,
    heightCm: 0,
    bodyFatPct: 0,
    muscleMassKg: 0,
    waterPct: 0,
    notes: "",
  });

  // Load latest body info để pre-fill form
  useEffect(() => {
    const loadLatest = async () => {
      try {
        const userInfo = await UserInfoAPI.getUserInfo();
        if (userInfo.data) {
          setFormData((prev) => ({
            ...prev,
            weightKg: userInfo.data?.weightKg || 0,
            heightCm: userInfo.data?.heightCm || 0,
            bodyFatPct: userInfo.data?.bodyFatPct || 0,
          }));
        }
      } catch (err) {
        console.log("No existing body info");
      }
    };
    loadLatest();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Lấy user info hiện tại để có age và gender
      const userInfo = await UserInfoAPI.getUserInfo();
      
      // Tạo body metric history
      const bodyMetricData: BodyMetricHistoryDTO = {
        weightKg: formData.weightKg,
        heightCm: formData.heightCm || undefined,
        bodyFatPct: formData.bodyFatPct || undefined,
        muscleMassKg: formData.muscleMassKg || undefined,
        waterPct: formData.waterPct || undefined,
        notes: formData.notes || undefined,
        recordedAt: new Date().toISOString(),
      };
      
      const bodyMetricResponse = await UserInfoAPI.createBodyMetric(bodyMetricData);
      console.log("📥 Create body metric response:", bodyMetricResponse);
      
      // Axios wraps response in data, so check response.data.success
      const bodyMetricSuccess = bodyMetricResponse?.data?.success ?? bodyMetricResponse?.success ?? false;
      if (!bodyMetricSuccess) {
        const errorMsg = bodyMetricResponse?.data?.message || bodyMetricResponse?.message || "Không thể lưu lịch sử body metric. Vui lòng thử lại.";
        console.error("❌ API returned unsuccessful response:", bodyMetricResponse);
        toast.error(errorMsg);
        return;
      }
      
      console.log("✅ Body metric created successfully");

      // Cập nhật user info với đầy đủ thông tin (bao gồm age, gender để tính BMR)
      if (userInfo.data) {
        const updateData: any = {
          weightKg: formData.weightKg,
        };
        
        if (formData.heightCm) {
          updateData.heightCm = formData.heightCm;
        }
        if (formData.bodyFatPct) {
          updateData.bodyFatPct = formData.bodyFatPct;
        }
        // Giữ nguyên age và gender từ user info hiện tại
        if (userInfo.data.age) {
          updateData.age = userInfo.data.age;
        }
        if (userInfo.data.gender) {
          updateData.gender = userInfo.data.gender;
        }
        if (userInfo.data.activityLevel) {
          updateData.activityLevel = userInfo.data.activityLevel;
        }
        
        console.log("📤 Updating user info with data:", updateData);
        const updateResponse = await UserInfoAPI.updateUserInfo(updateData);
        console.log("📥 Update user info response:", updateResponse);
        
        // Axios wraps response in data, so check response.data.success
        const updateSuccess = updateResponse?.data?.success ?? updateResponse?.success ?? false;
        if (!updateSuccess) {
          const errorMsg = updateResponse?.data?.message || updateResponse?.message || "Không thể cập nhật thông tin cơ thể. Vui lòng thử lại.";
          console.error("❌ API returned unsuccessful response:", updateResponse);
          toast.error(errorMsg);
          return; // Don't navigate if update failed
        }
        
        console.log("✅ User info updated successfully");
      } else {
        // Nếu chưa có user info, tạo mới với thông tin từ form
        console.log("User info not found, creating new user info...");
        const newUserInfoData: any = {
          weightKg: formData.weightKg,
        };
        
        if (formData.heightCm) {
          newUserInfoData.heightCm = formData.heightCm;
        }
        if (formData.bodyFatPct) {
          newUserInfoData.bodyFatPct = formData.bodyFatPct;
        }
        
        console.log("📤 Creating new user info with data:", newUserInfoData);
        const createResponse = await UserInfoAPI.updateUserInfo(newUserInfoData);
        console.log("📥 Create user info response:", createResponse);
        
        // Axios wraps response in data, so check response.data.success
        const createSuccess = createResponse?.data?.success ?? createResponse?.success ?? false;
        if (!createSuccess) {
          const errorMsg = createResponse?.data?.message || createResponse?.message || "Không thể tạo thông tin cơ thể. Vui lòng thử lại.";
          console.error("❌ API returned unsuccessful response:", createResponse);
          toast.error(errorMsg);
          return;
        }
        
        console.log("✅ User info created successfully");
      }

      toast.success("Đã lưu thông tin body thành công!");
      navigate("/profile");
    } catch (err: any) {
      console.error("Error details:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Có lỗi xảy ra khi lưu thông tin";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-sky-100 rounded-lg">
                <Scale className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cập nhật Body</h1>
                <p className="text-gray-600">Nhập thông tin cơ thể của bạn</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Weight */}
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
                    setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ví dụ: 70.5"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.heightCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ví dụ: 175.0"
                />
              </div>

              {/* Body Fat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  % Mỡ cơ thể
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyFatPct || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bodyFatPct: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ví dụ: 15.5"
                />
              </div>

              {/* Muscle Mass */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khối lượng cơ (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.muscleMassKg || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, muscleMassKg: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ví dụ: 55.0"
                />
              </div>

              {/* Water Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  % Nước trong cơ thể
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waterPct || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, waterPct: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ví dụ: 60.0"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ghi chú thêm (tùy chọn)"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

