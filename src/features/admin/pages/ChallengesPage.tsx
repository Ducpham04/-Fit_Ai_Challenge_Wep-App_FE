import { useMemo, useState, useEffect, useCallback } from "react";
import { Plus, Dumbbell, Search, Filter, AlertCircle } from "lucide-react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { SimpleInput as Input } from "@/components_1/ui/simple-input";
import { SimpleModal } from "@/components_1/ui/simple-modal";
import { SimpleSelect } from "@/components_1/ui/simple-select";
import { FormField } from "@/components_1/ui/form-field";
import { SimpleTextarea as Textarea } from "@/components_1/ui/simple-textarea";
import { challengeAPI } from "../api/adminAPI";
import { AdminChallenge, ChallengePayload } from "../types/admin-entities";

const DEFAULT_FORM: ChallengePayload = {
  title: "",
  description: "",
  linkVideos: "",
  status: "draft",
  difficult: "",
  videoFile: null,
};

type ModalMode = "create" | "edit";
const baseURL = "http://localhost:8080/";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: ModalMode;
    challenge?: AdminChallenge;
  }>({
    open: false,
    mode: "create",
  });
  
  const [form, setForm] = useState<ChallengePayload>(DEFAULT_FORM);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<AdminChallenge | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Cleanup video preview URL
  useEffect(() => {
    return () => {
      if (videoPreview && videoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await challengeAPI.getAll();
      const data: AdminChallenge[] = response.data.data || [];
      
      const normalized = data.map((c) => ({
        ...c,
        status: c.status || "draft",
        difficult: c.difficult || "beginner",
      }));
      
      setChallenges(normalized);
    } catch (err) {
      console.error("Error fetching challenges:", err);
      setError("Không thể tải danh sách challenges. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(DEFAULT_FORM);
    setVideoPreview(null);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (challenge: AdminChallenge) => {
    const { id, ...rest } = challenge;
    setForm({ ...rest, videoFile: null });
    
    // Set preview cho video hiện có
    setVideoPreview(challenge.linkVideos ? baseURL + challenge.linkVideos : null);
    setError(null);
    setModalState({ open: true, mode: "edit", challenge });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(DEFAULT_FORM);
    setVideoPreview(null);
    setError(null);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 2000 * 1024 * 1024) {
        setError("Video không được vượt quá 50MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError("Chỉ chấp nhận file video");
        return;
      }

      setForm((prev) => ({ ...prev, videoFile: file }));
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      setError("Vui lòng nhập tên challenge");
      return false;
    }
    if (!form.description.trim()) {
      setError("Vui lòng nhập mô tả");
      return false;
    }
    if (!form.difficult) {
      setError("Vui lòng chọn độ khó");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) console.log("File eerror " );

    try {
      setSubmitLoading(true);
      setError(null);
      
      // ✅ Pass object to API - API will create FormData
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        difficult: form.difficult,
        videoFile: form.videoFile,
      };

      console.log("📤 Submitting challenge...");
      console.log("Mode:", modalState.mode);
      console.log("Payload:", payload);
      console.log("Has video:", !!form.videoFile);
      
      if (modalState.mode === "create") {
        await challengeAPI.create(payload);
      } else if (modalState.challenge) {
        await challengeAPI.update(modalState.challenge.id, payload);
      }

      await fetchChallenges();
      closeModal();
    } catch (err: any) {
      console.error("❌ Error saving challenge:", err);
      const errorMsg = err?.response?.data?.message 
        || err?.message 
        || "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await challengeAPI.delete(id);
      await fetchChallenges();
      setDeleteModal(null);
    } catch (err) {
      console.error("Error deleting challenge:", err);
      setError("Không thể xóa challenge. Vui lòng thử lại.");
    }
  };

  const filtered = useMemo(() => {
    return challenges.filter((challenge) => {
      const name = challenge.title || "";
      const description = challenge.description || "";
      const matchesSearch =
        name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        description.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : challenge.status.toLowerCase() === statusFilter.toLowerCase();
      
      const matchesDifficulty =
        difficultyFilter === "all"
          ? true
          : challenge.difficult.toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [challenges, debouncedSearch, statusFilter, difficultyFilter]);

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "active":
        return "text-green-600 bg-green-50";
      case "inactive":
        return "text-gray-600 bg-gray-50";
      case "complete":
      case "completed":
        return "text-blue-600 bg-blue-50";
      
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const challengeStats = useMemo(() => {
    const total = challenges.length;
    const active = challenges.filter(
      (c) => c.status.toLowerCase() === "active"
    ).length;
    const completed = challenges.filter(
      (c) => c.status.toLowerCase() === "complete" || c.status.toLowerCase() === "completed"
    ).length;

    return { total, active, completed };
  }, [challenges]);

  return (
    <main className="p-8 space-y-8 relative">
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

      <div
        className={`transition ${
          modalState.open ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              Challenges
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý thử thách
            </h1>
            <p className="text-gray-600 mt-2">
              Kiểm soát danh sách challenge, người tham gia và phần thưởng
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              Tải bộ lọc
            </Button>
            <Button
              className="flex items-center gap-2 px-4 py-2"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              Challenge mới
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Tổng số challenge"
            value={challengeStats.total}
            delta="+4 tuần này"
          />
          <StatCard
            label="Đang hoạt động"
            value={challengeStats.active}
            delta={`${challengeStats.total > 0 ? Math.round((challengeStats.active / challengeStats.total) * 100) : 0}% tổng`}
          />
          <StatCard
            label="Hoàn thành"
            value={challengeStats.completed}
            delta="+2 tuần trước"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Tìm theo tên, mô tả..."
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
              { value: "draft", label: "Draft" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "complete", label: "Completed" },
            ]}
            className="w-full lg:w-[200px]"
          />
          <SimpleSelect
            value={difficultyFilter}
            onChange={setDifficultyFilter}
            options={[
              { value: "all", label: "Tất cả cấp độ" },
              { value: "beginer", label: "Beginner" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
            className="w-full lg:w-[200px]"
          />
        </div>

        {/* Challenge Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-3">Challenge</th>
                  <th className="px-6 py-3">Videos</th>
                  <th className="px-6 py-3">Độ khó</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Điều chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((challenge) => (
                  <tr
                    key={challenge.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Dumbbell size={18} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {challenge.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {challenge.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {challenge.linkVideos ? (
                        <div className="relative group">
                          <video
                            width={160}
                            height={90}
                            className="rounded-lg border border-gray-200"
                            preload="metadata"
                          >
                            <source
                              src={baseURL + challenge.linkVideos}
                              type="video/mp4"
                            />
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                          </video>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                              Click để xem
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Chưa có video</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700 capitalize">
                        {challenge.difficult}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(
                          challenge.status
                        )}`}
                      >
                        {challenge.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(challenge)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteModal(challenge)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Không có challenge nào phù hợp tiêu chí tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalState.open && (
        <SimpleModal
          isOpen={modalState.open}
          onClose={closeModal}
          title={
            modalState.mode === "create"
              ? "Thêm challenge mới"
              : "Cập nhật challenge"
          }
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={submitLoading}>
                {submitLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xử lý...
                  </span>
                ) : modalState.mode === "create" ? (
                  "Tạo challenge"
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>
          }
        >
          <div className="grid gap-4">
            <FormField
              label="Tên challenge"
              value={form.title}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, title: value }))
              }
              required
              placeholder="Nhập tên thử thách"
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
                placeholder="Mô tả nội dung thử thách..."
              />
            </div>

            {/* Video Input with Preview */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">
                Video hướng dẫn
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="border rounded-lg p-2"
              />
              
              {videoPreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Xem trước:</p>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-64 rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <SimpleSelect
                  value={form.status}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: value as ChallengePayload["status"],
                    }))
                  }
                  options={[
                    
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                    
                  ]}
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Độ khó <span className="text-red-500">*</span>
                </label>
                <SimpleSelect
                  value={form.difficult}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      difficult: value as ChallengePayload["difficult"],
                    }))
                  }
                  options={[
                    { value: "EASY", label: "Easy" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "HARD", label: "Hard" },
                  ]}
                />
              </div>
            </div>
          </div>
        </SimpleModal>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <SimpleModal
          isOpen={Boolean(deleteModal)}
          onClose={() => setDeleteModal(null)}
          title="Xóa challenge"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteModal.id)}
              >
                Xóa
              </Button>
            </div>
          }
        >
          <p className="text-gray-600">
            Bạn chắc chắn muốn xóa challenge{" "}
            <span className="font-semibold">{deleteModal.title}</span>? Hành
            động này không thể hoàn tác.
          </p>
        </SimpleModal>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: number;
  delta: string;
}) {
  return (
    <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{delta}</p>
    </div>
  );
}