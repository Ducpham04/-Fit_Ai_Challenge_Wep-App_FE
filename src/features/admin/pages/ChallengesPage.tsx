import { useState } from "react";
import { Button } from "@/components_1/ui/button";
import { Plus, Dumbbell, Search } from "lucide-react";
import { Input } from "@/components_1/ui/input";

interface Challenge {
  id: number;
  name: string;
  description: string;
  reward: number;
  participants: number;
  status: "active" | "inactive" | "completed";
}

const mockChallenges: Challenge[] = [
  {
    id: 1,
    name: "100 Push-ups Challenge",
    description: "Complete 100 push-ups",
    reward: 100,
    participants: 234,
    status: "active",
  },
  {
    id: 2,
    name: "30-Day Plank",
    description: "Daily plank exercises",
    reward: 150,
    participants: 156,
    status: "active",
  },
  {
    id: 3,
    name: "5K Run",
    description: "Complete 5K running",
    reward: 200,
    participants: 89,
    status: "completed",
  },
];

export function ChallengesPage() {
  const [challenges] = useState<Challenge[]>(mockChallenges);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = challenges.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "inactive":
        return "text-gray-600 bg-gray-50";
      case "completed":
        return "text-blue-600 bg-blue-50";
      default:
        return "";
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Challenges Management</h1>
          <p className="text-gray-600 mt-2">Manage all fitness challenges</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          Create Challenge
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search challenges..."
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reward</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Participants</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((challenge) => (
              <tr key={challenge.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded">
                      <Dumbbell size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{challenge.name}</p>
                      <p className="text-sm text-gray-500">{challenge.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">${challenge.reward}</td>
                <td className="px-6 py-4 text-gray-900">{challenge.participants}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColor(challenge.status)}`}>
                    {challenge.status}
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
