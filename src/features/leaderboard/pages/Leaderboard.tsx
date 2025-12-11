import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, TrendingUp, Loader2 } from 'lucide-react';
import { getGlobalLeaderboard, getUserRank, LeaderboardEntry, LeaderboardCategory } from '../api/leaderboardService';
import { useAuth } from '@/context/AuthContext';

export const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<LeaderboardCategory>('points');
  const [userRank, setUserRank] = useState<{ rank: number; total: number } | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        const [data, rank] = await Promise.all([
          getGlobalLeaderboard(category, 'all-time', user?.id?.toString(), 50),
          user?.id ? getUserRank(user.id.toString(), category, 'all-time') : Promise.resolve(null),
        ]);
        setLeaderboard(data);
        setUserRank(rank);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [category, user?.id]);

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  const getCategoryLabel = (cat: LeaderboardCategory) => {
    switch (cat) {
      case 'points':
        return 'AI Score';
      case 'challenges':
        return 'Challenges';
      case 'streak':
        return 'Streak';
      default:
        return 'AI Score';
    }
  };

  const getCategoryValue = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'points':
        return entry.aiScore;
      case 'challenges':
        return entry.challengesCompleted;
      case 'streak':
        return entry.streak;
      default:
        return entry.aiScore;
    }
  };

  if (isLoading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-lime-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-lime-600 bg-clip-text text-transparent mb-2">Global Leaderboard</h1>
          <p className="text-xl text-gray-600 mb-4">
            Top athletes ranked by {getCategoryLabel(category)}
          </p>
          
          {/* Category Filter */}
          <div className="flex justify-center gap-2 mb-4">
            {(['points', 'challenges', 'streak'] as LeaderboardCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  category === cat
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* User Rank Display */}
          {userRank && (
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md">
              <p className="text-sm">Your Rank: <span className="font-bold">#{userRank.rank}</span> out of {userRank.total}</p>
            </div>
          )}
        </motion.div>

        {/* Top 3 Podium */}
        {topThree.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center items-end gap-4 mb-12 flex-wrap"
          >
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={topThree[1].avatar}
                  alt={topThree[1].username}
                  className={`w-24 h-24 rounded-full border-4 border-gray-400 ${
                    topThree[1].isCurrentUser ? 'ring-4 ring-purple-400' : ''
                  }`}
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                  <Medal className="w-6 h-6 text-white" />
                </div>
                {topThree[1].isCurrentUser && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                    You
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 w-48 text-center">
                <p className="text-2xl mb-1">2nd</p>
                <p className="text-gray-900 mb-2 font-semibold">{topThree[1].username}</p>
                <p className="text-sky-500 mb-1 font-bold">{getCategoryValue(topThree[1]).toLocaleString()}</p>
                <p className="text-xs text-gray-600">
                  {category === 'points' && `${topThree[1].challengesCompleted} challenges`}
                  {category === 'challenges' && `${topThree[1].aiScore.toLocaleString()} pts`}
                  {category === 'streak' && `${topThree[1].challengesCompleted} challenges`}
                </p>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center -mt-8">
              <div className="relative mb-4">
                <img
                  src={topThree[0].avatar}
                  alt={topThree[0].username}
                  className={`w-32 h-32 rounded-full border-4 border-yellow-400 shadow-lg ${
                    topThree[0].isCurrentUser ? 'ring-4 ring-purple-400' : ''
                  }`}
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                {topThree[0].isCurrentUser && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                    You
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-lg p-6 w-52 text-center text-white">
                <p className="text-3xl mb-1">1st</p>
                <p className="mb-2 font-semibold">{topThree[0].username}</p>
                <p className="text-2xl mb-1 font-bold">{getCategoryValue(topThree[0]).toLocaleString()}</p>
                <p className="text-xs opacity-90">
                  {category === 'points' && `${topThree[0].challengesCompleted} challenges`}
                  {category === 'challenges' && `${topThree[0].aiScore.toLocaleString()} pts`}
                  {category === 'streak' && `${topThree[0].challengesCompleted} challenges`}
                </p>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={topThree[2].avatar}
                  alt={topThree[2].username}
                  className={`w-24 h-24 rounded-full border-4 border-orange-400 ${
                    topThree[2].isCurrentUser ? 'ring-4 ring-purple-400' : ''
                  }`}
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                {topThree[2].isCurrentUser && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                    You
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 w-48 text-center">
                <p className="text-2xl mb-1">3rd</p>
                <p className="text-gray-900 mb-2 font-semibold">{topThree[2].username}</p>
                <p className="text-sky-500 mb-1 font-bold">{getCategoryValue(topThree[2]).toLocaleString()}</p>
                <p className="text-xs text-gray-600">
                  {category === 'points' && `${topThree[2].challengesCompleted} challenges`}
                  {category === 'challenges' && `${topThree[2].aiScore.toLocaleString()} pts`}
                  {category === 'streak' && `${topThree[2].challengesCompleted} challenges`}
                </p>
              </div>
            </div>
          )}
          </motion.div>
        ) : (
          <div className="text-center py-12 mb-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No leaderboard data available yet.</p>
            <p className="text-gray-400 text-sm mt-2">Complete some challenges to appear on the leaderboard!</p>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Athlete</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{getCategoryLabel(category)}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">AI Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Challenges</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Streak</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Loading leaderboard...</p>
                    </td>
                  </tr>
                ) : others.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <p>No data available yet.</p>
                      <p className="text-sm mt-1">Complete some challenges to appear on the leaderboard!</p>
                    </td>
                  </tr>
                ) : (
                  others.map((entry, index) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`border-b transition-colors ${
                        entry.isCurrentUser
                          ? 'bg-purple-50 hover:bg-purple-100 border-purple-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${entry.isCurrentUser ? 'text-purple-700' : 'text-gray-900'}`}>
                          {entry.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.avatar}
                            alt={entry.username}
                            className={`w-10 h-10 rounded-full ${
                              entry.isCurrentUser ? 'ring-2 ring-purple-500' : ''
                            }`}
                          />
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${entry.isCurrentUser ? 'text-purple-700' : 'text-gray-900'}`}>
                              {entry.username}
                            </span>
                            {entry.isCurrentUser && (
                              <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-lime-500" />
                          <span className={`font-bold ${entry.isCurrentUser ? 'text-purple-700' : 'text-sky-500'}`}>
                            {getCategoryValue(entry).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={entry.isCurrentUser ? 'text-purple-700' : 'text-gray-700'}>
                          {entry.aiScore.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={entry.isCurrentUser ? 'text-purple-700' : 'text-gray-700'}>
                          {entry.challengesCompleted}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          entry.isCurrentUser
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {entry.streak} days 🔥
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-sky-50 to-lime-50 rounded-xl p-6"
        >
          <h3 className="text-xl text-gray-900 mb-2">How AI Score Works</h3>
          <p className="text-gray-700">
            Your AI Score is calculated based on workout quality, consistency, challenge completion, 
            and form accuracy detected by our AI coach. Keep training to climb the leaderboard!
          </p>
        </motion.div>
      </div>
    </div>
  );
};
