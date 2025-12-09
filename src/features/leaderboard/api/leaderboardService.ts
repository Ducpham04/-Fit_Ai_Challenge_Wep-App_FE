import client from '@/api/client';
import { getDailyTrainingLogs } from '@/features/myChallenge/api/myChallengeService';
import { DailyTrainingLogDTO } from '@/features/myChallenge/types/myChallenge.type';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  aiScore: number;
  challengesCompleted: number;
  streak: number;
  isCurrentUser?: boolean;
}

export type LeaderboardCategory = 'points' | 'challenges' | 'streak';
export type LeaderboardPeriod = 'all-time' | 'weekly' | 'monthly';

/**
 * Get user stats for leaderboard calculation
 */
interface UserStats {
  userId: string;
  username: string;
  avatar: string;
  aiScore: number;
  challengesCompleted: number;
  streak: number;
}

/**
 * Calculate leaderboard from user data
 * 
 * CÁCH LẤY DỮ LIỆU LEADERBOARD:
 * 
 * Option 1 (Tốt nhất - cần tạo endpoint backend):
 *   GET /api/leaderboard?category=points&period=all-time&limit=50
 *   → Backend trả về leaderboard đã tính sẵn
 * 
 * Option 2 (Hiện tại - có vấn đề):
 *   - Gọi /api/admin/users (chỉ admin có quyền)
 *   - Với mỗi user, gọi /api/v1/users/{userId}/profile/full
 *   → Nhiều API calls, chậm, user thường không có quyền
 * 
 * Option 3 (Fallback - tính từ DailyTrainingLog):
 *   - Lấy tất cả DailyTrainingLog
 *   - Aggregate theo user để tính stats
 *   → Phức tạp, cần nhiều dữ liệu
 */
const calculateLeaderboard = async (
  category: LeaderboardCategory = 'points',
  period: LeaderboardPeriod = 'all-time',
  currentUserId?: string
): Promise<LeaderboardEntry[]> => {
  try {
    // Option 1: Thử gọi endpoint leaderboard chuyên dụng (nếu backend đã tạo)
    try {
      const leaderboardResponse = await client.get('/leaderboard', {
        params: {
          category,
          period,
          limit: 100,
        }
      });
      
      if (leaderboardResponse.data && Array.isArray(leaderboardResponse.data)) {
        // Backend trả về leaderboard trực tiếp
        return leaderboardResponse.data.map((entry: any, index: number) => ({
          rank: entry.rank || index + 1,
          userId: entry.userId?.toString() || entry.user?.id?.toString(),
          username: entry.userName || entry.user?.fullName || entry.user?.username || 'User',
          avatar: entry.profileImage || entry.user?.linkImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId || entry.user?.id}`,
          aiScore: entry.value || entry.aiScore || entry.points || 0,
          challengesCompleted: entry.challengesCompleted || 0,
          streak: entry.streak || entry.currentStreak || 0,
          isCurrentUser: currentUserId ? (entry.userId?.toString() === currentUserId.toString() || entry.user?.id?.toString() === currentUserId.toString()) : false,
        }));
      }
    } catch (error) {
      console.log('Leaderboard endpoint not available, trying alternative method...');
    }

    // Option 2: Fallback - Lấy từ admin/users và profile/full (chỉ hoạt động với admin)
    let users: UserStats[] = [];

    try {
      const usersResponse = await client.get('/admin/users', {
        params: { page: 1, limit: 1000, status: 'active' }
      });
      
      if (usersResponse.data?.data && Array.isArray(usersResponse.data.data)) {
        // Process each user to get their stats
        const userPromises = usersResponse.data.data.map(async (user: any) => {
          try {
            // Get user profile with stats
            const profileResponse = await client.get(`/api/v1/users/${user.id}/profile/full`);
            const profile = profileResponse.data?.data || profileResponse.data;
            
            const stats = profile?.stats || {};
            const aiScore = stats.aiScore || stats.totalPoints || stats.points || 0;
            const challengesCompleted = stats.challengesCompleted || 0;
            const streak = stats.currentStreak || 0;

            return {
              userId: user.id?.toString() || user.userId?.toString(),
              username: user.fullName || user.username || user.email || 'User',
              avatar: user.linkImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || user.email}`,
              aiScore,
              challengesCompleted,
              streak,
            };
          } catch (error) {
            console.warn(`Could not load stats for user ${user.id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(userPromises);
        users = results.filter((u): u is UserStats => u !== null);
      }
    } catch (error) {
      console.warn('Could not load users from admin endpoint:', error);
      // Return empty array if no data available
      return [];
    }

    // Filter by period if needed
    if (period === 'weekly' || period === 'monthly') {
      // For weekly/monthly, we'd need to filter DailyTrainingLog by date
      // This is a simplified version - you may need to enhance this
      // For now, we'll use all-time data
    }

    // Sort by category
    let sortedUsers = [...users];
    switch (category) {
      case 'points':
        sortedUsers.sort((a, b) => b.aiScore - a.aiScore);
        break;
      case 'challenges':
        sortedUsers.sort((a, b) => b.challengesCompleted - a.challengesCompleted);
        break;
      case 'streak':
        sortedUsers.sort((a, b) => b.streak - a.streak);
        break;
    }

    // Assign ranks and format
    const leaderboard: LeaderboardEntry[] = sortedUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      username: user.username,
      avatar: user.avatar,
      aiScore: user.aiScore,
      challengesCompleted: user.challengesCompleted,
      streak: user.streak,
      isCurrentUser: currentUserId ? user.userId === currentUserId.toString() : false,
    }));

    return leaderboard;
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    return [];
  }
};

/**
 * Get global leaderboard
 */
export const getGlobalLeaderboard = async (
  category: LeaderboardCategory = 'points',
  period: LeaderboardPeriod = 'all-time',
  currentUserId?: string,
  limit: number = 50
): Promise<LeaderboardEntry[]> => {
  const leaderboard = await calculateLeaderboard(category, period, currentUserId);
  return leaderboard.slice(0, limit);
};

/**
 * Get user's rank in leaderboard
 */
export const getUserRank = async (
  userId: string,
  category: LeaderboardCategory = 'points',
  period: LeaderboardPeriod = 'all-time'
): Promise<{ rank: number; total: number } | null> => {
  try {
    const leaderboard = await calculateLeaderboard(category, period, userId);
    const userEntry = leaderboard.find(entry => entry.userId === userId.toString());
    
    if (userEntry) {
      return {
        rank: userEntry.rank,
        total: leaderboard.length,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

