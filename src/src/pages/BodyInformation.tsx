import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BodyData {
  gender?: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  activity?: string;
  goal?: string;
  fitnessLevel?: string;
  planDays?: number;
  updatedAt?: number;
}

interface PlanRow {
  day: number;
  pushup: number;
  squat: number;
  jumpingJack: number;
  plank: number;
}

const genderLabel: Record<string, string> = {
  male: 'Male',
  female: 'Female',
};

const activityLabel: Record<string, string> = {
  sedentary: 'Sedentary',
  light: 'Light (1–3 times/week)',
  moderate: 'Moderate (3–5 times/week)',
  active: 'Active (6–7 times/week)',
  athlete: 'Very Active (Athlete)',
};

const goalLabel: Record<string, string> = {
  maintain: 'Maintain Weight',
  lose: 'Lose Weight',
  gain: 'Gain Muscle',
};

const fitnessLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function BodyInformation() {
  const navigate = useNavigate();
  const [bodyData, setBodyData] = useState<BodyData | null>(null);
  const [plan, setPlan] = useState<PlanRow[] | null>(null);

  // Calculate PF (Physical Fitness Index)
  const calculatePF = (bodyData: BodyData): number | null => {
    if (!bodyData.height || !bodyData.weight) return null;

    const Lmap: Record<string, number> = {
      beginner: 0.6,
      intermediate: 1.0,
      advanced: 1.3,
    };
    const L = Lmap[bodyData.fitnessLevel || 'intermediate'] || 1.0;

    const ageN = Number(bodyData.age) || 0;
    let A = 1.0;
    if (ageN <= 30) A = 1.0;
    else if (ageN <= 45) A = 0.9;
    else if (ageN <= 60) A = 0.8;
    else A = 0.7;

    const G = bodyData.gender === 'male' ? 1.0 : 0.85;

    const h = Number(bodyData.height);
    const w = Number(bodyData.weight);
    if (w === 0) return null;

    let pf = ((h - 100) / w) * L * A * G;
    if (pf < 0.4) pf = 0.4;
    if (pf > 1.5) pf = 1.5;
    return pf;
  };

  // Get progression coefficient based on plan days and fitness level
  const progressionK = (days: number, level: string): number => {
    const table: Record<number, Record<string, number>> = {
      7: { beginner: 0.04, intermediate: 0.05, advanced: 0.06 },
      14: { beginner: 0.03, intermediate: 0.035, advanced: 0.04 },
      21: { beginner: 0.025, intermediate: 0.03, advanced: 0.035 },
      30: { beginner: 0.02, intermediate: 0.025, advanced: 0.03 },
      60: { beginner: 0.015, intermediate: 0.02, advanced: 0.025 },
      90: { beginner: 0.012, intermediate: 0.017, advanced: 0.022 },
    };
    return table[days]?.[level] ?? 0.02;
  };

  // Generate workout plan
  const generatePlan = (bodyData: BodyData): PlanRow[] => {
    const pf = calculatePF(bodyData);
    if (!pf) return [];

    // Calculate initial reps based on PF
    let pushup = 25 * pf;
    let squat = 35 * (pf + 0.1);
    let jumpingJack = 100 * (pf + 0.2);
    let plank = 40 * (pf + 0.1);

    // Adjust based on goal
    const goal = bodyData.goal || 'maintain';
    if (goal === 'lose') {
      jumpingJack *= 1.1;
      squat *= 1.1;
    } else if (goal === 'gain') {
      pushup *= 1.1;
      plank *= 1.1;
    }

    // Round initial values
    const S1 = {
      pushup: Math.max(1, Math.round(pushup)),
      squat: Math.max(1, Math.round(squat)),
      jumpingJack: Math.max(1, Math.round(jumpingJack)),
      plank: Math.max(5, Math.round(plank)),
    };

    // Generate progression
    const k = progressionK(bodyData.planDays || 14, bodyData.fitnessLevel || 'intermediate');
    const days: PlanRow[] = [];
    for (let d = 1; d <= (bodyData.planDays || 14); d++) {
      const factor = Math.pow(1 + k, d - 1);
      days.push({
        day: d,
        pushup: Math.max(1, Math.round(S1.pushup * factor)),
        squat: Math.max(1, Math.round(S1.squat * factor)),
        jumpingJack: Math.max(1, Math.round(S1.jumpingJack * factor)),
        plank: Math.max(5, Math.round(S1.plank * factor)),
      });
    }

    return days;
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('userFormData');
    let profile: BodyData | null = null;

    if (savedProfile) {
      try {
        profile = JSON.parse(savedProfile);
        setBodyData(profile);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }

    const savedPlan = localStorage.getItem('userPlan');
    let planData: PlanRow[] | null = null;

    if (savedPlan) {
      try {
        planData = JSON.parse(savedPlan);
        setPlan(planData);
      } catch (err) {
        console.error('Error loading plan:', err);
      }
    }

    // If body data is available, generate plan (regenerate if planDays changes)
    if (profile) {
      const generatedPlan = generatePlan(profile);
      if (generatedPlan.length > 0) {
        setPlan(generatedPlan);
        try {
          localStorage.setItem('userPlan', JSON.stringify(generatedPlan));
        } catch (err) {
          console.error('Error saving generated plan:', err);
        }
      }
    }
  }, []);

  if (!bodyData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Body Information</h1>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center text-gray-600">
            No body information saved. Please enter your information first.
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate('/bodyinformation/edit')}
                className="px-6 py-2 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Update Body Information
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lastUpdated = bodyData.updatedAt
    ? new Date(bodyData.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not updated';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-sky-600 hover:text-sky-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Body Information</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Body Information Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Giới tính */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Gender</label>
              <div className="text-lg font-semibold text-gray-900">
                {genderLabel[bodyData.gender || 'male'] || bodyData.gender}
              </div>
            </div>

            {/* Tuổi */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Age</label>
              <div className="text-lg font-semibold text-gray-900">
                {bodyData.age || '-'} years old
              </div>
            </div>

            {/* Chiều cao */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Height</label>
              <div className="text-lg font-semibold text-gray-900">
                {bodyData.height ? `${bodyData.height} cm` : '-'}
              </div>
            </div>

            {/* Cân nặng */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Weight</label>
              <div className="text-lg font-semibold text-gray-900">
                {bodyData.weight ? `${bodyData.weight} kg` : '-'}
              </div>
            </div>

            {/* Mức độ hoạt động */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Activity Level</label>
              <div className="text-lg font-semibold text-gray-900">
                {activityLabel[bodyData.activity || 'moderate'] || bodyData.activity}
              </div>
            </div>

            {/* Mục tiêu */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Goal</label>
              <div className="text-lg font-semibold text-gray-900">
                {goalLabel[bodyData.goal || 'maintain'] || bodyData.goal}
              </div>
            </div>

            {/* Cấp độ thể lực */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Fitness Level</label>
              <div className="text-lg font-semibold text-gray-900">
                {fitnessLabel[bodyData.fitnessLevel || 'intermediate'] || bodyData.fitnessLevel}
              </div>
            </div>

            {/* Lộ trình */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Plan Duration (days)</label>
              <div className="text-lg font-semibold text-gray-900">
                {bodyData.planDays || 14} days
              </div>
            </div>
          </div>
        </div>

        {/* Plan Table */}
        {plan && plan.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              {bodyData.planDays || 14}-Day Plan - {fitnessLabel[bodyData.fitnessLevel || 'intermediate']}
            </h2>
            <div className="overflow-auto max-h-96 border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Day</th>
                    <th className="p-3 text-left">Push-ups (reps)</th>
                    <th className="p-3 text-left">Squats (reps)</th>
                    <th className="p-3 text-left">Jumping Jacks (reps)</th>
                    <th className="p-3 text-left">Plank (seconds)</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.map((row) => (
                    <tr key={row.day} className="border-t hover:bg-gray-50">
                      <td className="p-3">{row.day}</td>
                      <td className="p-3">{row.pushup}</td>
                      <td className="p-3">{row.squat}</td>
                      <td className="p-3">{row.jumpingJack}</td>
                      <td className="p-3">{row.plank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(!plan || plan.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <p className="text-gray-600 text-center">No workout plan generated yet. Click "Update Body Information" and then "Save Changes" to generate a plan.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate('/bodyinformation/edit')}
              className="px-6 py-2 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Update Body Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
