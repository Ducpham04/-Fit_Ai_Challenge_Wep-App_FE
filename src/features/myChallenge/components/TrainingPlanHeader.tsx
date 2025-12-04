import React from 'react';

interface TrainingPlanHeaderProps {
  planName: string;
  description: string;
  difficulty: string;
  progressPercentage: number;
  daysCompleted: number;
  totalDays: number;
  userName: string;
  userAvatar?: string;
}

export const TrainingPlanHeader: React.FC<TrainingPlanHeaderProps> = ({
  planName,
  description,
  difficulty,
  progressPercentage,
  daysCompleted,
  totalDays,
  userName,
  userAvatar,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{planName}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getDifficultyColor(difficulty)}`}>
          {difficulty}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">{userName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-600">Assigned to</p>
          <p className="font-semibold text-gray-900">{userName}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 text-right">
          {daysCompleted} of {totalDays} days completed
        </div>
      </div>
    </div>
  );
};
