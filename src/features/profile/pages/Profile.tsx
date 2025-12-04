import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Zap, Target, TrendingUp, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getUserFullProfile } from "../api/profileService";
import { ProfileDTO } from "../userProfile.type";

export const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Load API
  useEffect(() => {
    if (!authUser?.id) return;

    const loadData = async () => {
      try {
        const data = await getUserFullProfile(authUser.id);
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authUser]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) return <p className="text-center mt-10">No profile data</p>;

  const { profile: user, stats, activity, goals } = profile;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
        >
          <div className="h-32 bg-gradient-to-r from-sky-400 to-lime-400" />

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 -mt-16">

              <img
                src={user.avatar}
                alt={user.username}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl text-gray-900">{user.username}</h1>
                <p className="text-gray-600 mb-3">{user.email}</p>

                <div className="flex gap-3 justify-center md:justify-start">
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
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>

            </div>
          </div>
        </motion.div>

        {/* CONTENT */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<TrendingUp />} value={stats.aiScore} label="AI Score" color="sky" />
              <StatCard icon={<Trophy />} value={stats.challengesCompleted} label="Challenges" color="lime" />
              <StatCard icon={<Zap />} value={stats.totalWorkouts} label="Workouts" color="orange" />
              <StatCard icon={<Target />} value={stats.currentStreak} label="Day Streak" color="purple" />
            </div>

            {/* Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl text-gray-900 mb-6">Activity Summary</h2>

              <div className="grid md:grid-cols-3 gap-6">
                <ActivityBox value={activity.totalCaloriesBurned} label="Calories Burned" />
                <ActivityBox value={activity.totalMinutes} label="Minutes Active" />
                <ActivityBox value={activity.favoriteWorkout} label="Favorite Workout" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Goals */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-sky-500" />
                <h2 className="text-xl text-gray-900">My Goals</h2>
              </div>

              <GoalItem label="Weekly Workouts" value={goals.weeklyWorkouts} />
              <GoalItem label="Daily Calories" value={goals.dailyCalories + " kcal"} />
              <GoalItem label="Monthly Distance" value={(goals.monthlyDistance ?? 0) + " km"} />

              <button className="w-full mt-6 py-2 border-2 border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50">
                Edit Goals
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// TYPES
type ColorKey = "sky" | "lime" | "orange" | "purple";

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: ColorKey;
}

interface ActivityBoxProps {
  value: number | string;
  label: string;
}

interface GoalItemProps {
  label: string;
  value: string | number;
}

// COMPONENTS
const StatCard = ({ icon, value, label, color }: StatCardProps) => {
  const bgColors: Record<ColorKey, string> = {
    sky: "from-sky-400 to-sky-500",
    lime: "from-lime-400 to-lime-500",
    orange: "from-orange-400 to-orange-500",
    purple: "from-purple-400 to-purple-500",
  };

  const bg = bgColors[color];
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className={`inline-block p-3 bg-gradient-to-br ${bg} rounded-lg mb-3 text-white`}>
        {icon}
      </div>
      <p className="text-2xl text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

const ActivityBox = ({ value, label }: ActivityBoxProps) => (
  <div className="text-center p-4 bg-sky-50 rounded-lg">
    <p className="text-3xl text-sky-500 mb-2">{value}</p>
    <p className="text-gray-700">{label}</p>
  </div>
);

const GoalItem = ({ label, value }: GoalItemProps) => (
  <div className="mb-4">
    <div className="flex justify-between mb-2">
      <span className="text-gray-700">{label}</span>
      <span className="text-sky-500">{value}</span>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded-full">
      <div
        className="h-full bg-sky-500 rounded-full"
        style={{ width: `${Math.min(Number(value) || 0, 100)}%` }}
      />
    </div>
  </div>
);
