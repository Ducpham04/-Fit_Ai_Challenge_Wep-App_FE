import { useState, useMemo } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { Plus, Search, AlertCircle, Edit2, Trash2, Apple, Filter, X } from "lucide-react";
import { FormField } from "@/components_1/ui/form-field";

interface AdminFood {
  id: number;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  category: "vegetable" | "fruit" | "protein" | "grain" | "dairy" | "other";
  createdAt: string;
  updatedAt: string;
}

interface FoodPayload {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  category: "vegetable" | "fruit" | "protein" | "grain" | "dairy" | "other";
}

const EMPTY_FOOD: FoodPayload = {
  name: "",
  caloriesPer100g: 0,
  proteinPer100g: 0,
  carbsPer100g: 0,
  fatPer100g: 0,
  fiberPer100g: 0,
  category: "other",
};

const MOCK_FOODS: AdminFood[] = [
  {
    id: 1,
    name: "Chicken Breast",
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    fiberPer100g: 0,
    category: "protein",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 2,
    name: "Salmon Fillet",
    caloriesPer100g: 208,
    proteinPer100g: 20,
    carbsPer100g: 0,
    fatPer100g: 13,
    fiberPer100g: 0,
    category: "protein",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 3,
    name: "Broccoli",
    caloriesPer100g: 34,
    proteinPer100g: 2.8,
    carbsPer100g: 7,
    fatPer100g: 0.4,
    fiberPer100g: 2.4,
    category: "vegetable",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 4,
    name: "Sweet Potato",
    caloriesPer100g: 86,
    proteinPer100g: 1.6,
    carbsPer100g: 20,
    fatPer100g: 0.1,
    fiberPer100g: 3,
    category: "vegetable",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 5,
    name: "Brown Rice",
    caloriesPer100g: 111,
    proteinPer100g: 2.6,
    carbsPer100g: 23,
    fatPer100g: 0.9,
    fiberPer100g: 1.8,
    category: "grain",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 6,
    name: "Oatmeal",
    caloriesPer100g: 389,
    proteinPer100g: 17,
    carbsPer100g: 66,
    fatPer100g: 7,
    fiberPer100g: 10,
    category: "grain",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 7,
    name: "Banana",
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23,
    fatPer100g: 0.3,
    fiberPer100g: 2.6,
    category: "fruit",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 8,
    name: "Apple",
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 14,
    fatPer100g: 0.2,
    fiberPer100g: 2.4,
    category: "fruit",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 9,
    name: "Greek Yogurt",
    caloriesPer100g: 59,
    proteinPer100g: 10,
    carbsPer100g: 3.3,
    fatPer100g: 0.4,
    fiberPer100g: 0,
    category: "dairy",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 10,
    name: "Milk",
    caloriesPer100g: 61,
    proteinPer100g: 3.2,
    carbsPer100g: 4.8,
    fatPer100g: 3.3,
    fiberPer100g: 0,
    category: "dairy",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 11,
    name: "Cheese",
    caloriesPer100g: 402,
    proteinPer100g: 25,
    carbsPer100g: 1.3,
    fatPer100g: 33,
    fiberPer100g: 0,
    category: "dairy",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 12,
    name: "Eggs",
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatPer100g: 11,
    fiberPer100g: 0,
    category: "protein",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 13,
    name: "Almonds",
    caloriesPer100g: 579,
    proteinPer100g: 21,
    carbsPer100g: 22,
    fatPer100g: 50,
    fiberPer100g: 12,
    category: "other",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 14,
    name: "Peanut Butter",
    caloriesPer100g: 588,
    proteinPer100g: 25,
    carbsPer100g: 20,
    fatPer100g: 50,
    fiberPer100g: 6,
    category: "other",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 15,
    name: "Beef",
    caloriesPer100g: 250,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatPer100g: 15,
    fiberPer100g: 0,
    category: "protein",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 16,
    name: "Spinach",
    caloriesPer100g: 23,
    proteinPer100g: 2.7,
    carbsPer100g: 3.6,
    fatPer100g: 0.4,
    fiberPer100g: 2.2,
    category: "vegetable",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 17,
    name: "Carrot",
    caloriesPer100g: 41,
    proteinPer100g: 0.9,
    carbsPer100g: 10,
    fatPer100g: 0.2,
    fiberPer100g: 2.8,
    category: "vegetable",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 18,
    name: "Orange",
    caloriesPer100g: 47,
    proteinPer100g: 0.9,
    carbsPer100g: 12,
    fatPer100g: 0.3,
    fiberPer100g: 2.4,
    category: "fruit",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 19,
    name: "Pasta",
    caloriesPer100g: 131,
    proteinPer100g: 5,
    carbsPer100g: 25,
    fatPer100g: 1.1,
    fiberPer100g: 1.8,
    category: "grain",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 20,
    name: "Asparagus",
    caloriesPer100g: 20,
    proteinPer100g: 2.2,
    carbsPer100g: 3.7,
    fatPer100g: 0.1,
    fiberPer100g: 2.1,
    category: "vegetable",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

type ModalMode = "create" | "edit";

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div
        className="bg-white p-8 rounded-xl w-[500px] max-w-[90%] shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function FoodsLibraryPage() {
  const [foods, setFoods] = useState<AdminFood[]>(MOCK_FOODS);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [calorieRange, setCalorieRange] = useState<[number, number]>([0, 600]);
  const [proteinRange, setProteinRange] = useState<[number, number]>([0, 35]);
  const [showFilters, setShowFilters] = useState(false);
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

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || food.category === categoryFilter;
      const matchesCalories = food.caloriesPer100g >= calorieRange[0] && food.caloriesPer100g <= calorieRange[1];
      const matchesProtein = food.proteinPer100g >= proteinRange[0] && food.proteinPer100g <= proteinRange[1];
      return matchesSearch && matchesCategory && matchesCalories && matchesProtein;
    });
  }, [foods, searchTerm, categoryFilter, calorieRange, proteinRange]);

  const stats = useMemo(() => {
    return {
      total: foods.length,
      avgCalories: Math.round(foods.reduce((sum, f) => sum + f.caloriesPer100g, 0) / foods.length),
      avgProtein: Math.round((foods.reduce((sum, f) => sum + f.proteinPer100g, 0) / foods.length) * 10) / 10,
      categories: new Set(foods.map((f) => f.category)).size,
    };
  }, [foods]);

  const openCreateModal = () => {
    setForm(EMPTY_FOOD);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (food: AdminFood) => {
    const { id, createdAt, updatedAt, ...payload } = food;
    setForm(payload);
    setError(null);
    setModalState({ open: true, mode: "edit", food });
  };

  const openDeleteModal = (food: AdminFood) => {
    setDeleteTarget(food);
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(EMPTY_FOOD);
    setError(null);
    setDeleteTarget(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Food name is required");
      return;
    }
    if (form.caloriesPer100g < 0 || form.proteinPer100g < 0 || form.carbsPer100g < 0 || form.fatPer100g < 0) {
      setError("Nutritional values must be positive");
      return;
    }

    try {
      setSubmitLoading(true);
      console.log("📤 [FoodsLibraryPage] Submitting food...", form);

      if (modalState.mode === "create") {
        const newFood: AdminFood = {
          id: Math.max(...foods.map((f) => f.id), 0) + 1,
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setFoods([...foods, newFood]);
        console.log("✅ [FoodsLibraryPage] Food created:", newFood);
      } else if (modalState.food) {
        setFoods(
          foods.map((f) =>
            f.id === modalState.food!.id
              ? {
                  ...f,
                  ...form,
                  updatedAt: new Date().toISOString(),
                }
              : f
          )
        );
        console.log("✅ [FoodsLibraryPage] Food updated");
      }

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("❌ [FoodsLibraryPage] Error:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitLoading(true);
      console.log("🗑️ [FoodsLibraryPage] Deleting food...", deleteTarget.id);
      setFoods(foods.filter((f) => f.id !== deleteTarget.id));
      console.log("✅ [FoodsLibraryPage] Food deleted");
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("❌ [FoodsLibraryPage] Error:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <main className="relative">
      <div className={`p-8 transition ${modalState.open || deleteTarget ? "pointer-events-none opacity-40" : ""}`}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Apple className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Foods Library</h1>
              <p className="text-sm text-gray-600 mt-1">Manage nutritional foods database</p>
            </div>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            <Plus size={18} /> Add Food
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Total Foods</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Avg Calories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgCalories}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Avg Protein</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgProtein}g</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search foods by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                showFilters ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <Filter size={16} /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="vegetable">Vegetable</option>
                    <option value="fruit">Fruit</option>
                    <option value="protein">Protein</option>
                    <option value="grain">Grain</option>
                    <option value="dairy">Dairy</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Calories Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Calories: {calorieRange[0]}-{calorieRange[1]} kcal
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="600"
                      value={calorieRange[0]}
                      onChange={(e) => setCalorieRange([Number(e.target.value), calorieRange[1]])}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      min="0"
                      max="600"
                      value={calorieRange[1]}
                      onChange={(e) => setCalorieRange([calorieRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Protein Range */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Protein: {proteinRange[0]}-{proteinRange[1]}g
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="35"
                      step="0.5"
                      value={proteinRange[0]}
                      onChange={(e) => setProteinRange([Number(e.target.value), proteinRange[1]])}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      min="0"
                      max="35"
                      step="0.5"
                      value={proteinRange[1]}
                      onChange={(e) => setProteinRange([proteinRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {(searchTerm || categoryFilter || calorieRange[0] > 0 || calorieRange[1] < 600 || proteinRange[0] > 0 || proteinRange[1] < 35) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("");
                    setCalorieRange([0, 600]);
                    setProteinRange([0, 35]);
                  }}
                  className="w-full px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-medium text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Foods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoods.map((food) => (
            <div key={food.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{food.name}</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
                    {food.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(food)}
                    className="p-2 hover:bg-blue-100 rounded text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(food)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="space-y-2">
                <div className="p-2 bg-orange-50 rounded border-l-4 border-orange-500">
                  <p className="text-xs text-gray-600">Calories per 100g</p>
                  <p className="text-lg font-bold text-orange-600">{food.caloriesPer100g} kcal</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-red-50 rounded">
                    <p className="text-xs text-gray-600">Protein</p>
                    <p className="text-base font-bold text-red-600">{food.proteinPer100g}g</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Carbs</p>
                    <p className="text-base font-bold text-blue-600">{food.carbsPer100g}g</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <p className="text-xs text-gray-600">Fat</p>
                    <p className="text-base font-bold text-yellow-600">{food.fatPer100g}g</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-xs text-gray-600">Fiber</p>
                    <p className="text-base font-bold text-green-600">{food.fiberPer100g}g</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <Apple className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No foods found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {!deleteTarget && modalState.open && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-6">
            {modalState.mode === "create" ? "Add New Food" : "Edit Food"}
          </h2>

          <div className="space-y-4">
            <FormField
              label="Food Name"
              value={form.name}
              onChange={(v: string) => setForm({ ...form, name: v })}
              required
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as FoodPayload["category"] })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vegetable">Vegetable</option>
                <option value="fruit">Fruit</option>
                <option value="protein">Protein</option>
                <option value="grain">Grain</option>
                <option value="dairy">Dairy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <FormField
              label="Calories per 100g"
              value={form.caloriesPer100g.toString()}
              onChange={(v: string) => setForm({ ...form, caloriesPer100g: Number(v) || 0 })}
              type="number"
            />

            <FormField
              label="Protein per 100g (g)"
              value={form.proteinPer100g.toString()}
              onChange={(v: string) => setForm({ ...form, proteinPer100g: Number(v) || 0 })}
              type="number"
            />

            <FormField
              label="Carbs per 100g (g)"
              value={form.carbsPer100g.toString()}
              onChange={(v: string) => setForm({ ...form, carbsPer100g: Number(v) || 0 })}
              type="number"
            />

            <FormField
              label="Fat per 100g (g)"
              value={form.fatPer100g.toString()}
              onChange={(v: string) => setForm({ ...form, fatPer100g: Number(v) || 0 })}
              type="number"
            />

            <FormField
              label="Fiber per 100g (g)"
              value={form.fiberPer100g.toString()}
              onChange={(v: string) => setForm({ ...form, fiberPer100g: Number(v) || 0 })}
              type="number"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitLoading}>
                {submitLoading ? "Saving..." : modalState.mode === "create" ? "Add Food" : "Update Food"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">Delete Food</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={submitLoading}>
              {submitLoading ? "Deleting..." : "Delete Food"}
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
