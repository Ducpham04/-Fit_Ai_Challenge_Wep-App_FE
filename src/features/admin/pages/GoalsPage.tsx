import { useMemo, useState, useEffect } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Plus, Target, Search, AlertCircle } from "lucide-react";
import { SimpleInput as Input } from "@/components_1/ui/simple-input";
import { SimpleModal } from "@/components_1/ui/simple-modal";
import { SimpleSelect } from "@/components_1/ui/simple-select";
import { FormField } from "@/components_1/ui/form-field";
import { SimpleTextarea as Textarea } from "@/components_1/ui/simple-textarea";
import { goalAPI } from "../api/adminAPI";
import { AdminGoal, GoalPayload } from "../types/admin-entities";

const DEFAULT_FORM: GoalPayload = {
  userId: "",
  userName: "",
  type: "weight",
  title: "",
  description: "",
  targetValue: 0,
  currentValue: 0,
  unit: "",
  status: "active",
  startDate: "",
  endDate: "",
};

type ModalMode = "create" | "edit";

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

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [GoalsPage] Fetching goals...");
      const response = await goalAPI.getAll();
      console.log("✅ [GoalsPage] Full response:", response);
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }
      console.log("📋 [GoalsPage] Extracted data:", data);
      setGoals(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ [GoalsPage] Error fetching goals:", error);
      setError(error?.message || "Không thể tải danh sách goals");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(DEFAULT_FORM);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (goal: AdminGoal) => {
    const { id, createdAt, progress, ...rest } = goal;
    setForm(rest);
    setError(null);
    setModalState({ open: true, mode: "edit", goal });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(DEFAULT_FORM);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);
      console.log("📤 [GoalsPage] Submitting goal...", "Mode:", modalState.mode, "Data:", form);
      
      if (modalState.mode === "create") {
        console.log("➕ Creating new goal");
        await goalAPI.create(form);
      } else if (modalState.goal) {
        console.log("✏️ Updating goal ID:", modalState.goal.id);
        await goalAPI.update(modalState.goal.id, form);
      }
      
      console.log("✅ Goal saved successfully");
      await fetchGoals();
      closeModal();
    } catch (error: any) {
      console.error("❌ [GoalsPage] Error saving goal:", error);
      setError(error?.message || "Có lỗi xảy ra khi lưu goal");
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
        return "text-blue-600 bg-blue-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "paused":
        return "text-yellow-600 bg-yellow-50";
      case "abandoned":
        return "text-gray-600 bg-gray-50";
      default:
        return "";
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "weight":
        return "bg-red-100 text-red-700";
      case "steps":
        return "bg-blue-100 text-blue-700";
      case "calories":
        return "bg-orange-100 text-orange-700";
      case "workout":
        return "bg-purple-100 text-purple-700";
      case "water":
        return "bg-cyan-100 text-cyan-700";
      case "sleep":
        return "bg-indigo-100 text-indigo-700";
      case "custom":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const stats = useMemo(() => {
    const total = goals.length;
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    return { total, active, completed };
  }, [goals]);

  return (
    <div className="p-8 space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
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
          <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Goals</p>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý mục tiêu người dùng</h1>
          <p className="text-gray-600 mt-2">Theo dõi và quản lý các mục tiêu sức khỏe, thể dục của người dùng</p>
        </div>
        <Button className="flex items-center gap-2 px-4 py-2" onClick={openCreateModal}>
          <Plus size={16} />
          Thêm mục tiêu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Tổng mục tiêu" value={stats.total} delta="+12% so với tuần trước" />
        <StatCard label="Mục tiêu đang hoạt động" value={stats.active} delta={`${Math.round((stats.active / stats.total) * 100)}% hoàn thành`} />
        <StatCard label="Mục tiêu hoàn thành" value={stats.completed} delta="Đạt thành công" />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm theo tên mục tiêu hoặc người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
          className="w-full lg:w-[180px]"
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
          className="w-full lg:w-[180px]"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Mục tiêu</th>
              <th className="px-6 py-3 text-left">Người dùng</th>
              <th className="px-6 py-3 text-left">Loại</th>
              <th className="px-6 py-3 text-left">Tiến độ</th>
              <th className="px-6 py-3 text-left">Trạng thái</th>
              <th className="px-6 py-3 text-left">Thời hạn</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((goal) => (
              <tr key={goal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{goal.title}</p>
                      <p className="text-sm text-gray-500">{goal.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900 font-medium">{goal.userName}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${typeColor(goal.type)}`}>
                    {goal.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{goal.endDate}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(goal)}>
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteModal(goal)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy mục tiêu nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SimpleModal
        isOpen={modalState.open}
        onClose={closeModal}
        title={modalState.mode === "create" ? "Thêm mục tiêu mới" : "Chỉnh sửa mục tiêu"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {modalState.mode === "create" ? "Tạo mục tiêu" : "Lưu thay đổi"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="User ID"
              value={form.userId}
              onChange={(value) => setForm((prev) => ({ ...prev, userId: value }))}
              required
              placeholder="USR-001"
            />
            <FormField
              label="Tên người dùng"
              value={form.userName}
              onChange={(value) => setForm((prev) => ({ ...prev, userName: value }))}
              required
              placeholder="Nguyễn Văn A"
            />
          </div>
          <FormField
            label="Tiêu đề"
            value={form.title}
            onChange={(value) => setForm((prev) => ({ ...prev, title: value }))}
            required
            placeholder="Giảm cân 5kg"
          />
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="min-h-[80px]"
              placeholder="Mô tả chi tiết mục tiêu..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Loại</label>
              <SimpleSelect
                value={form.type}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value as any }))
                }
                options={[
                  { value: "weight", label: "Giảm cân" },
                  { value: "steps", label: "Bước chân" },
                  { value: "calories", label: "Calo" },
                  { value: "workout", label: "Tập luyện" },
                  { value: "water", label: "Nước" },
                  { value: "sleep", label: "Giấc ngủ" },
                  { value: "custom", label: "Tùy chỉnh" },
                ]}
              />
            </div>
            <FormField
              label="Đơn vị (kg, bước, kcal, ...)"
              value={form.unit}
              onChange={(value) => setForm((prev) => ({ ...prev, unit: value }))}
              required
              placeholder="kg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Giá trị mục tiêu"
              type="number"
              value={String(form.targetValue)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  targetValue: Number(value) || 0,
                }))
              }
              required
            />
            <FormField
              label="Giá trị hiện tại"
              type="number"
              value={String(form.currentValue)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  currentValue: Number(value) || 0,
                }))
              }
              required
            />
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <SimpleSelect
                value={form.status}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value as any }))
                }
                options={[
                  { value: "active", label: "Đang hoạt động" },
                  { value: "completed", label: "Hoàn thành" },
                  { value: "paused", label: "Tạm dừng" },
                  { value: "abandoned", label: "Bỏ cuộc" },
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Ngày bắt đầu"
              type="date"
              value={form.startDate}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, startDate: value }))
              }
            />
            <FormField
              label="Ngày kết thúc"
              type="date"
              value={form.endDate}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, endDate: value }))
              }
            />
          </div>
        </div>
      </SimpleModal>

      <SimpleModal
        isOpen={Boolean(deleteModal)}
        onClose={() => setDeleteModal(null)}
        title="Xóa mục tiêu"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteModal(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteModal) {
                  handleDelete(deleteModal.id);
                }
              }}
            >
              Xóa
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Bạn chắc chắn muốn xóa mục tiêu{" "}
          <span className="font-semibold">{deleteModal?.title}</span> của{" "}
          <span className="font-semibold">{deleteModal?.userName}</span>? Hành động này không thể hoàn tác.
        </p>
      </SimpleModal>
    </div>
  );
}

function StatCard({ label, value, delta }: { label: string; value: number; delta: string }) {
  return (
    <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{delta}</p>
    </div>
  );
}
