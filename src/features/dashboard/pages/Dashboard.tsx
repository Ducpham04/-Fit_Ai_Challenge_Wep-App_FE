import { motion } from 'motion/react';
import { Flame, Clock, Zap, Target, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { mockDashboardStats } from '../api/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Dashboard = () => {
  const stats = mockDashboardStats;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl text-gray-900 mb-2">Dashboard</h1>
          <p className="text-xl text-gray-600">Track your fitness journey</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Weekly Calories"
            value={stats.weeklyCalories}
            icon={Flame}
            subtitle="kcal burned"
            color="orange"
            trend={12}
          />
          <StatCard
            title="Workouts This Week"
            value={stats.weeklyWorkouts}
            icon={Zap}
            subtitle="sessions"
            color="sky"
            trend={8}
          />
          <StatCard
            title="Active Minutes"
            value={stats.weeklyMinutes}
            icon={Clock}
            subtitle="this week"
            color="lime"
            trend={15}
          />
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            icon={Target}
            subtitle="Keep it up!"
            color="purple"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weekly Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-sky-500" />
              <h2 className="text-2xl text-gray-900">Weekly Activity</h2>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="calories" fill="#38bdf8" name="Calories" radius={[8, 8, 0, 0]} />
                <Bar dataKey="minutes" fill="#84cc16" name="Minutes" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Today's Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl text-gray-900 mb-6">Today's Goals</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-900">Calories</span>
                </div>
                <ProgressBar
                  current={stats.todayProgress.calories}
                  target={stats.todayProgress.caloriesGoal}
                  color="orange"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-sky-500" />
                  <span className="text-gray-900">Workouts</span>
                </div>
                <ProgressBar
                  current={stats.todayProgress.workouts}
                  target={stats.todayProgress.workoutsGoal}
                  color="sky"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-lime-500" />
                  <span className="text-gray-900">Minutes</span>
                </div>
                <ProgressBar
                  current={stats.todayProgress.minutes}
                  target={stats.todayProgress.minutesGoal}
                  color="lime"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-lime-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Great progress! You've exceeded your workout goal for today! 🎉
              </p>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-2xl text-gray-900 mb-6">Recent Activities</h2>
          
          <div className="space-y-4">
            {[
              {
                title: 'Morning Run',
                time: 'Today, 7:00 AM',
                duration: '35 min',
                calories: 280,
                type: 'Cardio',
              },
              {
                title: 'Strength Training',
                time: 'Today, 6:00 PM',
                duration: '45 min',
                calories: 320,
                type: 'Strength',
              },
              {
                title: 'Yoga Flow',
                time: 'Yesterday, 8:00 AM',
                duration: '30 min',
                calories: 150,
                type: 'Flexibility',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-sky-400 to-lime-400 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">{activity.duration}</p>
                  <p className="text-sm text-orange-500">{activity.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
