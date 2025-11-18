import { useState } from "react";
import { Button } from "@/components_1/ui/button";
import { Plus, Apple, Search } from "lucide-react";
import { Input } from "@/components_1/ui/input";

interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: "breakfast" | "lunch" | "dinner" | "snack";
}

const mockMeals: Meal[] = [
  {
    id: 1,
    name: "Oatmeal with Berries",
    calories: 350,
    protein: 12,
    carbs: 58,
    fat: 6,
    category: "breakfast",
  },
  {
    id: 2,
    name: "Grilled Chicken Salad",
    calories: 420,
    protein: 38,
    carbs: 15,
    fat: 18,
    category: "lunch",
  },
  {
    id: 3,
    name: "Salmon with Rice",
    calories: 550,
    protein: 42,
    carbs: 65,
    fat: 12,
    category: "dinner",
  },
];

export function MealsPage() {
  const [meals] = useState<Meal[]>(mockMeals);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = meals.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryColor = (category: string) => {
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
        return "";
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meals</h1>
          <p className="text-gray-600 mt-2">Manage meal options and nutrition data</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          Add Meal
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Meal Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Calories</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Protein</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Carbs</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fat</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((meal) => (
              <tr key={meal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <Apple size={20} className="text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">{meal.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${categoryColor(meal.category)}`}>
                    {meal.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{meal.calories} kcal</td>
                <td className="px-6 py-4 text-gray-900">{meal.protein}g</td>
                <td className="px-6 py-4 text-gray-900">{meal.carbs}g</td>
                <td className="px-6 py-4 text-gray-900">{meal.fat}g</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
