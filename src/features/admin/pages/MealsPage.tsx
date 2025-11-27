// src/pages/admin/MealsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { SimpleInput as Input } from "@/components_1/ui/simple-input";
import { SimpleModal } from "@/components_1/ui/simple-modal";
import { SimpleSelect } from "@/components_1/ui/simple-select";
import { FormField } from "@/components_1/ui/form-field";
import { Plus, Search, AlertCircle, Trash, Edit, PlusCircle, Apple } from "lucide-react";

import { mealAPI } from "../api/adminAPI";
import { foodAPI } from "../api/adminAPI";
import {
  AdminMeal,
  MealPayload,
  MealResponse,
  MealFoodResponse,
  FoodOption,
} from "../types/admin-entities";

type ModalMode = "create" | "edit";

const EMPTY_FORM: MealPayload = {
  name: "",
  description: "",
  mealType: "breakfast",
  caloriesEstimate: 0,
  nutritionPlanId: 0,
  foods: [],
};

export  function MealsPage() {
  const [meals, setMeals] = useState<MealResponse[]>([]);
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingMeal, setEditingMeal] = useState<MealResponse | null>(null);

  const [form, setForm] = useState<MealPayload>(EMPTY_FORM);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MealResponse | null>(null);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);

  // fetch meals + foods
  useEffect(() => {
    fetchFoods();
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mealAPI.getAll();
      // backend might wrap in { data: ... } or return array; normalize:
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setMeals(data);
    } catch (e: any) {
      console.error(e);
      setError("Không thể tải danh sách meals");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await foodAPI.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setFoods(data);
    } catch (e) {
      console.error(e);
      // foods optional; ignore error but show console
    }
  };

  // open create
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingMeal(null);
    setModalMode("create");
    setModalOpen(true);
    setError(null);
  };

  // open edit - load meal into form (convert mealFoods -> foods payload)
  const openEdit = (meal: MealResponse) => {
    const payload: MealPayload = {
      name: meal.name,
      description: meal.description,
      mealType: meal.mealType,
      caloriesEstimate: meal.caloriesEstimate,
      nutritionPlanId: meal.nutritionPlanId,
      foods: meal.foods?.map((mf) => ({ foodId: mf.foodId, quantityG: mf.quantityG })) ?? [],
    };
    setForm(payload);
    setEditingMeal(meal);
    setModalMode("edit");
    setModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setEditingMeal(null);
    setError(null);
  };

  // add a selected food entry to form.foods
  const addFoodToForm = (foodId: number, quantityG = 100) => {
    if (!foodId) return;
    // prevent duplicate food - if exists, update quantity instead
    setForm((prev) => {
      const exists = prev.foods.find((f) => f.foodId === foodId);
      if (exists) {
        return {
          ...prev,
          foods: prev.foods.map((f) =>
            f.foodId === foodId ? { ...f, quantityG: f.quantityG + quantityG } : f
          ),
        };
      }
      return { ...prev, foods: [...prev.foods, { foodId, quantityG }] };
    });
  };

  const updateFoodQuantityInForm = (foodId: number, quantityG: number) => {
    setForm((prev) => ({
      ...prev,
      foods: prev.foods.map((f) => (f.foodId === foodId ? { ...f, quantityG } : f)),
    }));
  };

  const removeFoodFromForm = (foodId: number) => {
    setForm((prev) => ({ ...prev, foods: prev.foods.filter((f) => f.foodId !== foodId) }));
  };

  // submit create / update
  const handleSubmit = async () => {
    // basic validation
    if (!form.name?.trim()) {
      setError("Tên bữa ăn không được để trống");
      return;
    }
    if (!form.mealType) {
      setError("Vui lòng chọn loại bữa");
      return;
    }
    if (!form.nutritionPlanId || form.nutritionPlanId <= 0) {
      setError("Vui lòng chọn nutrition plan hợp lệ (nutritionPlanId)");
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);

      // send payload exactly as BE expects (MealPayload contains foods[])
      if (modalMode === "create") {
        await mealAPI.create(form);
      } else if (modalMode === "edit" && editingMeal) {
        await mealAPI.update(editingMeal.mealId, form);
      }

      await fetchMeals();
      closeModal();
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Lỗi khi lưu bữa ăn");
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setConfirmDeleteLoading(true);
      await mealAPI.delete(deleteTarget.mealId);
      await fetchMeals();
      setDeleteTarget(null);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể xóa");
    } finally {
      setConfirmDeleteLoading(false);
    }
  };

  // filter + search
  const filtered = useMemo(() => {
    const lower = searchTerm?.toLowerCase() ?? "";
    return meals.filter((m) => {
      const matchesSearch = m.name?.toLowerCase()?.includes(lower) || m.description?.toLowerCase()?.includes(lower);
      const matchesCategory = categoryFilter === "all" ? true : m.mealType === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [meals, searchTerm, categoryFilter]);

  // compute macros for dashboard from mealFoods
  const macros = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        meal.foods?.forEach((mf) => {
          acc.calories += mf.totalCalories ?? 0;
      
          acc.protein += mf.totalProtein ?? 0;
         
          acc.carbs += mf.totalCarbs ?? 0;
          acc.fat += mf.totalFat ?? 0;
        });
        console.log("Calories: ",acc.calories , acc.protein , meal.foods)

        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  // helper map foodId -> FoodOption
  const foodMap = useMemo(() => {
    const map = new Map<number, FoodOption>();
    foods.forEach((f) => map.set(f.id, f));
    return map;
  }, [foods]);

  return (
    <div className="p-8 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Meals</p>
          <h1 className="text-3xl font-bold text-gray-900">Thực đơn dinh dưỡng</h1>
          <p className="text-gray-600 mt-2">Theo dõi macro và tổ chức bữa ăn cho người dùng</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => { /* TODO: import CSV */ }}>
            Import CSV
          </Button>
          <Button className="flex items-center gap-2 px-4 py-2" onClick={openCreate}>
            <Plus size={16} /> Thêm meal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MacroCard label="Tổng calories" value={`${macros.calories} kcal`} />
        <MacroCard label="Protein" value={`${macros.protein} g`} />
        <MacroCard label="Carbs" value={`${macros.carbs} g`} />
        <MacroCard label="Fat" value={`${macros.fat} g`} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Tìm theo tên hoặc mô tả..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        <SimpleSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: "all", label: "Tất cả loại bữa" },
            { value: "breakfast", label: "Breakfast" },
            { value: "lunch", label: "Lunch" },
            { value: "dinner", label: "Dinner" },
            { value: "snack", label: "Snack" },
          ]}
          className="w-full lg:w-[200px]"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Bữa ăn</th>
              <th className="px-6 py-3 text-left">Loại</th>
              <th className="px-6 py-3 text-left">Calories</th>
              <th className="px-6 py-3 text-left">Protein</th>
              <th className="px-6 py-3 text-left">Carbs</th>
              <th className="px-6 py-3 text-left">Fat</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((meal) => {
              const totalProtein = meal.foods?.reduce((s, f) => s + (f.totalProtein ?? 0), 0) ?? 0;
              const totalCarbs = meal.foods?.reduce((s, f) => s + (f.totalCarbs ?? 0), 0) ?? 0;
              const totalFat = meal.foods?.reduce((s, f) => s + (f.totalFat ?? 0), 0) ?? 0;
              return (
                <tr key={meal.mealId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-lime-100 rounded-lg">
                        <Apple size={18} className="text-lime-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{meal.name}</p>
                        <p className="text-xs text-gray-500">{meal.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${categoryColor(meal.mealType)}`}>
                      {meal.mealType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{meal.caloriesEstimate ?? (meal.foods?.reduce((s, f) => s + (f.totalCalories ?? 0), 0) ?? 0)} kcal</td>
                  <td className="px-6 py-4 text-gray-900">{totalProtein.toFixed(1)} g</td>
                  <td className="px-6 py-4 text-gray-900">{totalCarbs.toFixed(1)} g</td>
                  <td className="px-6 py-4 text-gray-900">{totalFat.toFixed(1)} g</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(meal)}>
                      <Edit size={14} /> Sửa
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(meal)}>
                      <Trash size={14} /> Xóa
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy bữa ăn nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      <SimpleModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Thêm bữa ăn" : "Chỉnh sửa bữa ăn"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={submitLoading}>
              {modalMode === "create" ? "Tạo mới" : "Lưu thay đổi"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <FormField label="Tên bữa ăn" value={form.name} onChange={(v: string) => setForm((p) => ({ ...p, name: v }))} required />
          <FormField label="Mô tả" value={form.description} onChange={(v: string) => setForm((p) => ({ ...p, description: v }))} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Calories estimate" type="number" value={String(form.caloriesEstimate)} onChange={(v: string) => setForm((p) => ({ ...p, caloriesEstimate: Number(v) || 0 }))} />
            <FormField label="Nutrition Plan ID" type="number" value={String(form.nutritionPlanId)} onChange={(v: string) => setForm((p) => ({ ...p, nutritionPlanId: Number(v) || 0 }))} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Loại bữa</label>
            <SimpleSelect value={form.mealType} onChange={(v) => setForm((p) => ({ ...p, mealType: v }))} options={[
              { value: "breakfast", label: "Breakfast" },
              { value: "lunch", label: "Lunch" },
              { value: "dinner", label: "Dinner" },
              { value: "snack", label: "Snack" },
            ]} />
          </div>

          {/* Foods editor */}
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <SimpleSelect
                value={""}
                onChange={(v) => {
                  if (!v) return;
                  addFoodToForm(Number(v), 100);
                }}
                placeholder="Chọn food để thêm (mặc định 100g)"
                options={foods.map((f) => ({ value: String(f.id), label: f.name }))}
                className="flex-1"
              />
              <Button variant="outline" onClick={() => { /* could open food create modal */ }}>
                <PlusCircle size={16} /> Thêm food mới
              </Button>
            </div>

            <div className="space-y-2">
              {form.foods.length === 0 && <p className="text-sm text-gray-500">Chưa có thực phẩm nào trong bữa ăn.</p>}
              {form.foods.map((f) => {
                const opt = foodMap.get(f.foodId);
                return (
                  <div key={f.foodId} className="flex items-center gap-3 bg-white p-2 rounded-md border">
                    <div className="w-1/3">
                      <div className="text-sm font-medium">{opt?.name ?? `Food #${f.foodId}`}</div>
                      <div className="text-xs text-gray-400">{opt ? `${opt.caloriesPer100g} kcal /100g` : ""}</div>
                    </div>
                    <div className="w-1/3">
                      <Input type="number" value={String(f.quantityG)} onChange={(e) => updateFoodQuantityInForm(f.foodId, Number(e.target.value) || 0)} />
                    </div>
                    <div className="flex-1 text-sm">
                      <div>Calories: {
                        (() => {
                          if (!opt) return "—";
                          const c = Math.round((opt.caloriesPer100g * f.quantityG) / 100);
                          return `${c} kcal`;
                        })()
                      }</div>
                      <div className="text-xs text-gray-500">
                        Protein / Carbs / Fat: {
                          opt ? `${(opt.proteinPer100g * f.quantityG / 100).toFixed(1)}g / ${(opt.carbsPer100g * f.quantityG / 100).toFixed(1)}g / ${(opt.fatPer100g * f.quantityG / 100).toFixed(1)}g` : "—"
                        }
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => removeFoodFromForm(f.foodId)}>Xóa</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SimpleModal>

      {/* DELETE confirm modal */}
      <SimpleModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Xóa bữa ăn"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="danger" onClick={confirmDelete} disabled={confirmDeleteLoading}>Xóa</Button>
          </div>
        }
      >
        <p>Bạn chắc chắn muốn xóa bữa ăn <strong>{deleteTarget?.name}</strong> ? Hành động này không thể hoàn tác.</p>
      </SimpleModal>
    </div>
  );
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function categoryColor(category: string) {
  switch (category) {
    case "breakfast":
      return "bg-yellow-50 text-yellow-700";
    case "lunch":
      return "bg-green-50 text-green-700";
    case "dinner":
      return "bg-purple-50 text-purple-700";
    case "snack":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
