import { useMemo, useState, useEffect } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Plus, Gift, Search, Filter, AlertCircle, Download, Calendar } from "lucide-react";
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

interface RewardClaim {
  id: number;
  userId: string;
  userName: string;
  rewardId: number;
  rewardName: string;
  pointsSpent: number;
  claimedAt: string;
  status: "completed" | "pending" | "cancelled";
}

const MOCK_REWARD_CLAIMS: RewardClaim[] = [
  {
    id: 1,
    userId: "user_001",
    userName: "Nguyễn Văn A",
    rewardId: 1,
    rewardName: "iPhone 15",
    pointsSpent: 5000,
    claimedAt: "2024-11-25",
    status: "completed",
  },
  {
    id: 2,
    userId: "user_002",
    userName: "Trần Thị B",
    rewardId: 2,
    rewardName: "Samsung Galaxy S24",
    pointsSpent: 4500,
    claimedAt: "2024-11-24",
    status: "completed",
  },
  {
    id: 3,
    userId: "user_003",
    userName: "Phạm Văn C",
    rewardId: 3,
    rewardName: "AirPods Pro",
    pointsSpent: 2000,
    claimedAt: "2024-11-23",
    status: "completed",
  },
  {
    id: 4,
    userId: "user_004",
    userName: "Lê Thị D",
    rewardId: 1,
    rewardName: "iPhone 15",
    pointsSpent: 5000,
    claimedAt: "2024-11-22",
    status: "pending",
  },
  {
    id: 5,
    userId: "user_005",
    userName: "Hoàng Văn E",
    rewardId: 4,
    rewardName: "iPad Pro",
    pointsSpent: 3500,
    claimedAt: "2024-11-21",
    status: "completed",
  },
  {
    id: 6,
    userId: "user_006",
    userName: "Võ Thị F",
    rewardId: 2,
    rewardName: "Samsung Galaxy S24",
    pointsSpent: 4500,
    claimedAt: "2024-11-20",
    status: "cancelled",
  },
  {
    id: 7,
    userId: "user_007",
    userName: "Đặng Văn G",
    rewardId: 5,
    rewardName: "MacBook Air",
    pointsSpent: 8000,
    claimedAt: "2024-11-19",
    status: "completed",
  },
];

const TAB_IDS = ["rewards", "history"] as const;
type TabId = (typeof TAB_IDS)[number];

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
  const [activeTab, setActiveTab] = useState<TabId>("rewards");
  const [claims, setClaims] = useState<RewardClaim[]>(MOCK_REWARD_CLAIMS);
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>("");
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

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesStatus = !claimStatusFilter || claim.status === claimStatusFilter;
      const claimDate = new Date(claim.claimedAt);
      const matchesDateStart = !dateRangeStart || claimDate >= new Date(dateRangeStart);
      const matchesDateEnd = !dateRangeEnd || claimDate <= new Date(dateRangeEnd);
      return matchesStatus && matchesDateStart && matchesDateEnd;
    });
  }, [claims, claimStatusFilter, dateRangeStart, dateRangeEnd]);

  const claimStats = useMemo(() => {
    const completed = filteredClaims.filter((c) => c.status === "completed").length;
    const pending = filteredClaims.filter((c) => c.status === "pending").length;
    const cancelled = filteredClaims.filter((c) => c.status === "cancelled").length;
    const totalPoints = filteredClaims.reduce((sum, c) => sum + c.pointsSpent, 0);
    return { completed, pending, cancelled, totalPoints };
  }, [filteredClaims]);

  const handleExportClaims = () => {
    const headers = ["ID", "User", "Reward", "Points", "Claimed Date", "Status"];
    const rows = filteredClaims.map((claim) => [
      claim.id,
      claim.userName,
      claim.rewardName,
      claim.pointsSpent,
      claim.claimedAt,
      claim.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reward-claims-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    console.log("✅ [RewardsPage] Exported claims as CSV");
  };

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
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={activeTab === "history" ? handleExportClaims : undefined}
          >
            <Download size={16} />
            {activeTab === "history" ? "Xuất CSV" : "Xuất báo cáo"}
          </Button>
          {activeTab === "rewards" && (
            <Button
              className="flex items-center gap-2 px-4 py-2"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              Thêm reward
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: "rewards" as TabId, label: "Rewards", icon: "🎁" },
            { id: "history" as TabId, label: "History", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <>
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
        </>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <RewardStat
              label="Completed Claims"
              value={claimStats.completed}
              description="Successfully redeemed"
            />
            <RewardStat
              label="Pending Claims"
              value={claimStats.pending}
              description="Awaiting processing"
            />
            <RewardStat
              label="Cancelled Claims"
              value={claimStats.cancelled}
              description="Cancelled redemptions"
            />
            <RewardStat
              label="Total Points Spent"
              value={claimStats.totalPoints.toLocaleString()}
              description="Across all claims"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                <input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <select
                  value={claimStatusFilter}
                  onChange={(e) => setClaimStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            {(dateRangeStart || dateRangeEnd || claimStatusFilter) && (
              <button
                onClick={() => {
                  setDateRangeStart("");
                  setDateRangeEnd("");
                  setClaimStatusFilter("");
                }}
                className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Claims Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reward</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Points</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Claimed Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClaims.map((claim, idx) => (
                  <tr key={claim.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{claim.userName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{claim.rewardName}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-purple-600">{claim.pointsSpent}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{claim.claimedAt}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          claim.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : claim.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClaims.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reward claims found</p>
            </div>
          )}
        </div>
      )}

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
