import client from "./client";

/**
 * NOTE: Leaderboard endpoints may not be fully implemented in BE yet.
 * These endpoints are kept for future implementation.
 */
export const LeaderboardAPI = {
  /**
   * Get global leaderboard
   * @param params - Query parameters
   * @returns Promise with global leaderboard
   */
  getGlobalLeaderboard(params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
    category?: 'points' | 'workouts' | 'challenges' | 'calories' | 'streak';
    page?: number;
    limit?: number;
  }): Promise<{
    leaderboard: Array<{
      rank: number;
      userId: string;
      userName: string;
      profileImage?: string;
      value: number;
      change: number; // rank change from previous period
      badge?: string;
      level: number;
      isCurrentUser?: boolean;
    }>;
    total: number;
    page: number;
    totalPages: number;
    period: string;
    category: string;
    lastUpdated: string;
  }> {
    return client.get('/leaderboard/global', { params });
  },

  /**
   * Get friends leaderboard
   * @param userId - User ID
   * @param params - Query parameters
   * @returns Promise with friends leaderboard
   */
  getFriendsLeaderboard(
    userId: string,
    params?: {
      period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
      category?: 'points' | 'workouts' | 'challenges' | 'calories' | 'streak';
      page?: number;
      limit?: number;
    }
  ): Promise<{
    leaderboard: Array<{
      rank: number;
      userId: string;
      userName: string;
      profileImage?: string;
      value: number;
      change: number;
      badge?: string;
      level: number;
      isCurrentUser?: boolean;
      friendshipStatus: 'friend' | 'pending' | 'none';
    }>;
    total: number;
    page: number;
    totalPages: number;
    period: string;
    category: string;
    lastUpdated: string;
  }> {
    return client.get(`/leaderboard/friends/${userId}`, { params });
  },

  /**
   * Get challenge-specific leaderboard
   * @param challengeId - Challenge ID
   * @param params - Query parameters
   * @returns Promise with challenge leaderboard
   */
  getChallengeLeaderboard(
    challengeId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    challenge: {
      id: string;
      title: string;
      status: 'Active' | 'Upcoming' | 'Completed';
      totalParticipants: number;
    };
    leaderboard: Array<{
      rank: number;
      userId: string;
      userName: string;
      profileImage?: string;
      progress: number; // percentage or points
      completed: boolean;
      completedAt?: string;
      timeSpent?: number; // in minutes
      isCurrentUser?: boolean;
    }>;
    total: number;
    page: number;
    totalPages: number;
    lastUpdated: string;
  }> {
    return client.get(`/leaderboard/challenge/${challengeId}`, { params });
  },

  /**
   * Get training plan leaderboard
   * @param trainingPlanId - Training plan ID
   * @param params - Query parameters
   * @returns Promise with training plan leaderboard
   */
  getTrainingPlanLeaderboard(
    trainingPlanId: string,
    params?: {
      period?: 'current' | 'all-time';
      page?: number;
      limit?: number;
    }
  ): Promise<{
    trainingPlan: {
      id: string;
      title: string;
      totalSubscribers: number;
    };
    leaderboard: Array<{
      rank: number;
      userId: string;
      userName: string;
      profileImage?: string;
      progress: number; // completion percentage
      completed: boolean;
      completedAt?: string;
      totalWorkouts: number;
      currentStreak: number;
      isCurrentUser?: boolean;
    }>;
    total: number;
    page: number;
    totalPages: number;
    lastUpdated: string;
  }> {
    return client.get(`/leaderboard/training-plan/${trainingPlanId}`, { params });
  },

  /**
   * Get user's rank in different categories
   * @param userId - User ID
   * @returns Promise with user's ranks
   */
  getUserRanks(userId: string): Promise<{
    globalRanks: {
      points: { rank: number; value: number; total: number };
      workouts: { rank: number; value: number; total: number };
      challenges: { rank: number; value: number; total: number };
      calories: { rank: number; value: number; total: number };
      streak: { rank: number; value: number; total: number };
    };
    friendsRanks: {
      points: { rank: number; value: number; total: number };
      workouts: { rank: number; value: number; total: number };
      challenges: { rank: number; value: number; total: number };
      calories: { rank: number; value: number; total: number };
      streak: { rank: number; value: number; total: number };
    };
    lastUpdated: string;
  }> {
    return client.get(`/leaderboard/user/${userId}/ranks`);
  },

  /**
   * Get leaderboard statistics
   * @returns Promise with leaderboard stats
   */
  getLeaderboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalPoints: number;
    totalWorkouts: number;
    totalChallenges: number;
    topCategories: Array<{
      category: string;
      leader: {
        userName: string;
        value: number;
      };
      totalParticipants: number;
    }>;
    lastUpdated: string;
  }> {
    return client.get('/leaderboard/stats');
  }
};
