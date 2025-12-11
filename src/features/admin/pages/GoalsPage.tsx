import React, { useMemo, useState, useEffect } from "react";
import { SimpleButton as Button } from "@/components/ui/simple-button";
import { Plus, Target, Search, AlertCircle, Zap, Dumbbell, Leaf, Edit2, Trash2, Eye, Filter, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { SimpleInput as Input } from "@/components/ui/simple-input";
import { SimpleModal } from "@/components/ui/simple-modal";
import { SimpleSelect } from "@/components/ui/simple-select";
import { FormField } from "@/components/ui/form-field";
import { SimpleTextarea as Textarea } from "@/components/ui/simple-textarea";
import { goalAPI } from "../api/adminAPI";
import { AdminGoal, GoalPayload } from "../types/admin-entities";
import { extractDataFromResponse } from "../utils/responseHelper";
import { ImageWithPresignedUrl } from "@/components/common/ImageWithPresignedUrl";

// Mock associations
const MOCK_ASSOCIATIONS: Record<number, any> = {
  1: {
    challenges: [
      { id: 1, name: "30-Day Push-up Challenge", completed: 245 },
      { id: 2, name: "Plank Challenge", completed: 180 },
    ],
    trainingPlans: [
      { id: 1, name: "Beginner Strength", users: 320 },
      { id: 2, name: "Upper Body Focus", users: 150 },
    ],
    nutritionPlans: [
      { id: 1, name: "High Protein Diet", calories: 2500 },
    ],
  },
};

const DEFAULT_FORM: GoalPayload = {
  name: "",
  description: "",
  imageLink: "",
  imageFile: null,
};

// baseURL removed - using ImageWithPresignedUrl component instead

type ModalMode = "create" | "edit" | "detail";

interface StatCardProps {
  label: string;
  value: number;
  delta: string;
  icon?: React.ReactNode;
  gradient?: string;
}

function StatCard({ 
  label, 
  value, 
  delta, 
  icon, 
  gradient 
}: StatCardProps) {
  return (
    <div className="relative p-6 lg:p-7 bg-gradient-to-br from-white to-purple-50/30 border-2 border-purple-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient || 'from-purple-500 to-purple-600'} opacity-20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">{label}</p>
          {icon && (
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform shadow-md">
              {icon}
            </div>
          )}
        </div>
        <p className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{value}</p>
        <p className="text-xs font-semibold text-gray-600">{delta}</p>
      </div>
    </div>
  );
}

export function GoalsPage() {
  const [goals, setGoals] = useState<AdminGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalState, setModalState] = useState<{ open: boolean; mode: ModalMode; goal?: AdminGoal }>({
    open: false,
    mode: "create",
  });
  const [form, setForm] = useState<GoalPayload>(DEFAULT_FORM);
  const [deleteModal, setDeleteModal] = useState<AdminGoal | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  // Cleanup object URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [GoalsPage] Fetching goals...");
      const response = await goalAPI.getAll();
      console.log("✅ [GoalsPage] Full response:", response);
      
      // Extract data using helper function
      const data = extractDataFromResponse<AdminGoal>(response);
      console.log("📋 [GoalsPage] Extracted data:", data);
      setGoals(data);
    } catch (error: any) {
      console.error("❌ [GoalsPage] Error fetching goals:", error);
      setError(error?.response?.data?.message || error?.message || "Không thể tải danh sách goals");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(DEFAULT_FORM);
    setError(null);
    setImagePreview(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (goal: AdminGoal) => {
    // Map AdminGoal to GoalPayload format
    setForm({
      name: goal.name || goal.title || "",
      description: goal.description || "",
      imageLink: goal.imageLink || "",
      imageFile: null,
    });
    setError(null);
    // Set image preview if imageLink exists
    setImagePreview(goal.imageLink || null);
    setModalState({ open: true, mode: "edit", goal });
  };

  const openDetailModal = (goal: AdminGoal) => {
    setModalState({ open: true, mode: "detail", goal });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(DEFAULT_FORM);
    setError(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim()) {
      setError("Tên mục tiêu không được để trống");
      return;
    }
    if (!form.description.trim()) {
      setError("Mô tả không được để trống");
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      console.log("📤 [GoalsPage] Submitting goal...", "Mode:", modalState.mode, "Data:", form);
      
      // Create FormData with "data" (JSON) and "image" (file)
      const formData = new FormData();
      
      // Create data object matching goalsDTOpayload (BE expects: name, description, imageLink)
      const dataPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        imageLink: form.imageLink || "",
      };
      
      // Add data as Blob with Content-Type application/json
      // This ensures Spring can deserialize it properly from @RequestPart
      const dataBlob = new Blob([JSON.stringify(dataPayload)], { type: 'application/json' });
      formData.append("data", dataBlob);
      
      // Add image file if exists
      if (form.imageFile instanceof File) {
        formData.append("image", form.imageFile);
      }
      
      if (modalState.mode === "create") {
        console.log("➕ Creating new goal");
        await goalAPI.create(formData);
      } else if (modalState.goal) {
        console.log("✏️ Updating goal ID:", modalState.goal.id);
        await goalAPI.update(modalState.goal.id, formData);
      }
      
      console.log("✅ Goal saved successfully");
      await fetchGoals();
      closeModal();
    } catch (error: any) {
      console.error("❌ [GoalsPage] Error saving goal:", error);
      setError(error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi lưu goal");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      console.log("🗑️ [GoalsPage] Deleting goal ID:", id);
      await goalAPI.delete(id);
      console.log("✅ Goal deleted successfully");
      await fetchGoals();
      setDeleteModal(null);
    } catch (error: any) {
      console.error("❌ [GoalsPage] Error deleting goal:", error);
      setError(error?.message || "Không thể xóa goal");
    }
  };

  const filtered = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        (goal.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (goal.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : goal.status === statusFilter;
      const matchesType = typeFilter === "all" ? true : goal.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [goals, searchTerm, statusFilter, typeFilter]);

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md";
      case "completed":
        return "text-white bg-gradient-to-r from-green-500 to-green-600 shadow-md";
      case "paused":
        return "text-white bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md";
      case "abandoned":
        return "text-white bg-gradient-to-r from-gray-500 to-gray-600 shadow-md";
      default:
        return "text-white bg-gradient-to-r from-gray-500 to-gray-600 shadow-md";
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "weight":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md";
      case "steps":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md";
      case "calories":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md";
      case "workout":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md";
      case "water":
        return "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md";
      case "sleep":
        return "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md";
      case "custom":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
    }
  };

  const stats = useMemo(() => {
    const total = goals.length;
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    return { total, active, completed };
  }, [goals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                <Target className="text-white" size={20} />
              </div>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Goals Management</p>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Quản lý mục tiêu
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Theo dõi và quản lý các mục tiêu sức khỏe, thể dục của người dùng
            </p>
          </div>
          <Button 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg border-0" 
            onClick={openCreateModal}
          >
            <Plus size={20} className="font-bold" />
            <span className="font-semibold text-base">Thêm mục tiêu</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <StatCard 
            label="Tổng mục tiêu" 
            value={stats.total} 
            delta={stats.total > 0 ? `+${Math.round((stats.total / (stats.total || 1)) * 100)}% so với tuần trước` : "Chưa có dữ liệu"}
            icon={<Target className="text-purple-600" size={24} />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard 
            label="Đang hoạt động" 
            value={stats.active} 
            delta={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% tổng số` : "0%"}
            icon={<Zap className="text-blue-600" size={24} />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard 
            label="Hoàn thành" 
            value={stats.completed} 
            delta={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% tổng số` : "0%"}
            icon={<Target className="text-green-600" size={24} />}
            gradient="from-green-500 to-green-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-lg border-2 border-purple-100 p-5 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
              <Input
                placeholder="🔍 Tìm theo tên mục tiêu hoặc người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl text-base font-medium shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Filter className="text-purple-600" size={20} />
              </div>
              <SimpleSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "all", label: "Tất cả loại" },
                  { value: "weight", label: "Giảm cân" },
                  { value: "steps", label: "Bước chân" },
                  { value: "calories", label: "Calo" },
                  { value: "workout", label: "Tập luyện" },
                  { value: "water", label: "Nước" },
                  { value: "sleep", label: "Giấc ngủ" },
                  { value: "custom", label: "Tùy chỉnh" },
                ]}
                className="w-full lg:w-[180px] font-medium"
              />
              <SimpleSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "active", label: "Đang hoạt động" },
                  { value: "completed", label: "Hoàn thành" },
                  { value: "paused", label: "Tạm dừng" },
                  { value: "abandoned", label: "Bỏ cuộc" },
                ]}
                className="w-full lg:w-[180px] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-xl border-2 border-purple-100 p-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-purple-600" size={48} />
            <p className="text-purple-700 font-semibold text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-xl border-2 border-purple-100 p-16 text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mb-6">
              <Target className="text-purple-600" size={56} />
            </div>
            <p className="text-gray-800 font-bold text-xl mb-3">Không tìm thấy mục tiêu nào</p>
            <p className="text-gray-600 text-base mb-6">Thử thay đổi bộ lọc hoặc tạo mục tiêu mới</p>
            <Button 
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg"
            >
              <Plus size={20} className="mr-2" />
              Tạo mục tiêu mới
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filtered.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
              >
                {/* Image Display */}
                {goal.imageLink && (
                  <div className="relative w-full h-32 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />
                    <ImageWithPresignedUrl
                      src={goal.imageLink}
                      alt={goal.name || goal.title || 'Goal image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 lg:p-7 space-y-4 bg-gradient-to-b from-white to-gray-50/50">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                        <Target className="text-white" size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{goal.name || goal.title}</h3>
                        {goal.userName && (
                          <p className="text-sm text-gray-600 mt-1 font-medium">👤 {goal.userName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailModal(goal)}
                        className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110 border border-blue-200"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110 border border-purple-200"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setDeleteModal(goal)}
                        className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110 border border-red-200"
                        title="Xóa"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {goal.description && (
                    <p className="text-sm text-gray-700 line-clamp-2 font-medium leading-relaxed">{goal.description}</p>
                  )}

                  {/* Type & Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {goal.type && (
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm ${typeColor(goal.type)}`}>
                        {goal.type}
                      </span>
                    )}
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm ${statusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-bold">📊 Tiến độ</span>
                      <span className="text-purple-700 font-bold text-base">{goal.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 rounded-full transition-all duration-700 shadow-lg"
                        style={{ width: `${goal.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  {goal.endDate && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Thời hạn:</span> {goal.endDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      <SimpleModal
        isOpen={modalState.open}
        onClose={closeModal}
        title={
          modalState.mode === "create"
            ? "Thêm mục tiêu mới"
            : modalState.mode === "detail"
              ? "Chi tiết mục tiêu"
              : "Chỉnh sửa mục tiêu"
        }
        footer={
          modalState.mode === "detail" ? (
            <div className="flex justify-end gap-2">
              <Button 
                onClick={closeModal}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg border-0"
              >
                <span className="font-semibold">Đóng</span>
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={closeModal}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={submitLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    <span className="font-semibold">Đang xử lý...</span>
                  </>
                ) : (
                  <span className="font-semibold">{modalState.mode === "create" ? "✨ Tạo mục tiêu" : "💾 Lưu thay đổi"}</span>
                )}
              </Button>
            </div>
          )
        }
      >
        {modalState.mode === "detail" && modalState.goal ? (
          /* Detail View */
          <div className="space-y-6">
            {/* Image Display */}
            {modalState.goal.imageLink && (
              <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl border-2 border-purple-200 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
                <ImageWithPresignedUrl
                  src={modalState.goal.imageLink}
                  alt={modalState.goal.name || modalState.goal.title || 'Goal image'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
              <div className="flex items-center gap-4 mb-5">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Target className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-2xl mb-1">{modalState.goal.name || modalState.goal.title}</h3>
                  {modalState.goal.userName && (
                    <p className="text-base text-gray-700 font-semibold">👤 {modalState.goal.userName}</p>
                  )}
                </div>
              </div>
              {modalState.goal.description && (
                <p className="text-base text-gray-800 bg-white/80 rounded-xl p-4 font-medium leading-relaxed shadow-sm">{modalState.goal.description}</p>
              )}
            </div>

            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-5 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target size={20} className="text-purple-600" />
                </div>
                Thông tin chi tiết
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-md">
                  <p className="text-xs text-gray-600 uppercase mb-2 font-bold tracking-wide">Loại</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold capitalize ${typeColor(modalState.goal.type)}`}>
                    {modalState.goal.type}
                  </span>
                </div>
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-md">
                  <p className="text-xs text-gray-600 uppercase mb-2 font-bold tracking-wide">Trạng thái</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold capitalize ${statusColor(modalState.goal.status)}`}>
                    {modalState.goal.status}
                  </span>
                </div>
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-md">
                  <p className="text-xs text-gray-600 uppercase mb-2 font-bold tracking-wide">Tiến độ</p>
                  <p className="font-extrabold text-2xl text-purple-700 mt-1 mb-3">{modalState.goal.progress || 0}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 rounded-full shadow-lg transition-all duration-700"
                      style={{ width: `${modalState.goal.progress || 0}%` }}
                    />
                  </div>
                </div>
                {modalState.goal.endDate && (
                  <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-md">
                    <p className="text-xs text-gray-600 uppercase mb-2 font-bold tracking-wide">Thời hạn</p>
                    <p className="font-bold text-lg text-gray-900 mt-1">{modalState.goal.endDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Associations */}
            {MOCK_ASSOCIATIONS[modalState.goal.id] && (
              <>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-600" />
                    Challenges ({MOCK_ASSOCIATIONS[modalState.goal.id].challenges?.length || 0})
                  </h3>
                  {MOCK_ASSOCIATIONS[modalState.goal.id].challenges?.length > 0 ? (
                    <div className="space-y-2">
                      {MOCK_ASSOCIATIONS[modalState.goal.id].challenges.map((c: any) => (
                        <div key={c.id} className="p-3 border rounded-lg bg-yellow-50 hover:bg-yellow-100 transition">
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-sm text-gray-600">{c.completed.toLocaleString()} người hoàn thành</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Không có challenges</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Dumbbell size={16} className="text-blue-600" />
                    Training Plans ({MOCK_ASSOCIATIONS[modalState.goal.id].trainingPlans?.length || 0})
                  </h3>
                  {MOCK_ASSOCIATIONS[modalState.goal.id].trainingPlans?.length > 0 ? (
                    <div className="space-y-2">
                      {MOCK_ASSOCIATIONS[modalState.goal.id].trainingPlans.map((p: any) => (
                        <div key={p.id} className="p-3 border rounded-lg bg-blue-50 hover:bg-blue-100 transition">
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-sm text-gray-600">{p.users.toLocaleString()} người đang theo dõi</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Không có training plans</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Leaf size={16} className="text-green-600" />
                    Nutrition Plans ({MOCK_ASSOCIATIONS[modalState.goal.id].nutritionPlans?.length || 0})
                  </h3>
                  {MOCK_ASSOCIATIONS[modalState.goal.id].nutritionPlans?.length > 0 ? (
                    <div className="space-y-2">
                      {MOCK_ASSOCIATIONS[modalState.goal.id].nutritionPlans.map((p: any) => (
                        <div key={p.id} className="p-3 border rounded-lg bg-green-50 hover:bg-green-100 transition">
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-sm text-gray-600">{p.calories} kcal/ngày</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Không có nutrition plans</p>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Create/Edit View */
          <div className="space-y-5">
            <FormField
              label="Tên mục tiêu"
              value={form.name}
              onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              required
              placeholder="Ví dụ: Giảm cân, Tăng cơ, Tăng sức bền..."
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="min-h-[100px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Mô tả chi tiết mục tiêu..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-gray-400" />
                Link hình ảnh (tùy chọn)
              </label>
              <Input
                value={form.imageLink || ""}
                onChange={(e) => {
                  const link = e.target.value;
                  setForm((prev) => ({ ...prev, imageLink: link }));
                  // Update preview if it's a valid URL
                  if (link && !form.imageFile) {
                    setImagePreview(link);
                  } else if (!link && !form.imageFile) {
                    setImagePreview(null);
                  }
                }}
                placeholder="https://example.com/image.jpg hoặc path/to/image.jpg"
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-gray-400" />
                Tải lên hình ảnh (tùy chọn)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Revoke old object URL if exists
                      if (imagePreview && imagePreview.startsWith('blob:')) {
                        URL.revokeObjectURL(imagePreview);
                      }
                      setForm((prev) => ({ ...prev, imageFile: file }));
                      // Create preview URL for the file
                      const url = URL.createObjectURL(file);
                      setImagePreview(url);
                    }
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100
                    cursor-pointer"
                />
                {form.imageFile && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg flex items-center gap-2">
                    <ImageIcon className="text-purple-600" size={18} />
                    <span className="text-sm text-gray-700 font-medium flex-1 truncate">
                      {form.imageFile.name}
                    </span>
                    <button
                      onClick={() => {
                        // Revoke object URL if exists
                        if (imagePreview && imagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(imagePreview);
                        }
                        setForm((prev) => ({ ...prev, imageFile: null }));
                        // Reset preview to imageLink if exists
                        if (form.imageLink) {
                          setImagePreview(form.imageLink);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Image Preview Area */}
            {(imagePreview || form.imageLink || form.imageFile) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ImageIcon size={16} className="text-gray-400" />
                  Xem trước hình ảnh
                </label>
                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Hide image on error
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => {
                        // Revoke object URL if exists
                        if (imagePreview && imagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(imagePreview);
                        }
                        setImagePreview(null);
                        setForm((prev) => ({ ...prev, imageFile: null, imageLink: '' }));
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Xóa hình ảnh"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {submitLoading && (
              <div className="flex items-center justify-center gap-2 text-purple-600 py-2">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm">Đang xử lý...</span>
              </div>
            )}
          </div>
        )}
      </SimpleModal>

      <SimpleModal
        isOpen={Boolean(deleteModal)}
        onClose={() => setDeleteModal(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <span>Xác nhận xóa mục tiêu</span>
          </div>
        }
        footer={
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModal(null)}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200"
            >
              Hủy
            </Button>
            <Button
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg border-0"
              onClick={() => {
                if (deleteModal) {
                  handleDelete(deleteModal.id);
                }
              }}
            >
              <Trash2 size={18} className="mr-2 font-bold" />
              <span className="font-semibold">Xóa</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-gray-700">
              Bạn chắc chắn muốn xóa mục tiêu{" "}
              <span className="font-semibold text-gray-900">{deleteModal?.name || deleteModal?.title}</span>
              {deleteModal?.userName && (
                <> của <span className="font-semibold text-gray-900">{deleteModal.userName}</span></>
              )}?
            </p>
            <p className="text-sm text-red-600 mt-2 font-medium">
              ⚠️ Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>
      </SimpleModal>
    </div>
    </div>
  );
}
