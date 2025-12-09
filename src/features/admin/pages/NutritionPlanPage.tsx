import { useEffect, useMemo, useState } from "react";
import { SimpleButton as Button } from "@/components/ui/simple-button";
import { SimpleModal } from "@/components/ui/simple-modal";
import { Plus, Search, AlertCircle, Edit2, Trash2, Apple, Users } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { NutritionPlanDetailsPage } from "./NutritionPlanDetailsPage";
import { AdminNutritionPlan as AdminNutritionPlanType } from "../types/admin-entities";
import { nutritionPlanAPI } from "../api/adminAPI";
import { extractDataFromResponse } from "../utils/responseHelper";

interface AdminNutritionPlan {
  id: number;
  name: string;
  description: string;
  duration: number; // days
  type: "diet" | "wellness" | "performance";
  targetCalories: number;
  meals: number;
  usersAssigned: number;
  createdAt: string;
  updatedAt: string;
}

interface NutritionPlanPayload {
  name: string;
  description: string;
  duration: number;
  type: "diet" | "wellness" | "performance";
  targetCalories: number;
  meals: number;
}

const EMPTY_PLAN: NutritionPlanPayload = {
  name: "",
  description: "",
  duration: 30,
  type: "diet",
  targetCalories: 2000,
  meals: 3,
};

const MOCK_PLANS: AdminNutritionPlan[] = [
  {
    id: 1,
    name: "Weight Loss Plan",
    description: "Calorie deficit diet for weight loss",
    duration: 30,
    type: "diet",
    targetCalories: 1500,
    meals: 3,
    usersAssigned: 25,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Muscle Gain Plan",
    description: "High protein diet for muscle building",
    duration: 60,
    type: "performance",
    targetCalories: 3000,
    meals: 5,
    usersAssigned: 18,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-10",
  },
];

type ModalMode = "create" | "edit";

export function NutritionPlanPage() {
  const [plans, setPlans] = useState<AdminNutritionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: ModalMode;
    plan?: AdminNutritionPlan;
  }>({
    open: false,
    mode: "create",
  });
  const [form, setForm] = useState<NutritionPlanPayload>(EMPTY_PLAN);
  const [deleteTarget, setDeleteTarget] = useState<AdminNutritionPlan | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailPlan, setDetailPlan] = useState<AdminNutritionPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 [NutritionPlanPage] Fetching nutrition plans...");
      const response = await nutritionPlanAPI.getAll();
      console.log("✅ [NutritionPlanPage] Full response:", response);
      
      // Extract data using helper function
      const data = extractDataFromResponse<AdminNutritionPlan>(response);
      console.log("📋 [NutritionPlanPage] Extracted data:", data);
      setPlans(data);
    } catch (error: any) {
      console.error("❌ [NutritionPlanPage] Error fetching nutrition plans:", error);
      setError(error?.response?.data?.message || error?.message || "Không thể tải danh sách nutrition plans");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(EMPTY_PLAN);
    setError(null);
    setModalState({ open: true, mode: "create" });
  };

  const openEditModal = (plan: AdminNutritionPlan) => {
    const { id, usersAssigned, createdAt, updatedAt, ...payload } = plan;
    setForm(payload);
    setError(null);
    setModalState({ open: true, mode: "edit", plan });
  };

  const openDeleteModal = (plan: AdminNutritionPlan) => {
    setDeleteTarget(plan);
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setForm(EMPTY_PLAN);
    setError(null);
    setDeleteTarget(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Plan name is required");
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      console.log("📤 [NutritionPlanPage] Submitting plan...", form);

      // Map form to BE NutritionPlanRequest format
      const payload = {
        goalId: (form as any).goalId || null,
        title: form.name,
        description: form.description || "",
        caloriesPerDay: form.targetCalories || form.dailyCalories || 2000,
        proteinG: (form as any).proteinG || null,
        carbsG: (form as any).carbsG || null,
        fatG: (form as any).fatG || null,
        status: form.status || "draft",
      };

      if (modalState.mode === "create") {
        console.log("➕ Creating new nutrition plan");
        await nutritionPlanAPI.create(payload);
      } else if (modalState.plan) {
        console.log("✏️ Updating nutrition plan ID:", modalState.plan.id);
        await nutritionPlanAPI.update(modalState.plan.id, payload);
      }

      console.log("✅ Plan saved successfully");
      await fetchPlans();
      closeModal();
    } catch (err: any) {
      console.error("❌ [NutritionPlanPage] Submit error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to save plan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitLoading(true);
      setError(null);
      console.log("🗑️ [NutritionPlanPage] Deleting nutrition plan ID:", deleteTarget.id);
      await nutritionPlanAPI.delete(deleteTarget.id);
      console.log("✅ Nutrition plan deleted successfully");
      await fetchPlans();
      setDeleteTarget(null);
    } catch (err: any) {
      console.error("❌ [NutritionPlanPage] Delete error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to delete plan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchSearch =
        !searchTerm ||
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = !typeFilter || plan.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [plans, searchTerm, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: plans.length,
      totalUsers: plans.reduce((sum, p) => sum + p.usersAssigned, 0),
      avgCalories: Math.round(
        plans.reduce((sum, p) => sum + p.targetCalories, 0) / Math.max(plans.length, 1)
      ),
      avgDuration: Math.round(
        plans.reduce((sum, p) => sum + p.duration, 0) / Math.max(plans.length, 1)
      ),
    };
  }, [plans]);

  return (
    <main className="relative">
      {detailPlan ? (
        <NutritionPlanDetailsPage
          plan={{
            id: detailPlan.id,
            name: detailPlan.name,
            description: detailPlan.description,
            target: detailPlan.type,
            dailyCalories: detailPlan.targetCalories,
            subscribers: detailPlan.usersAssigned,
            price: 0,
            status: "published",
            createdAt: detailPlan.createdAt,
            updatedAt: detailPlan.updatedAt,
          }}
          onBack={() => setDetailPlan(null)}
        />
      ) : (
        <div className={`p-8 transition ${modalState.open || deleteTarget ? "pointer-events-none opacity-40" : ""}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Apple className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nutrition Plans</h1>
              <p className="text-sm text-gray-600 mt-1">Manage nutrition and diet plans</p>
            </div>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            <Plus size={18} /> New Plan
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
            <p className="text-gray-600 text-sm">Total Plans</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Assigned Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Avg Calories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgCalories}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Avg Duration</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgDuration}d</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="diet">Diet</option>
            <option value="wellness">Wellness</option>
            <option value="performance">Performance</option>
          </select>

          {(searchTerm || typeFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("");
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plan Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Calories</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Users</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan, idx) => (
                <tr key={plan.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{plan.name}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                      {plan.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{plan.duration} days</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">{plan.targetCalories} kcal</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-gray-500" />
                      <span>{plan.usersAssigned}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDetailPlan(plan)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => openEditModal(plan)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(plan)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No nutrition plans found</p>
          </div>
        )}
      </div>
      )}

      {/* Create/Edit Modal */}
      {!detailPlan && modalState.open && !deleteTarget && (
        <SimpleModal
          isOpen={modalState.open}
          onClose={closeModal}
          title={modalState.mode === "create" ? "Create Nutrition Plan" : "Edit Nutrition Plan"}
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={submitLoading}>
                {submitLoading ? "Saving..." : "Save Plan"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <FormField
              label="Plan Name"
              value={form.name}
              onChange={(v: string) => setForm({ ...form, name: v })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Duration (days)"
                type="number"
                value={String(form.duration)}
                onChange={(v: string) => setForm({ ...form, duration: Number(v) || 0 })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="diet">Diet</option>
                  <option value="wellness">Wellness</option>
                  <option value="performance">Performance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Target Calories"
                type="number"
                value={String(form.targetCalories)}
                onChange={(v: string) => setForm({ ...form, targetCalories: Number(v) || 0 })}
              />

              <FormField
                label="Meals/Day"
                type="number"
                value={String(form.meals)}
                onChange={(v: string) => setForm({ ...form, meals: Number(v) || 1 })}
              />
            </div>
          </div>
        </SimpleModal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <SimpleModal
          isOpen={Boolean(deleteTarget)}
          onClose={closeModal}
          title="Confirm Delete"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal} disabled={submitLoading}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={submitLoading}>
                {submitLoading ? "Deleting..." : "Delete Plan"}
              </Button>
            </div>
          }
        >
          <div>
            <p className="text-red-600 font-semibold mb-2">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              {deleteTarget.usersAssigned} users are currently using this plan.
            </p>
          </div>
        </SimpleModal>
      )}
    </main>
  );
}
