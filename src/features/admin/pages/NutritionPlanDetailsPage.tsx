import { useState, useMemo } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, Search, Apple, Utensils } from "lucide-react";
import { AdminNutritionPlan } from "../types/admin-entities";

interface Meal {
  id: number;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  foods: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface Food {
  id: number;
  name: string;
  weight: number; // grams
  caloriesPer100g: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionPlanDetailsPageProps {
  plan: AdminNutritionPlan;
  onBack: () => void;
}

const TAB_IDS = ["meals", "details"] as const;
type TabId = (typeof TAB_IDS)[number];

// Mock meals data
const MOCK_MEALS: Meal[] = [
  {
    id: 1,
    type: "breakfast",
    name: "Breakfast - Oats with Banana",
    foods: [
      { id: 1, name: "Oatmeal", weight: 50, caloriesPer100g: 389, protein: 17, carbs: 66, fat: 7 },
      { id: 2, name: "Banana", weight: 100, caloriesPer100g: 89, protein: 1, carbs: 23, fat: 0 },
      { id: 3, name: "Milk", weight: 200, caloriesPer100g: 61, protein: 3, carbs: 5, fat: 3 },
    ],
    totalCalories: 445,
    totalProtein: 42,
    totalCarbs: 78,
    totalFat: 10,
  },
  {
    id: 2,
    type: "lunch",
    name: "Lunch - Grilled Chicken with Rice",
    foods: [
      { id: 4, name: "Chicken Breast", weight: 150, caloriesPer100g: 165, protein: 31, carbs: 0, fat: 3 },
      { id: 5, name: "Brown Rice", weight: 150, caloriesPer100g: 111, protein: 3, carbs: 23, fat: 1 },
      { id: 6, name: "Broccoli", weight: 100, caloriesPer100g: 34, protein: 3, carbs: 7, fat: 0 },
    ],
    totalCalories: 532,
    totalProtein: 37,
    totalCarbs: 30,
    totalFat: 6,
  },
  {
    id: 3,
    type: "dinner",
    name: "Dinner - Salmon with Sweet Potato",
    foods: [
      { id: 7, name: "Salmon Fillet", weight: 150, caloriesPer100g: 208, protein: 20, carbs: 0, fat: 13 },
      { id: 8, name: "Sweet Potato", weight: 150, caloriesPer100g: 86, protein: 2, carbs: 20, fat: 0 },
      { id: 9, name: "Asparagus", weight: 100, caloriesPer100g: 20, protein: 2, carbs: 4, fat: 0 },
    ],
    totalCalories: 526,
    totalProtein: 24,
    totalCarbs: 24,
    totalFat: 20,
  },
  {
    id: 4,
    type: "snack",
    name: "Snack - Almonds & Greek Yogurt",
    foods: [
      { id: 10, name: "Almonds", weight: 30, caloriesPer100g: 579, protein: 21, carbs: 22, fat: 50 },
      { id: 11, name: "Greek Yogurt", weight: 150, caloriesPer100g: 59, protein: 10, carbs: 3, fat: 0 },
    ],
    totalCalories: 347,
    totalProtein: 22,
    totalCarbs: 9,
    totalFat: 25,
  },
];

const AVAILABLE_FOODS: Food[] = [
  { id: 12, name: "Eggs", weight: 50, caloriesPer100g: 155, protein: 13, carbs: 1, fat: 11 },
  { id: 13, name: "Beef", weight: 100, caloriesPer100g: 250, protein: 26, carbs: 0, fat: 15 },
  { id: 14, name: "Apple", weight: 100, caloriesPer100g: 52, protein: 0, carbs: 14, fat: 0 },
  { id: 15, name: "Pasta", weight: 100, caloriesPer100g: 131, protein: 5, carbs: 25, fat: 1 },
  { id: 16, name: "Cheese", weight: 30, caloriesPer100g: 402, protein: 25, carbs: 1, fat: 33 },
];

export function NutritionPlanDetailsPage({ plan, onBack }: NutritionPlanDetailsPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("meals");
  const [editingMeal, setEditingMeal] = useState<number | null>(null);
  const [searchFood, setSearchFood] = useState("");
  const [selectedMealForFood, setSelectedMealForFood] = useState<number | null>(null);

  const dailyStats = useMemo(() => {
    const totalCalories = MOCK_MEALS.reduce((sum, m) => sum + m.totalCalories, 0);
    const totalProtein = MOCK_MEALS.reduce((sum, m) => sum + m.totalProtein, 0);
    const totalCarbs = MOCK_MEALS.reduce((sum, m) => sum + m.totalCarbs, 0);
    const totalFat = MOCK_MEALS.reduce((sum, m) => sum + m.totalFat, 0);
    return { totalCalories, totalProtein, totalCarbs, totalFat };
  }, []);

  const filteredFoods = useMemo(() => {
    return AVAILABLE_FOODS.filter((food) =>
      food.name.toLowerCase().includes(searchFood.toLowerCase())
    );
  }, [searchFood]);

  const mealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: "🌅 Breakfast",
      lunch: "🍽️ Lunch",
      dinner: "🌙 Dinner",
      snack: "🥜 Snack",
    };
    return labels[type] || type;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
          <p className="text-gray-600">Nutrition Plan Details</p>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Daily Calories</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{dailyStats.totalCalories}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Protein</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{dailyStats.totalProtein}g</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Carbs</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{dailyStats.totalCarbs}g</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 uppercase">Fat</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{dailyStats.totalFat}g</p>
        </div>
      </div>

      {/* Macro Breakdown Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Macronutrient Distribution</h3>
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
              <div
                className="bg-red-500"
                style={{ width: `${(dailyStats.totalProtein / (dailyStats.totalProtein + dailyStats.totalCarbs + dailyStats.totalFat)) * 100}%` }}
              />
              <div
                className="bg-blue-500"
                style={{ width: `${(dailyStats.totalCarbs / (dailyStats.totalProtein + dailyStats.totalCarbs + dailyStats.totalFat)) * 100}%` }}
              />
              <div
                className="bg-yellow-500"
                style={{ width: `${(dailyStats.totalFat / (dailyStats.totalProtein + dailyStats.totalCarbs + dailyStats.totalFat)) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Protein: {dailyStats.totalProtein}g</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Carbs: {dailyStats.totalCarbs}g</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-gray-600">Fat: {dailyStats.totalFat}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: "meals" as TabId, label: "Meals", icon: "🍽️" },
            { id: "details" as TabId, label: "Meal Details", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Meals Tab */}
        {activeTab === "meals" && (
          <div className="space-y-4">
            {MOCK_MEALS.map((meal) => (
              <div key={meal.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{mealTypeLabel(meal.type)}</h4>
                    <p className="text-sm text-gray-600">{meal.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingMeal(editingMeal === meal.id ? null : meal.id)}
                      className="p-2 hover:bg-blue-100 rounded text-blue-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Meal Foods */}
                <div className="mb-4 space-y-2">
                  {meal.foods.map((food) => (
                    <div key={food.id} className="p-3 bg-gray-50 rounded border-l-4 border-orange-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{food.name}</p>
                          <p className="text-xs text-gray-600">{food.weight}g</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-bold text-gray-900">{Math.round((food.caloriesPer100g * food.weight) / 100)} kcal</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meal Totals */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded border border-orange-200">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="text-xl font-bold text-orange-600">{meal.totalCalories}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="text-xl font-bold text-red-600">{meal.totalProtein}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="text-xl font-bold text-blue-600">{meal.totalCarbs}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Fat</p>
                      <p className="text-xl font-bold text-yellow-600">{meal.totalFat}g</p>
                    </div>
                  </div>
                </div>

                {/* Edit Mode */}
                {editingMeal === meal.id && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-3">Add Food to Meal</p>
                    <div className="mb-3">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search foods..."
                          value={searchFood}
                          onChange={(e) => setSearchFood(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredFoods.map((food) => (
                        <button
                          key={food.id}
                          className="w-full p-2 text-left border rounded-lg hover:bg-white transition"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">{food.name}</span>
                            <span className="text-xs text-gray-600">{food.caloriesPer100g} kcal/100g</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button className="bg-blue-600">Add Food</Button>
                      <Button variant="outline" onClick={() => setEditingMeal(null)}>
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Meal Details Tab */}
        {activeTab === "details" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Meal Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Meal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Food</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight (g)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Calories</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Protein (g)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Carbs (g)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fat (g)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {MOCK_MEALS.map((meal) =>
                    meal.foods.map((food, idx) => (
                      <tr key={`${meal.id}-${food.id}`}className="hover:bg-gray-50">
                        {idx === 0 && (
                          <td rowSpan={meal.foods.length} className="px-4 py-2 font-medium text-gray-900">
                            {meal.type}
                          </td>
                        )}
                        <td className="px-4 py-2 text-sm text-gray-900">{food.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{food.weight}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{Math.round((food.caloriesPer100g * food.weight) / 100)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{Math.round((food.protein * food.weight) / 100)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{Math.round((food.carbs * food.weight) / 100)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{Math.round((food.fat * food.weight) / 100)}</td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 font-bold">
                    <td colSpan={3} className="px-4 py-3 text-gray-900">
                      Daily Total
                    </td>
                    <td className="px-4 py-3 text-orange-600">{dailyStats.totalCalories} kcal</td>
                    <td className="px-4 py-3 text-red-600">{dailyStats.totalProtein}g</td>
                    <td className="px-4 py-3 text-blue-600">{dailyStats.totalCarbs}g</td>
                    <td className="px-4 py-3 text-yellow-600">{dailyStats.totalFat}g</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
