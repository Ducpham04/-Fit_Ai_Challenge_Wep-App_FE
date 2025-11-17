import { motion } from 'motion/react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { mockLeaderboard } from '../api/mockData';

export const Leaderboard = () => {
  const topThree = mockLeaderboard.slice(0, 3);
  const others = mockLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl text-gray-900 mb-2">Global Leaderboard</h1>
          <p className="text-xl text-gray-600">
            Top athletes ranked by AI Score
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center items-end gap-4 mb-12 flex-wrap"
        >
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={topThree[1]?.avatar}
                alt={topThree[1]?.username}
                className="w-24 h-24 rounded-full border-4 border-gray-400"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                <Medal className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 w-48 text-center">
              <p className="text-2xl mb-1">2nd</p>
              <p className="text-gray-900 mb-2">{topThree[1]?.username}</p>
              <p className="text-sky-500 mb-1">{topThree[1]?.aiScore.toLocaleString()} pts</p>
              <p className="text-xs text-gray-600">{topThree[1]?.challengesCompleted} challenges</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-8">
            <div className="relative mb-4">
              <img
                src={topThree[0]?.avatar}
                alt={topThree[0]?.username}
                className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-lg p-6 w-52 text-center text-white">
              <p className="text-3xl mb-1">1st</p>
              <p className="mb-2">{topThree[0]?.username}</p>
              <p className="text-2xl mb-1">{topThree[0]?.aiScore.toLocaleString()} pts</p>
              <p className="text-xs opacity-90">{topThree[0]?.challengesCompleted} challenges</p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={topThree[2]?.avatar}
                alt={topThree[2]?.username}
                className="w-24 h-24 rounded-full border-4 border-orange-400"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 w-48 text-center">
              <p className="text-2xl mb-1">3rd</p>
              <p className="text-gray-900 mb-2">{topThree[2]?.username}</p>
              <p className="text-sky-500 mb-1">{topThree[2]?.aiScore.toLocaleString()} pts</p>
              <p className="text-xs text-gray-600">{topThree[2]?.challengesCompleted} challenges</p>
            </div>
          </div>
        </motion.div>

        {/* Rest of Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Rank</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Athlete</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">AI Score</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Challenges</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Streak</th>
                </tr>
              </thead>
              <tbody>
                {others.map((user, index) => (
                  <motion.tr
                    key={user.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{user.rank}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-lime-500" />
                        <span className="text-sky-500">{user.aiScore.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{user.challengesCompleted}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        {user.streak} days 🔥
                      </span>
                    </td>
                  </motion.tr>
                ))}
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
