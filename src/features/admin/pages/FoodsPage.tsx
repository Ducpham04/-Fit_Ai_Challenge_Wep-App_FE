import { useState } from "react";
import { Button } from "@/components_1/ui/button";
import { Plus, Leaf, Search } from "lucide-react";
import { Input } from "@/components_1/ui/input";

interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving: string;
}

const mockFoods: Food[] = [
  {
    id: 1,
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    serving: "100g",
  },
  {
    id: 2,
    name: "Brown Rice",
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    serving: "100g",
  },
  {
    id: 3,
    name: "Broccoli",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.4,
    serving: "100g",
  },
];

export function FoodsPage() {
  const [foods] = useState<Food[]>(mockFoods);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = foods.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Foods</h1>
          <p className="text-gray-600 mt-2">Manage food database and nutrition information</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          Add Food
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Food Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Serving</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Calories</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Protein</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Carbs</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fat</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fiber</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((food) => (
              <tr key={food.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-lime-100 rounded">
                      <Leaf size={20} className="text-lime-600" />
                    </div>
                    <p className="font-medium text-gray-900">{food.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">{food.serving}</td>
                <td className="px-6 py-4 text-gray-900">{food.calories} kcal</td>
                <td className="px-6 py-4 text-gray-900">{food.protein}g</td>
                <td className="px-6 py-4 text-gray-900">{food.carbs}g</td>
                <td className="px-6 py-4 text-gray-900">{food.fat}g</td>
                <td className="px-6 py-4 text-gray-900">{food.fiber}g</td>
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
