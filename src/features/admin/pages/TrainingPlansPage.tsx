import { useState } from "react";
import { Button } from "@/components_1/ui/button";
import { Plus, BookOpen, Search } from "lucide-react";
import { Input } from "@/components_1/ui/input";

interface TrainingPlan {
  id: number;
  name: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  subscribers: number;
  price: number;
  status: "published" | "draft" | "archived";
}

const mockPlans: TrainingPlan[] = [
  {
    id: 1,
    name: "Beginner Full Body",
    duration: "30 days",
    difficulty: "beginner",
    subscribers: 234,
    price: 29.99,
    status: "published",
  },
  {
    id: 2,
    name: "Intermediate HIIT",
    duration: "45 days",
    difficulty: "intermediate",
    subscribers: 156,
    price: 49.99,
    status: "published",
  },
  {
    id: 3,
    name: "Advanced Strength",
    duration: "60 days",
    difficulty: "advanced",
    subscribers: 89,
    price: 79.99,
    status: "published",
  },
];

export function TrainingPlansPage() {
  const [plans] = useState<TrainingPlan[]>(mockPlans);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = plans.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const difficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-green-600 bg-green-50";
      case "intermediate":
        return "text-yellow-600 bg-yellow-50";
      case "advanced":
        return "text-red-600 bg-red-50";
      default:
        return "";
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Plans</h1>
          <p className="text-gray-600 mt-2">Manage all training programs</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          Create Plan
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search training plans..."
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Difficulty</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subscribers</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <BookOpen size={20} className="text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900">{plan.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">{plan.duration}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${difficultyColor(plan.difficulty)}`}>
                    {plan.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{plan.subscribers}</td>
                <td className="px-6 py-4 font-medium text-gray-900">${plan.price}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 capitalize">
                    {plan.status}
                  </span>
                </td>
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
