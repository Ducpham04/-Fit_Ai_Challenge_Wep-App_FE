import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Clock, 
  Zap, 
  Target, 
  TrendingUp, 
  Loader2, 
  Activity,
  Award,
  Calendar,
  ArrowUp,
  ArrowDown,
  Play,
  CheckCircle2
} from 'lucide-react';
import { getDashboardStats, getRecentActivities, DashboardStats, RecentActivity } from '../api/dashboardService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { useAuth } from '@/context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsData, activitiesData] = await Promise.all([
          getDashboardStats(user.id.toString()),
          getRecentActivities(user.id.toString(), 5),
        ]);
        setStats(statsData);
        setRecentActivities(activitiesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    const handleFocus = () => {
      loadDashboardData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);
  
  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const caloriesProgress = stats.todayProgress.caloriesGoal > 0 
    ? Math.min(100, Math.round((stats.todayProgress.calories / stats.todayProgress.caloriesGoal) * 100))
    : 0;
  
  const workoutsProgress = stats.todayProgress.workoutsGoal > 0
    ? Math.min(100, Math.round((stats.todayProgress.workouts / stats.todayProgress.workoutsGoal) * 100))
    : 0;
  
  const minutesProgress = stats.todayProgress.minutesGoal > 0
    ? Math.min(100, Math.round((stats.todayProgress.minutes / stats.todayProgress.minutesGoal) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-2">
              {getGreeting()}, {user?.fullName || 'Fitness Enthusiast'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's your fitness journey overview
            </p>
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">{stats.currentStreak} Day Streak</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Award className="w-5 h-5" />
                <span className="font-semibold">{stats.weeklyWorkouts} Workouts This Week</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Weekly Calories</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.weeklyCalories.toLocaleString()}</p>
            <p className="text-sm text-gray-500">kcal burned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Workouts</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.weeklyWorkouts}</p>
            <p className="text-sm text-gray-500">sessions this week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Active Minutes</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.weeklyMinutes}</p>
            <p className="text-sm text-gray-500">minutes this week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              {stats.currentStreak > 0 ? (
                <ArrowUp className="w-5 h-5 text-purple-500" />
              ) : (
                <ArrowDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Current Streak</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.currentStreak}</p>
            <p className="text-sm text-gray-500">days in a row</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Weekly Activity</h2>
                  <p className="text-sm text-gray-500">Last 7 days performance</p>
                </div>
              </div>
            </div>
            
            {stats.weeklyChart && stats.weeklyChart.length > 0 && stats.weeklyChart.some(d => d.calories > 0 || d.minutes > 0) ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={stats.weeklyChart}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#666" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#f97316" 
                    fillOpacity={1} 
                    fill="url(#colorCalories)" 
                    name="Calories (kcal)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorMinutes)" 
                    name="Minutes"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-1">No activity data yet</p>
                  <p className="text-sm text-gray-400">Complete some challenges to see your weekly activity!</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Today's Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Today's Goals</h2>
                <p className="text-sm text-gray-500">Your daily targets</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Calories Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Calories</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.todayProgress.calories} / {stats.todayProgress.caloriesGoal}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${caloriesProgress}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{caloriesProgress}% complete</p>
              </div>

              {/* Workouts Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Workouts</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.todayProgress.workouts} / {stats.todayProgress.workoutsGoal}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${workoutsProgress}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{workoutsProgress}% complete</p>
              </div>

              {/* Minutes Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Minutes</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.todayProgress.minutes} / {stats.todayProgress.minutesGoal}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${minutesProgress}%` }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{minutesProgress}% complete</p>
              </div>
            </div>

            {/* Motivation Message */}
            <div className={`mt-6 p-4 rounded-xl ${
              workoutsProgress >= 100
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
            }`}>
              {workoutsProgress >= 100 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Amazing! You've completed all your goals today! 🎉
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Keep going!</span> You're making great progress. 💪
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
                <p className="text-sm text-gray-500">Your latest workout sessions</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl shadow-sm">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold mb-1">{activity.title}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {activity.time}
                        </span>
                        {activity.type && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {activity.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-bold mb-1">{activity.duration}</p>
                    {activity.calories > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-600 font-semibold">{activity.calories} kcal</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-1">No recent activities</p>
                <p className="text-sm text-gray-400">Complete some challenges to see your activities here!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
