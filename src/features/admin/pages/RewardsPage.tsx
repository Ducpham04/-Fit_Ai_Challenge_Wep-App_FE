import { useState } from "react";
import { Button } from "@/components_1/ui/button";
import { Plus, Gift, Search } from "lucide-react";
import { Input } from "@/components_1/ui/input";

interface Reward {
  id: number;
  name: string;
  description: string;
  points: number;
  claimed: number;
  total: number;
  status: "active" | "inactive";
}

const mockRewards: Reward[] = [
  {
    id: 1,
    name: "Free Premium Month",
    description: "One month free premium access",
    points: 500,
    claimed: 45,
    total: 100,
    status: "active",
  },
  {
    id: 2,
    name: "Fitness Tracker",
    description: "Advanced fitness tracker device",
    points: 1000,
    claimed: 12,
    total: 50,
    status: "active",
  },
  {
    id: 3,
    name: "Nutrition Plan",
    description: "Personalized nutrition plan",
    points: 300,
    claimed: 78,
    total: 200,
    status: "active",
  },
];

export function RewardsPage() {
  const [rewards] = useState<Reward[]>(mockRewards);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = rewards.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rewards Management</h1>
          <p className="text-gray-600 mt-2">Manage all available rewards</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          Create Reward
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search rewards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((reward) => (
          <div key={reward.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Gift size={24} className="text-purple-600" />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${reward.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {reward.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Required Points:</span>
                <span className="font-semibold text-gray-900">{reward.points}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Claimed:</span>
                <span className="font-semibold text-gray-900">{reward.claimed} / {reward.total}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(reward.claimed / reward.total) * 100}%` }}
              ></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Edit
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
