import { useMemo, useState, useEffect } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Plus, Leaf, Search, AlertCircle } from "lucide-react";
import { SimpleInput as Input } from "@/components_1/ui/simple-input";
import { SimpleModal } from "@/components_1/ui/simple-modal";
import { FormField } from "@/components_1/ui/form-field";
import { foodAPI } from "../api/adminAPI";
import { AdminFood, FoodPayload } from "../types/admin-entities";

const EMPTY_FOOD: FoodPayload = {
  name: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  serving: 100,
};

type ModalMode = "create" | "edit";

export function FoodsPage() {
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: ModalMode;
    food?: AdminFood;
  }>({
    open: false,
    mode: "create",
  });
  const [form, setForm] = useState<FoodPayload>(EMPTY_FOOD);
  const [deleteTarget, setDeleteTarget] = useState<AdminFood | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [FoodsPage] Fetching foods...");
      const response = await foodAPI.getAll();
      console.log("✅ [FoodsPage] Full response:", response);
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }
      console.log("📋 [FoodsPage] Extracted data:", data);
      setFoods(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ [FoodsPage] Error fetching foods:", error);
      setError(error?.message || "Không thể tải danh sách foods");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(EMPTY_FOOD);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (food: AdminFood) => {
    const { id, ...rest } = food;
    setForm(rest);
    setError(null);
    setModalState({ open: true, mode: "edit", food });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(EMPTY_FOOD);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);
      console.log("📤 [FoodsPage] Submitting food...", "Mode:", modalState.mode, "Data:", form);
      
      if (modalState.mode === "create") {
        console.log("➕ Creating new food");
        await foodAPI.create(form);
      } else if (modalState.food) {
        console.log("✏️ Updating food ID:", modalState.food.id);
        await foodAPI.update(modalState.food.id, form);
      }
      
      console.log("✅ Food saved successfully");
      await fetchFoods();
      closeModal();
    } catch (error: any) {
      console.error("❌ [FoodsPage] Error saving food:", error);
      setError(error?.message || "Có lỗi xảy ra khi lưu food");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      console.log("🗑️ [FoodsPage] Deleting food ID:", id);
      await foodAPI.delete(id);
      console.log("✅ Food deleted successfully");
      await fetchFoods();
      setDeleteTarget(null);
    } catch (error: any) {
      console.error("❌ [FoodsPage] Error deleting food:", error);
      setError(error?.message || "Không thể xóa food");
    }
  };

  const filtered = useMemo(() => {
    return foods.filter((food) =>
      (food.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [foods, searchTerm]);

  const nutrientTotals = useMemo(() => {
    if (foods.length === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }
    return foods.reduce(
      (acc, food) => ({
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  }, [foods]);

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
          <p className="text-sm font-medium text-lime-600 uppercase tracking-wide">
            Foods
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            CSDL nguyên liệu & thực phẩm
          </h1>
          <p className="text-gray-600 mt-2">
            Chuẩn hóa dữ liệu dinh dưỡng để dùng lại trên meal plan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
           
            Đồng bộ USFDA
          </Button>
          <Button
            className="flex items-center gap-2 px-4 py-2"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Thêm thực phẩm
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NutrientCard label="Protein tổng" value={`${nutrientTotals.protein} g`} />
        <NutrientCard label="Carbs tổng" value={`${nutrientTotals.carbs} g`} />
        <NutrientCard label="Fat tổng" value={`${nutrientTotals.fat} g`} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Tìm theo tên thực phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Tên thực phẩm</th>
              <th className="px-6 py-3 text-left">Khẩu phần</th>
              <th className="px-6 py-3 text-left">Calories</th>
              <th className="px-6 py-3 text-left">Protein</th>
              <th className="px-6 py-3 text-left">Carbs</th>
              <th className="px-6 py-3 text-left">Fat</th>
              <th className="px-6 py-3 text-left">Fiber</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((food) => (
              <tr key={food.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Leaf size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{food.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">100g</td>
                <td className="px-6 py-4 text-gray-900">{food.calories} kcal</td>
                <td className="px-6 py-4 text-gray-900">{food.protein} g</td>
                <td className="px-6 py-4 text-gray-900">{food.carbs} g</td>
                <td className="px-6 py-4 text-gray-900">{food.fat} g</td>
                <td className="px-6 py-4 text-gray-900">{food.fiber} g</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(food)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteTarget(food)}
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
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SimpleModal
        isOpen={modalState.open}
        onClose={closeModal}
        title={modalState.mode === "create" ? "Thêm thực phẩm" : "Cập nhật thực phẩm"}
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
            label="Tên thực phẩm"
            value={form.name}
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
            required
          />
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Calories"
              type="number"
              value={String(form.calories)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  calories: Number(value) || 0,
                }))
              }
            />
            <FormField
              label="Protein (g)"
              type="number"
              value={String(form.protein)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  protein: Number(value) || 0,
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Carbs (g)"
              type="number"
              value={String(form.carbs)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  carbs: Number(value) || 0,
                }))
              }
            />
            <FormField
              label="Fat (g)"
              type="number"
              value={String(form.fat)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  fat: Number(value) || 0,
                }))
              }
            />
          </div>
          <FormField
            label="Fiber (g)"
            type="number"
            value={String(form.fiber)}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                fiber: Number(value) || 0,
              }))
            }
          />
        </div>
      </SimpleModal>

      <SimpleModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Xóa thực phẩm"
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
          Xóa thực phẩm{" "}
          <span className="font-semibold">{deleteTarget?.name}</span>? Dữ liệu
          liên quan trong meal plan sẽ cần cập nhật thủ công.
        </p>
      </SimpleModal>
    </div>
  );
}

function NutrientCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
