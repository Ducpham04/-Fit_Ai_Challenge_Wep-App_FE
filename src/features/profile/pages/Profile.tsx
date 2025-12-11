import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Zap, Target, TrendingUp, Settings, Scale } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getUserFullProfile } from "../api/profileService";
import { ProfileDTO } from "../userProfile.type";
import { UserInfoAPI, UserInfoDTO } from "../../../api/userInfo.api";
import { Button } from "../../../components/ui/button";
import { useAvatarUrl } from "../../../hooks/useFileUrl";

export const Profile = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Load API - reload when location changes (user navigates back from body-record)
  useEffect(() => {
    if (!authUser?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        console.log("📤 [Profile] Loading profile data...");
        const [profileData, userInfoResponse] = await Promise.all([
          getUserFullProfile(authUser.id),
          UserInfoAPI.getUserInfo().catch((err) => {
            console.log("⚠️ [Profile] No user info found or error:", err);
            return null;
          })
        ]);
        setProfile(profileData);
        
        // Axios wraps response in data, so extract from response.data.data
        const userInfoData = userInfoResponse?.data?.data ?? userInfoResponse?.data;
        if (userInfoData) {
          console.log("✅ [Profile] User info loaded:", userInfoData);
          setUserInfo(userInfoData);
        } else {
          console.log("ℹ️ [Profile] No user info data available");
          setUserInfo(null); // Reset nếu không có data
        }
      } catch (err) {
        console.error("❌ [Profile] Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authUser, location.key]); // Reload when location changes (user navigates back)

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
  
  // Lấy avatar URL với presigned URL
  const avatarUrl = useAvatarUrl(user.avatar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-lime-50/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100"
        >
          <div className="h-32 bg-gradient-to-r from-sky-400 via-sky-500 to-lime-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          </div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 -mt-16">

              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 
                className="text-2xl font-bold mb-6"
                style={{
                  background: 'linear-gradient(to right, #0284c7, #65a30d)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Activity Summary
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <ActivityBox value={activity.totalCaloriesBurned} label="Calories Burned" />
                <ActivityBox value={activity.totalMinutes} label="Minutes Active" />
                <ActivityBox value={activity.favoriteWorkout} label="Favorite Workout" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Body Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-sky-100 to-lime-100 rounded-lg">
                  <Scale className="w-6 h-6 text-sky-600" />
                </div>
                <h2 
                  className="text-xl font-bold"
                  style={{
                    background: 'linear-gradient(to right, #0284c7, #65a30d)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Body Information
                </h2>
              </div>

              {userInfo ? (
                <>
                  <div className="space-y-3 mb-4">
                    <InfoRow label="Height" value={`${userInfo.heightCm || 0} cm`} />
                    <InfoRow label="Weight" value={`${userInfo.weightKg || 0} kg`} />
                    <InfoRow label="Age" value={`${userInfo.age || 0} years`} />
                    <InfoRow label="Gender" value={userInfo.gender || "N/A"} />
                    {userInfo.bmi && (
                      <InfoRow label="BMI" value={userInfo.bmi.toFixed(2)} />
                    )}
                    {userInfo.bmr && (
                      <InfoRow label="BMR" value={`${userInfo.bmr.toFixed(0)} kcal/day`} />
                    )}
                    {userInfo.recommendedCalories && (
                      <InfoRow 
                        label="Recommended Calories" 
                        value={`${userInfo.recommendedCalories.toFixed(0)} kcal/day`} 
                      />
                    )}
                    {userInfo.bodyFatPct && (
                      <InfoRow label="Body Fat" value={`${userInfo.bodyFatPct.toFixed(1)}%`} />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate("/profile/body-profile")}
                      className="flex-1"
                      variant="default"
                    >
                      Body Profile
                    </Button>
                    <Button
                      onClick={() => navigate("/profile/body-record")}
                      className="flex-1"
                      variant="outline"
                    >
                      Update Metrics
                    </Button>
                    <Button
                      onClick={() => navigate("/profile/body-progress")}
                      className="flex-1"
                      variant="outline"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Progress
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Chưa có thông tin body</p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate("/profile/body-profile")}
                      className="w-full"
                      variant="default"
                    >
                      Complete Body Profile
                    </Button>
                    <Button
                      onClick={() => navigate("/profile/body-record")}
                      className="w-full"
                      variant="outline"
                    >
                      Update Metrics
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Goals */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h2 
                  className="text-xl font-bold"
                  style={{
                    background: 'linear-gradient(to right, #0284c7, #65a30d)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  My Goals
                </h2>
              </div>

              {goals && (goals.weeklyWorkouts !== null || goals.dailyCalories !== null || goals.goalName) ? (
                <>
                  {/* Show primary goal name */}
                  {goals.goalName && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-sky-50 to-lime-50 rounded-lg border border-sky-200">
                      <p className="text-xs text-gray-600 mb-1">Primary Goal</p>
                      <p className="text-sm font-semibold text-sky-700">{goals.goalName}</p>
                    </div>
                  )}

                  {/* Weekly Workouts */}
                  {goals.weeklyWorkouts !== null && goals.weeklyWorkouts !== undefined && (
                    <GoalItem 
                      label="Weekly Workouts" 
                      value={goals.weeklyWorkouts} 
                      target={goals.weeklyWorkoutsTarget || 5}
                      unit=""
                    />
                  )}

                  {/* Daily Calories */}
                  {goals.dailyCalories !== null && goals.dailyCalories !== undefined && goals.dailyCalories > 0 && (
                    <GoalItem 
                      label="Daily Calories Target" 
                      value={`${goals.dailyCalories} kcal`}
                      target={goals.dailyCalories}
                      unit="kcal"
                    />
                  )}

                  {/* Monthly Distance */}
                  {goals.monthlyDistance !== null && goals.monthlyDistance !== undefined && goals.monthlyDistance > 0 && (
                    <GoalItem 
                      label="Monthly Distance" 
                      value={`${goals.monthlyDistance} km`}
                      target={goals.monthlyDistance}
                      unit="km"
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No goals set yet</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Complete your body profile to get personalized goals
                  </p>
                  <button
                    onClick={() => navigate("/profile/body-profile")}
                    className="w-full py-2 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    Set Up Goals
                  </button>
                </div>
              )}

              {goals && (goals.weeklyWorkouts || goals.dailyCalories) && (
                <button 
                  onClick={() => navigate("/profile/body-profile")}
                  className="w-full mt-6 py-2 border-2 border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  Edit Goals
                </button>
              )}
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
  target?: number;
  unit?: string;
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
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 transform">
      <div className={`inline-block p-3 bg-gradient-to-br ${bg} rounded-xl mb-3 text-white shadow-md`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
    </div>
  );
};

const ActivityBox = ({ value, label }: ActivityBoxProps) => (
  <div className="text-center p-4 bg-sky-50 rounded-lg">
    <p className="text-3xl text-sky-500 mb-2">{value}</p>
    <p className="text-gray-700">{label}</p>
  </div>
);

const GoalItem = ({ label, value, target, unit }: GoalItemProps) => {
  // Extract number from value if it's a string like "2000 kcal"
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^\d.]/g, '')) || 0
    : (value as number) || 0;
  
  // Calculate percentage (use target if provided, otherwise use value as 100%)
  const percentage = target && target > 0
    ? Math.min((numericValue / target) * 100, 100)
    : 0;

  const displayUnit = unit || (typeof value === 'string' && value.includes('kcal') ? 'kcal' : typeof value === 'string' && value.includes('km') ? 'km' : '');

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 font-medium">{label}</span>
        <div className="text-right">
          <span className="text-sky-600 font-semibold">{numericValue}</span>
          {target && target > 0 && (
            <span className="text-gray-500 text-sm ml-1">/ {target}</span>
          )}
          {displayUnit && (
            <span className="text-gray-500 text-sm ml-1">{displayUnit}</span>
          )}
        </div>
      </div>
      {target && target > 0 ? (
        <>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${Math.max(0, Math.min(100, percentage))}%`,
                minWidth: percentage > 0 ? '2px' : '0px'
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {percentage.toFixed(0)}% complete
          </p>
        </>
      ) : (
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600">{label}</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
);
