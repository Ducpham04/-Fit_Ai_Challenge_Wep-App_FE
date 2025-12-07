import { useMemo, useState, useEffect } from "react";
import { SimpleButton as Button } from "@/components/ui/simple-button";
import { Plus, Dumbbell, BookOpen, Search, AlertCircle } from "lucide-react";
import { SimpleInput as Input } from "@/components/ui/simple-input";
import { SimpleModal } from "@/components/ui/simple-modal";
import { SimpleSelect } from "@/components/ui/simple-select";
import { FormField } from "@/components/ui/form-field";
import { SimpleTextarea as Textarea } from "@/components/ui/simple-textarea";
import { goalAPI, trainingPlanAPI } from "../api/adminAPI";
import {
  AdminTrainingPlan,
  TrainingPlanPayload,
} from "../types/admin-entities";
import { TrainingPlanDetailsPage } from "./TrainingPlanDetailsPage";
import { extractDataFromResponse, isResponseSuccess, getErrorMessage } from "../utils/responseHelper";

const EMPTY_PLAN: TrainingPlanPayload & { description?: string } = {
  title: "",
  durationWeeks: "",
  difficultyLevel: "beginner",
  subscribers: 0,
  price: 0,
  status: "draft",
  focusArea: "",
  goalId: 0,
  goalName: "",
  createAt: new Date().toISOString().slice(0, 10),
  description: "",
};

type ModalMode = "create" | "edit";

export function TrainingPlansPage() {
  const [trainingPlans, setTrainingPlans] = useState<AdminTrainingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [goals, setGoals] = useState<any[]>([]);

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: ModalMode;
    plan?: AdminTrainingPlan;
  }>({
    open: false,
    mode: "create",
  });
  const [form, setForm] = useState<TrainingPlanPayload & { description?: string }>(EMPTY_PLAN);
  const [deleteTarget, setDeleteTarget] = useState<AdminTrainingPlan | null>(
    null
  );
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailPlan, setDetailPlan] = useState<AdminTrainingPlan | null>(null);

  useEffect(() => {
    fetchTrainingPlans();
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
  try {
    const res = await goalAPI.getAll();
    console.log("Goal API raw response:", res);

    const goalArray = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

    // Chuyển `id` từ BE thành `goalId` để frontend dùng
    const sanitizedGoals = goalArray
      .filter((g) => g.id !== undefined && g.name)
      .map((g) => ({
        goalId: Number(g.id),
        name: g.name,
      }));

    console.log("Sanitized goals:", sanitizedGoals);
    setGoals(sanitizedGoals);
  } catch (err) {
    console.error("Cannot load goals", err);
    setGoals([]);
  }
};


  const fetchTrainingPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [TrainingPlansPage] Fetching training plans...");
      const response = await trainingPlanAPI.getAll();
      console.log("✅ [TrainingPlansPage] Full response:", response);
      
      // Extract data using helper function
      const rawData = extractDataFromResponse<any>(response);
      console.log("📋 [TrainingPlansPage] Extracted data:", rawData);
      
      // Map backend response (tpId) to frontend format (id)
      const data: AdminTrainingPlan[] = rawData.map((plan: any) => {
        const mappedPlan = {
          ...plan,
          id: plan.tpId || plan.id, // Backend uses tpId, prioritize tpId over id
        };
        console.log("📋 [TrainingPlansPage] Mapped plan:", {
          original: plan,
          mapped: mappedPlan,
          tpId: plan.tpId,
          id: plan.id,
          finalId: mappedPlan.id
        });
        return mappedPlan;
      });
      
      setTrainingPlans(data);
    } catch (error: any) {
      console.error(
        "❌ [TrainingPlansPage] Error fetching training plans:",
        error
      );
      setError(error?.response?.data?.message || error?.message || "Không thể tải danh sách training plans");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(EMPTY_PLAN);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (plan: AdminTrainingPlan) => {
    const { id, ...rest } = plan;
    setForm(rest);
    setError(null);
    setModalState({ open: true, mode: "edit", plan });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(EMPTY_PLAN);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);
      console.log(
        "📤 [TrainingPlansPage] Submitting training plan...",
        "Mode:",
        modalState.mode,
        "Data:",
        form
      );

      if (modalState.mode === "create") {
        console.log("➕ Creating new training plan");
        await trainingPlanAPI.create(form);
      } else if (modalState.plan) {
        console.log("✏️ Updating training plan ID:", modalState.plan.id);
        await trainingPlanAPI.update(modalState.plan.id, form);
      }

      console.log("✅ Training plan saved successfully");
      await fetchTrainingPlans();
      closeModal();
    } catch (error: any) {
      console.error(
        "❌ [TrainingPlansPage] Error saving training plan:",
        error
      );
      setError(error?.message || "Có lỗi xảy ra khi lưu training plan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setSubmitLoading(true);
      setError(null);
      
      // Ensure we have a valid ID
      if (!id || id === 0) {
        setError("ID không hợp lệ. Vui lòng thử lại.");
        return;
      }
      
      console.log("🗑️ [TrainingPlansPage] Deleting training plan ID:", id);
      console.log("🗑️ [TrainingPlansPage] Delete target:", deleteTarget);
      
      const response = await trainingPlanAPI.delete(id);
      console.log("📥 Delete response:", response);
      
      // Check if response is successful
      const isSuccess = isResponseSuccess(response);
      console.log("🔍 Response success check:", isSuccess, "Response data:", response?.data);
      
      if (!isSuccess) {
        const errorMsg = getErrorMessage(response, "Không thể xóa training plan. Vui lòng thử lại.");
        console.error("❌ API returned unsuccessful response:", {
          response,
          responseData: response?.data,
          success: response?.data?.success,
          message: response?.data?.message
        });
        setError(errorMsg);
        return; // Don't reload or close modal if delete failed
      }

      console.log("✅ Training plan deleted successfully, reloading data...");
      // Only reload and close modal if delete was successful
      await fetchTrainingPlans();
      setDeleteTarget(null);
    } catch (error: any) {
      console.error(
        "❌ [TrainingPlansPage] Error deleting training plan:",
        error
      );
      const errorMsg = error?.response?.data?.message 
        || error?.message 
        || "Không thể xóa training plan. Vui lòng thử lại.";
      setError(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return trainingPlans.filter((plan) => {
      const matchesSearch = (plan.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === "all"
          ? true
          : plan.difficultyLevel === difficultyFilter;
      const matchesStatus =
        statusFilter === "all" ? true : plan.status === statusFilter;
      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [trainingPlans, searchTerm, difficultyFilter, statusFilter]);

  return (
    <div className="relative">
      {detailPlan ? (
        <TrainingPlanDetailsPage
          plan={detailPlan}
          onBack={() => setDetailPlan(null)}
        />
      ) : (
        <div className="p-8 space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-600 uppercase tracking-wide">
                Training Plans
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Thư viện chương trình tập
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý pricing, độ khó và số người subscribe từng plan
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                Xuất CSV
              </Button>
              <Button
                className="flex items-center gap-2 px-4 py-2"
                onClick={openCreateModal}
              >
                <Plus size={16} />
                Plan mới
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PlanStat
              label="Tổng subscribers"
              value={trainingPlans.reduce(
                (sum, plan) => sum + plan.subscribers,
                0
              )}
            />
            <PlanStat
              label="Plan published"
              value={
                trainingPlans.filter((plan) => plan.status === "published")
                  .length
              }
            />
            <PlanStat
              label="Plan draft"
              value={
                trainingPlans.filter((plan) => plan.status === "draft").length
              }
            />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Tìm theo tên plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <SimpleSelect
              value={difficultyFilter}
              onChange={setDifficultyFilter}
              options={[
                { value: "all", label: "Tất cả độ khó" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
              className="w-full lg:w-[200px]"
            />
            <SimpleSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
              className="w-full lg:w-[200px]"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Thời lượng</th>
                  <th className="px-6 py-3 text-left">Độ khó</th>
                  <th className="px-6 py-3 text-left">Subscribers</th>
                  <th className="px-6 py-3 text-left">Giá</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Focus</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg">
                          <BookOpen size={18} className="text-sky-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {plan.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Cập nhật: {plan.createAt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {plan.durationWeeks} week
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${difficultyColor(
                          plan.difficultyLevel
                        )}`}
                      >
                        {plan.difficultyLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {Number(plan.subscribers).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${plan.price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          plan.status === "published"
                            ? "bg-green-100 text-green-700"
                            : plan.status === "draft"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {plan.focusArea}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailPlan(plan)}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(plan)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(plan)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Không có plan nào phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <SimpleModal
            isOpen={modalState.open}
            onClose={closeModal}
            title={
              modalState.mode === "create"
                ? "Tạo training plan"
                : "Cập nhật plan"
            }
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit}>
                  {modalState.mode === "create" ? "Tạo mới" : "Lưu thay đổi"}
                </Button>
              </div>
            }
          >
            <div className="grid gap-4">
              <FormField
                label="Tên plan"
                value={form.title}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, title: value }))
                }
                required
              />
              <SimpleSelect
  value={form.goalId ? String(form.goalId) : ""} // luôn là string
  onChange={(value) => {
    console.log("Selected goalId raw:", value); // value là string
    const num = Number(value); // convert sang number
    if (!isNaN(num)) {
      setForm((prev) => ({ ...prev, goalId: num })); // form.goalId luôn là number
    }
  }}
  options={goals.map((g) => ({
    value: String(g.goalId), // phải là string theo yêu cầu SimpleSelect
    label: g.name,
  }))}
  placeholder="Chọn mục đích tập luyện"
/>


              <FormField
                label="Thời lượng"
                value={form.durationWeeks}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, durationWeeks: value }))
                }
                placeholder="ví dụ: 30 ngày"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="min-h-[100px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Mô tả chi tiết về training plan..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Độ khó
                  </label>
                  <SimpleSelect
                    value={form.difficultyLevel}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        difficultyLevel:
                          value as TrainingPlanPayload["difficulty"],
                      }))
                    }
                    options={[
                      { value: "Beginner", label: "Beginner" },
                      { value: "Medium", label: "Medium" },
                      { value: "Advantage", label: "Advanced" },
                    ]}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  <SimpleSelect
                    value={form.status}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        status: value as TrainingPlanPayload["status"],
                      }))
                    }
                    options={[
                      { value: "published", label: "Published" },
                      { value: "draft", label: "Draft" },
                      { value: "archived", label: "Archived" },
                    ]}
                  />
                </div>
              </div>
              <FormField
                label="Focus area"
                value={form.focusArea}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, focusArea: value }))
                }
                placeholder="Ví dụ: Strength, Mobility..."
              />
              <FormField
                label="Ngày cập nhật"
                type="date"
                value={form.createAt}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, updatedAt: value }))
                }
              />
            </div>
          </SimpleModal>

          <SimpleModal
            isOpen={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            title="Xóa training plan"
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (deleteTarget) {
                      // Use tpId if available (backend format), otherwise use id
                      const idToDelete = (deleteTarget as any).tpId || deleteTarget.id;
                      console.log("🗑️ [TrainingPlansPage] Delete button clicked, ID to delete:", idToDelete, "Full deleteTarget:", deleteTarget);
                      handleDelete(idToDelete);
                    }
                  }}
                  disabled={submitLoading}
                >
                  {submitLoading ? "Đang xóa..." : "Xóa"}
                </Button>
              </div>
            }
          >
            <p className="text-gray-600">
              Bạn chắc chắn muốn xóa plan{" "}
              <span className="font-semibold">{deleteTarget?.title}</span>?
              Người dùng đang tham gia sẽ không còn truy cập được.
            </p>
          </SimpleModal>
        </div>
      )}
    </div>
  );
}

function difficultyColor(level: string) {
  switch (level) {
    case "beginner":
      return "bg-green-100 text-green-700";
    case "intermediate":
      return "bg-yellow-100 text-yellow-700";
    case "advanced":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function PlanStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
