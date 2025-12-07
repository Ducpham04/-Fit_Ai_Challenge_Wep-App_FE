import client from "./client";

/**
 * NOTE: Dashboard endpoints may not be fully implemented in BE yet.
 * Consider using User Profile endpoints instead:
 * - GET /api/v1/users/{userId}/profile/full - Returns FullUserProfileDTO with stats, activities, goals
 */
export const DashboardAPI = {
  /**
   * Get user dashboard overview
   * @param userId - User ID
   * @returns Promise with dashboard data
   */
  getDashboard(userId: string): Promise<{
    user: {
      id: string;
      fullName: string;
      email: string;
      profileImage?: string;
      level: number;
      points: number;
      streak: number;
    };
    stats: {
      totalWorkouts: number;
      totalDuration: number; // in minutes
      totalCalories: number;
      challengesCompleted: number;
      currentStreak: number;
      longestStreak: number;
    };
    recentActivities: Array<{
      id: string;
      type: 'workout' | 'challenge' | 'achievement';
      title: string;
      description: string;
      timestamp: string;
      points?: number;
    }>;
    activeGoals: Array<{
      id: string;
      title: string;
      type: 'weight' | 'steps' | 'calories' | 'workout';
      targetValue: number;
      currentValue: number;
      progress: number;
      deadline: string;
    }>;
    upcomingWorkouts: Array<{
      id: string;
      title: string;
      scheduledDate: string;
      duration: number;
      trainingPlanTitle: string;
    }>;
  }> {
    // TODO: This endpoint may not exist in BE. Consider using /api/v1/users/{userId}/profile/full instead
    return client.get(`/dashboard/${userId}`);
  },

  /**
   * Get user statistics for a specific period
   * @param userId - User ID
   * @param period - Time period (week, month, year)
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @returns Promise with detailed statistics
   */
  getStatistics(
    userId: string,
    period: 'week' | 'month' | 'year' | 'custom',
    startDate?: string,
    endDate?: string
  ): Promise<{
    period: string;
    workouts: {
      total: number;
      completed: number;
      averageDuration: number;
      totalCalories: number;
      byDay: Array<{
        date: string;
        count: number;
        duration: number;
        calories: number;
      }>;
    };
    challenges: {
      participated: number;
      completed: number;
      successRate: number;
      totalPoints: number;
    };
    goals: {
      active: number;
      completed: number;
      successRate: number;
      byType: Record<string, {
        active: number;
        completed: number;
        averageProgress: number;
      }>;
    };
    nutrition: {
      averageDailyCalories: number;
      mealsLogged: number;
      proteinAverage: number;
      carbsAverage: number;
      fatAverage: number;
    };
    achievements: Array<{
      id: string;
      name: string;
      description: string;
      unlockedAt: string;
      points: number;
    }>;
  }> {
    return client.get(`/dashboard/${userId}/statistics`, {
      params: { period, startDate, endDate }
    });
  },

  /**
   * Get user's activity feed
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with activity feed
   */
  getActivityFeed(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    activities: Array<{
      id: string;
      type: 'workout_completed' | 'challenge_joined' | 'goal_achieved' | 'badge_earned' | 'friend_added';
      title: string;
      description: string;
      timestamp: string;
      relatedId?: string;
      points?: number;
      metadata?: Record<string, any>;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    return client.get(`/dashboard/${userId}/activities`, {
      params: { page, limit }
    });
  },

  /**
   * Get quick stats for dashboard cards
   * @param userId - User ID
   * @returns Promise with quick stats
   */
  getQuickStats(userId: string): Promise<{
    todayWorkouts: number;
    weekWorkouts: number;
    monthWorkouts: number;
    currentStreak: number;
    totalPoints: number;
    activeGoals: number;
    activeChallenges: number;
    nextWorkout?: {
      title: string;
      scheduledDate: string;
      trainingPlanTitle: string;
    };
  }> {
    return client.get(`/dashboard/${userId}/quick-stats`);
  }
};
