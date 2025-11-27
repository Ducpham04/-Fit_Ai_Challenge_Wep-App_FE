import { useMemo, useState, useEffect } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Plus, Gift, Search, Filter, AlertCircle } from "lucide-react";
import { SimpleInput as Input } from "@/components_1/ui/simple-input";
import { SimpleModal } from "@/components_1/ui/simple-modal";
import { SimpleSelect } from "@/components_1/ui/simple-select";
import { FormField } from "@/components_1/ui/form-field";
import { SimpleTextarea as Textarea } from "@/components_1/ui/simple-textarea";
import { rewardAPI } from "../api/adminAPI";
import {
  AdminReward,
  RewardPayload,
} from "../types/admin-entities";

const EMPTY_REWARD_FORM: RewardPayload = {
  name: "",
  description: "",
  points: 0,
  linkImage: "",
  claimed: 0,
  total: 0,
  status: "active",
  expiresAt: "",
  imageFile: null,
};

type ModalMode = "create" | "edit";

export function RewardsPage() {
  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState<{ open: boolean; mode: ModalMode; reward?: AdminReward }>({
    open: false,
    mode: "create",
  });
  const [form, setForm] = useState<RewardPayload>(EMPTY_REWARD_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminReward | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [RewardsPage] Fetching rewards...");
      const response = await rewardAPI.getAll();
      console.log("✅ [RewardsPage] Full response:", response);
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }
      console.log("📋 [RewardsPage] Extracted data:", data);
      setRewards(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ [RewardsPage] Error fetching rewards:", error);
      setError(error?.message || "Không thể tải danh sách rewards");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(EMPTY_REWARD_FORM);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (reward: AdminReward) => {
    const { id, ...rest } = reward;
    setForm(rest);
    setError(null);
    setModalState({ open: true, mode: "edit", reward });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(EMPTY_REWARD_FORM);
    setError(null);
  };

 const handleSubmit = async () => {
  try {
    setSubmitLoading(true);
    setError(null);
    console.log("📤 [RewardsPage] Submitting reward...", "Mode:", modalState.mode, "Data:", form);

    // Tạo FormData để gửi JSON + file
    const fd = new FormData();
    // Chuyển payload thành JSON string
    fd.append("reward", JSON.stringify(form));
    // Nếu có file (image) attach
    if (form.imageFile instanceof File) {
      fd.append("file", form.imageFile);
    }

    if (modalState.mode === "create") {
      console.log("➕ Creating new reward with file");
      await rewardAPI.create(fd); // thêm param isFormData
    } else if (modalState.reward) {
      console.log("✏️ Updating reward ID:", modalState.reward.id);
      await rewardAPI.update(modalState.reward.id, fd);
    }

    console.log("✅ Reward saved successfully");
    await fetchRewards();
    closeModal();
  } catch (error: any) {
    console.error("❌ [RewardsPage] Error saving reward:", error);
    setError(error?.message || "Có lỗi xảy ra khi lưu reward");
  } finally {
    setSubmitLoading(false);
  }
};

  const APIURL = "http://localhost:8080/"
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      console.log("🗑️ [RewardsPage] Deleting reward ID:", id);
      await rewardAPI.delete(id);
      console.log("✅ Reward deleted successfully");
      await fetchRewards();
      setDeleteTarget(null);
    } catch (error: any) {
      console.error("❌ [RewardsPage] Error deleting reward:", error);
      setError(error?.message || "Không thể xóa reward");
    }
  };

  const filtered = useMemo(() => {
    return rewards.filter((reward) => {
      const matchesSearch = reward.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : reward.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rewards, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalRewards = rewards.length;
    const activeRewards = rewards.filter((r) => r.status === "active").length;
    const totalClaims = rewards.reduce((sum, r) => sum + r.claimed, 0);
    const totalInventory = rewards.reduce((sum, r) => sum + r.total, 0);
    return {
      totalRewards,
      activeRewards,
      claimRate:
        totalInventory === 0
          ? 0
          : Math.round((totalClaims / totalInventory) * 100),
    };
  }, [rewards]);

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
          <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">
            Rewards
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Kho phần thưởng</h1>
          <p className="text-gray-600 mt-2">
            Quản lý quà tặng, voucher, ưu đãi đổi bằng điểm
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            Xuất báo cáo
          </Button>
          <Button
            className="flex items-center gap-2 px-4 py-2"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Thêm reward
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RewardStat
          label="Reward đang mở"
          value={stats.activeRewards}
          description="Có thể đổi ngay"
        />
        <RewardStat
          label="Tổng kho"
          value={stats.totalRewards}
          description="Bao gồm cả inactive"
        />
        <RewardStat
          label="Tỷ lệ đổi thành công"
          value={`${stats.claimRate}%`}
          description="Claim / Inventory"
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Tìm theo tên reward..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <SimpleSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "active", label: "Đang mở" },
            { value: "inactive", label: "Tạm khóa" },
          ]}
          className="w-full lg:w-[220px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((reward) => {
          const progress = Math.min(
            100,
            Math.round((reward.claimed / reward.total) * 100)
          );
          return (
            <div
              key={reward.id}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Gift size={24} className="text-purple-600" />
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    reward.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {reward.status}
                </span>
              </div>
              <div style={{ width: '100%' , height: 150, overflow: 'hidden' }}>
  <img
    src={APIURL + reward.linkImage}
    alt="ảnh reward"
    style={{
      width: '100%%',
      height: '100%',
      objectFit: 'cover', // "cover" sẽ cắt vừa khung, "contain" sẽ giữ tỉ lệ ảnh
    }}
  />
</div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {reward.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {reward.description}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Điểm cần có</span>
                  <span className="font-semibold text-gray-900">
                    {reward.points}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Đã đổi</span>
                  <span className="font-semibold text-gray-900">
                    {reward.claimed} / {reward.total}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Hết hạn</span>
                  <span className="font-medium text-gray-900">
                    {reward.expiresAt}
                  </span>
                </div>
              </div>
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress}% tồn kho đã được đổi
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditModal(reward)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(reward)}
                >
                  Xóa
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
            Chưa có reward nào phù hợp bộ lọc hiện tại.
          </div>
        )}
      </div>

      <SimpleModal
        isOpen={modalState.open}
        onClose={closeModal}
        title={modalState.mode === "create" ? "Tạo reward" : "Cập nhật reward"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
            >
              {modalState.mode === "create" ? "Tạo mới" : "Lưu thay đổi"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <FormField
            label="Tên reward"
            value={form.name}
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
            required
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
              className="min-h-[100px]"
            />
          </div><div className="grid gap-2">
  <label className="text-sm font-medium text-gray-700">
    Ảnh reward
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0] || null;
      setForm((prev) => ({ ...prev, imageFile: file }));
    }}
  />
  {form.imageFile && (
    <p className="text-xs text-gray-500 mt-1">
      Chọn file: {form.imageFile.name}
    </p>
  )}
</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Điểm yêu cầu"
              type="number"
              value={String(form.points)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  points: Number(value) || 0,
                }))
              }
            />
            <FormField
              label="Tổng số lượng"
              type="number"
              value={String(form.total)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  total: Number(value) || 0,
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Đã được đổi"
              type="number"
              value={String(form.claimed)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  claimed: Number(value) || 0,
                }))
              }
            />
            <FormField
              label="Ngày hết hạn"
              type="date"
              value={form.expiresAt}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, expiresAt: value }))
              }
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
                  status: value as RewardPayload["status"],
                }))
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>
        </div>
      </SimpleModal>

      <SimpleModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Xóa reward"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget.id);
                }
              }}
            >
              Xóa
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Bạn chắc chắn muốn xóa reward{" "}
          <span className="font-semibold">{deleteTarget?.name}</span>? Người dùng
          sẽ không thể tiếp tục đổi phần thưởng này.
        </p>
      </SimpleModal>
    </div>
  );
}

function RewardStat({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
}
