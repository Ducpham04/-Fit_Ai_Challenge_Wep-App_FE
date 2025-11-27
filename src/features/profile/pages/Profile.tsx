import { motion } from 'motion/react';
import { Trophy, Zap, Target, TrendingUp, Settings } from 'lucide-react';
import { mockUserProfile } from '../../../api/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const Profile = () => {
  const { user: authUser } = useAuth();
  
  // Nếu không có user từ auth, dùng mock data
  const user = authUser ? {
    ...mockUserProfile,
    email: authUser.email,
    username: authUser.fullName || authUser.email,
    avatar: authUser.avatar || mockUserProfile.avatar,
  } : mockUserProfile;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
        >
          <div className="h-32 bg-gradient-to-r from-sky-400 to-lime-400"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl text-gray-900 mb-1">{user.username}</h1>
                <p className="text-gray-600 mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                    Member since {new Date(user.joinDate).toLocaleDateString()}
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {user.currentStreak} day streak 🔥
                  </span>
                </div>
              </div>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="inline-block p-3 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl text-gray-900 mb-1">{user.aiScore}</p>
                <p className="text-sm text-gray-600">AI Score</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="inline-block p-3 bg-gradient-to-br from-lime-400 to-lime-500 rounded-lg mb-3">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl text-gray-900 mb-1">{user.challengesCompleted}</p>
                <p className="text-sm text-gray-600">Challenges</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="inline-block p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl text-gray-900 mb-1">{user.totalWorkouts}</p>
                <p className="text-sm text-gray-600">Workouts</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="inline-block p-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl text-gray-900 mb-1">{user.currentStreak}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl text-gray-900 mb-6">Activity Summary</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-3xl text-orange-500 mb-2">
                    {user.stats.totalCaloriesBurned.toLocaleString()}
                  </p>
                  <p className="text-gray-700">Calories Burned</p>
                </div>
                <div className="text-center p-4 bg-sky-50 rounded-lg">
                  <p className="text-3xl text-sky-500 mb-2">
                    {user.stats.totalMinutes.toLocaleString()}
                  </p>
                  <p className="text-gray-700">Active Minutes</p>
                </div>
                <div className="text-center p-4 bg-lime-50 rounded-lg">
                  <p className="text-3xl text-lime-500 mb-2">
                    {user.stats.favoriteWorkout}
                  </p>
                  <p className="text-gray-700">Favorite Type</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl text-gray-900 mb-6">Recent Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: '30 Day Streak', icon: '🔥', color: 'from-orange-400 to-red-400' },
                  { name: 'First 5K', icon: '🏃', color: 'from-sky-400 to-blue-400' },
                  { name: '100 Workouts', icon: '💪', color: 'from-purple-400 to-pink-400' },
                  { name: 'AI Master', icon: '🤖', color: 'from-lime-400 to-green-400' },
                ].map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${achievement.color} text-white text-center`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="text-sm">{achievement.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Goals Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Goals */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-sky-500" />
                <h2 className="text-2xl text-gray-900">My Goals</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Weekly Workouts</span>
                    <span className="text-sky-500">{user.goals.weeklyWorkouts}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">4 / 5 completed</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Daily Calories</span>
                    <span className="text-orange-500">{user.goals.dailyCalories} kcal</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">450 / 500 kcal</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Monthly Distance</span>
                    <span className="text-lime-500">{user.goals.monthlyDistance} km</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-lime-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">30 / 50 km</p>
                </div>
              </div>

              <button className="w-full mt-6 py-2 border-2 border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors">
                Edit Goals
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-sky-50 to-lime-50 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Workouts</span>
                  <span className="text-gray-900">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Calories</span>
                  <span className="text-gray-900">2,450 kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Minutes</span>
                  <span className="text-gray-900">380 min</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
