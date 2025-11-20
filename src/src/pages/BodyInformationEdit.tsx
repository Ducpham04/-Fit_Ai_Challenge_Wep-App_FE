import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BodyData {
  gender: string;
  age: number | string;
  height: number | string;
  weight: number | string;
  activity: string;
  goal: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  planDays: number;
}

export default function BodyInformationEdit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BodyData>({
    gender: 'male',
    age: '',
    height: '',
    weight: '',
    activity: 'moderate',
    goal: 'maintain',
    fitnessLevel: 'intermediate',
    planDays: 14,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userFormData');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFormData({
          gender: profile.gender || 'male',
          age: profile.age || '',
          height: profile.height || '',
          weight: profile.weight || '',
          activity: profile.activity || 'moderate',
          goal: profile.goal || 'maintain',
          fitnessLevel: profile.fitnessLevel || 'intermediate',
          planDays: profile.planDays || 14,
        });
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }
  }, []);

  const parseNumber = (v: string | number) => {
    if (v === '') return '';
    return Number(v);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' || name === 'planDays'
        ? parseNumber(value)
        : value,
    }));
  };

  const handleUpdate = () => {
    const profileData = {
      gender: formData.gender,
      age: formData.age === '' ? null : Number(formData.age),
      height: formData.height === '' ? null : Number(formData.height),
      weight: formData.weight === '' ? null : Number(formData.weight),
      activity: formData.activity,
      goal: formData.goal,
      fitnessLevel: formData.fitnessLevel,
      planDays: formData.planDays,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem('userFormData', JSON.stringify(profileData));
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/bodyinformation');
      }, 1500);
    } catch (err) {
      console.error('Error saving data:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/bodyinformation')}
            className="flex items-center gap-2 text-sky-600 hover:text-sky-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Update Body Information</h1>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Giới tính */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Tuổi */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Age</label>
              <input
                type="number"
                name="age"
                min={1}
                max={120}
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Chiều cao */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                name="height"
                min={30}
                max={300}
                value={formData.height}
                onChange={handleChange}
                placeholder="170"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Cân nặng */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                min={10}
                max={500}
                value={formData.weight}
                onChange={handleChange}
                placeholder="65"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Mức độ hoạt động */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Activity Level</label>
              <select
                name="activity"
                value={formData.activity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light (1–3 times/week)</option>
                <option value="moderate">Moderate (3–5 times/week)</option>
                <option value="active">Active (6–7 times/week)</option>
                <option value="athlete">Very Active (Athlete)</option>
              </select>
            </div>

            {/* Mục tiêu */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                <option value="maintain">Maintain Weight</option>
                <option value="lose">Lose Weight</option>
                <option value="gain">Gain Muscle</option>
              </select>
            </div>

            {/* Cấp độ thể lực */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Fitness Level</label>
              <select
                name="fitnessLevel"
                value={formData.fitnessLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Lộ trình */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Plan Duration (days)</label>
              <select
                name="planDays"
                value={formData.planDays}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                <option value={7}>7</option>
                <option value={14}>14</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleUpdate}
              className="px-6 py-2 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Save Changes
            </button>
            {saved && (
              <div className="ml-auto text-sm text-green-700 bg-green-100 px-3 py-2 rounded flex items-center">
                ✓ Saved successfully
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
