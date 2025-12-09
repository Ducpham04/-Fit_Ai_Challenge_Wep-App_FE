import { useState, useEffect } from "react";
import { ArrowLeft, Save, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import client from "@/api/client";

interface BodyProfileForm {
  height: number;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  age: number;
  gender: string;
  experienceLevel: string;
  goal: string;
  injuryNotes: string;
}

export const BodyProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BodyProfileForm>({
    height: 0,
    weight: 0,
    bodyFat: undefined,
    muscleMass: undefined,
    age: 0,
    gender: "",
    experienceLevel: "beginner",
    goal: "maintain_fitness",
    injuryNotes: "",
  });

  // Load existing body profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await client.get("/user/profile/body");
        if (response.data?.success && response.data?.data) {
          const profile = response.data.data;
          setFormData({
            height: profile.height || 0,
            weight: profile.weight || 0,
            bodyFat: profile.bodyFat,
            muscleMass: profile.muscleMass,
            age: profile.age || 0,
            gender: profile.gender || "",
            experienceLevel: profile.experienceLevel || "beginner",
            goal: profile.goal || "maintain_fitness",
            injuryNotes: profile.injuryNotes || "",
          });
        }
      } catch (err) {
        console.log("No existing body profile");
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await client.post("/user/profile/body", formData);
      
      if (response.data?.success) {
        toast.success("Body profile saved successfully!");
        navigate("/profile");
      } else {
        toast.error(response.data?.message || "Error saving body profile");
      }
    } catch (error: any) {
      console.error("Error saving body profile:", error);
      toast.error(error?.response?.data?.message || "Error saving body profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/profile")}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Profile</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Body Profile</h1>
              <p className="text-gray-600 mt-1">
                Enter your body information for personalized training plans
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.height || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="175.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weight || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max="100"
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bodyFat: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="15.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Muscle Mass (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.muscleMass || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, muscleMass: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="50.0"
                />
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, experienceLevel: level })}
                    className={`px-4 py-3 rounded-lg border-2 transition ${
                      formData.experienceLevel === level
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="capitalize font-medium">{level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Goal *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "lose_weight", label: "Lose Weight" },
                  { value: "build_muscle", label: "Build Muscle" },
                  { value: "maintain_fitness", label: "Maintain Fitness" },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: goal.value })}
                    className={`px-4 py-3 rounded-lg border-2 transition ${
                      formData.goal === goal.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Injury Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Injury Notes (Optional)
              </label>
              <textarea
                value={formData.injuryNotes}
                onChange={(e) =>
                  setFormData({ ...formData, injuryNotes: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="E.g., Knee injury, back pain, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Mention any injuries or limitations. The system will adjust exercises accordingly.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save size={16} className="mr-2" />
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};




