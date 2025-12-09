import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { InfoBodyAPI, GoalDTO } from '@/api/infoBody.api';
import { ArrowRight, User, Ruler, Weight, Calendar, Target, Activity } from 'lucide-react';

export const BodyInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<GoalDTO[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    heightCm: '',
    weightKg: '',
    goalId: '',
    workoutFrequency: '3', // days per week
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await InfoBodyAPI.getGoals();
      if (res.success && res.data) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error('Error loading goals:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.gender) {
          setError('Please select your gender');
          return false;
        }
        if (!formData.age || parseInt(formData.age) < 10 || parseInt(formData.age) > 100) {
          setError('Please enter a valid age (10-100)');
          return false;
        }
        return true;
      case 2:
        if (!formData.heightCm || parseFloat(formData.heightCm) < 100 || parseFloat(formData.heightCm) > 250) {
          setError('Please enter a valid height (100-250 cm)');
          return false;
        }
        if (!formData.weightKg || parseFloat(formData.weightKg) < 30 || parseFloat(formData.weightKg) > 300) {
          setError('Please enter a valid weight (30-300 kg)');
          return false;
        }
        return true;
      case 3:
        if (!formData.goalId) {
          setError('Please select your fitness goal');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate BMI
      const heightCm = parseFloat(formData.heightCm);
      const weightKg = parseFloat(formData.weightKg);
      const { bmi, bodyType } = InfoBodyAPI.calculateBMI(heightCm, weightKg);

      // Create body info record
      const bodyInfo = {
        userId: parseInt(user.id),
        heightCm,
        weightKg,
        age: parseInt(formData.age),
        gender: formData.gender,
        bmi,
        goalId: parseInt(formData.goalId),
      };

      const res = await InfoBodyAPI.create(bodyInfo);

      if (res.success) {
        // Navigate to recommended plan page with analysis results
        navigate('/onboarding/recommended', {
          state: {
            bodyInfo: res.data,
            bmi,
            bodyType,
            workoutFrequency: parseInt(formData.workoutFrequency),
            goalId: parseInt(formData.goalId),
          }
        });
      } else {
        setError(res.message || 'Failed to save body information');
      }
    } catch (err: any) {
      console.error('Error submitting body info:', err);
      setError(err?.response?.data?.message || 'Failed to save body information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedGoal = goals.find(g => g.id === parseInt(formData.goalId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 3</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'Your body measurements'}
              {step === 3 && 'Your fitness goals'}
            </h1>
            <p className="text-gray-600">
              {step === 1 && 'We need some basic information to personalize your experience'}
              {step === 2 && 'Help us understand your current body composition'}
              {step === 3 && 'What do you want to achieve?'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handleInputChange('gender', gender)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.gender === gender
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{gender}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Age
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Body Measurements */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Ruler className="w-5 h-5 text-blue-600" />
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={formData.heightCm}
                  onChange={(e) => handleInputChange('heightCm', e.target.value)}
                  placeholder="e.g., 175"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enter your height in centimeters</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Weight className="w-5 h-5 text-blue-600" />
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={(e) => handleInputChange('weightKg', e.target.value)}
                  placeholder="e.g., 70.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enter your current weight in kilograms</p>
              </div>

              {formData.heightCm && formData.weightKg && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Estimated BMI:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {InfoBodyAPI.calculateBMI(
                      parseFloat(formData.heightCm),
                      parseFloat(formData.weightKg)
                    ).bmi}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Body Type: {InfoBodyAPI.calculateBMI(
                      parseFloat(formData.heightCm),
                      parseFloat(formData.weightKg)
                    ).bodyType}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  Fitness Goal
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => handleInputChange('goalId', goal.id.toString())}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.goalId === goal.id.toString()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {goal.imageLink && (
                          <img 
                            src={goal.imageLink} 
                            alt={goal.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                        {formData.goalId === goal.id.toString() && (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Workout Frequency (days per week)
                </label>
                <select
                  value={formData.workoutFrequency}
                  onChange={(e) => handleInputChange('workoutFrequency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="2">2 days per week</option>
                  <option value="3">3 days per week</option>
                  <option value="4">4 days per week</option>
                  <option value="5">5 days per week</option>
                  <option value="6">6 days per week</option>
                  <option value="7">7 days per week</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              {step > 1 ? '← Back' : 'Cancel'}
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                'Processing...'
              ) : step === 3 ? (
                <>
                  Complete Setup
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};





