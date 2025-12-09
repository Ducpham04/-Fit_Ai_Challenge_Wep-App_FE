import client from "./client";

export const GoalsAPI = {
  /**
   * Get user's goals
   * @param userId - User ID
   * @param params - Query parameters
   * @returns Promise with user's goals
   */
  getGoals(
    userId: string,
    params?: {
      status?: 'active' | 'completed' | 'abandoned' | 'paused';
      type?: 'weight' | 'steps' | 'calories' | 'workout' | 'water' | 'sleep' | 'custom';
      page?: number;
      limit?: number;
    }
  ): Promise<{
    goals: Array<{
      id: string;
      userId: string;
      type: 'weight' | 'steps' | 'calories' | 'workout' | 'water' | 'sleep' | 'custom';
      title: string;
      description: string;
      targetValue: number;
      currentValue: number;
      unit: string;
      status: 'active' | 'completed' | 'abandoned' | 'paused';
      startDate: string;
      endDate: string;
      progress: number;
      createdAt: string;
      updatedAt: string;
      streak?: number;
      bestStreak?: number;
    }>;
    total: number;
    page: number;
    totalPages: number;
    summary: {
      active: number;
      completed: number;
      successRate: number;
      totalPoints: number;
    };
  }> {
    return client.get(`/admin/goals`, { params });
  },

  /**
   * Create a new goal
   * @param goalData - Goal data
   * @returns Promise with created goal
   */
  createGoal(goalData: {
    type: 'weight' | 'steps' | 'calories' | 'workout' | 'water' | 'sleep' | 'custom';
    title: string;
    description?: string;
    targetValue: number;
    unit: string;
    startDate: string;
    endDate: string;
    reminderEnabled?: boolean;
    reminderTime?: string;
  }): Promise<{
    id: string;
    userId: string;
    type: string;
    title: string;
    description?: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    status: 'active';
    startDate: string;
    endDate: string;
    progress: number;
    createdAt: string;
    reminderEnabled?: boolean;
    reminderTime?: string;
  }> {
    // Note: BE uses multipart/form-data for creating goals
    // This may need to be adjusted based on actual implementation
    return client.post('/admin/goals', goalData);
  },

  /**
   * Get goal by ID
   * @param goalId - Goal ID
   * @returns Promise with goal details
   */
  getGoal(goalId: string): Promise<{
    id: string;
    userId: string;
    type: 'weight' | 'steps' | 'calories' | 'workout' | 'water' | 'sleep' | 'custom';
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    status: 'active' | 'completed' | 'abandoned' | 'paused';
    startDate: string;
    endDate: string;
    progress: number;
    createdAt: string;
    updatedAt: string;
    streak: number;
    bestStreak: number;
    progressHistory: Array<{
      date: string;
      value: number;
      progress: number;
    }>;
    achievements: Array<{
      id: string;
      name: string;
      description: string;
      unlockedAt: string;
      points: number;
    }>;
  }> {
    return client.get(`/admin/goals/${goalId}`);
  },

  /**
   * Update goal
   * @param goalId - Goal ID
   * @param updates - Goal updates
   * @returns Promise with updated goal
   */
  updateGoal(
    goalId: string,
    updates: {
      title?: string;
      description?: string;
      targetValue?: number;
      unit?: string;
      endDate?: string;
      status?: 'active' | 'completed' | 'abandoned' | 'paused';
      reminderEnabled?: boolean;
      reminderTime?: string;
    }
  ): Promise<{
    id: string;
    userId: string;
    type: string;
    title: string;
    description?: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    status: string;
    startDate: string;
    endDate: string;
    progress: number;
    updatedAt: string;
  }> {
    // Note: BE uses multipart/form-data for updating goals
    return client.put(`/admin/goals/${goalId}`, updates);
  },

  /**
   * Update goal progress
   * @param goalId - Goal ID
   * @param progressData - Progress data
   * @returns Promise with updated progress
   */
  updateProgress(
    goalId: string,
    progressData: {
      value: number;
      date?: string;
      note?: string;
    }
  ): Promise<{
    goalId: string;
    currentValue: number;
    progress: number;
    streak: number;
    bestStreak: number;
    updatedAt: string;
    achievements?: Array<{
      id: string;
      name: string;
      description: string;
      points: number;
    }>;
  }> {
    // TODO: Check if this endpoint exists in BE
    return client.post(`/admin/goals/${goalId}/progress`, progressData);
  },

  /**
   * Delete goal
   * @param goalId - Goal ID
   * @returns Promise with deletion confirmation
   */
  deleteGoal(goalId: string): Promise<{
    message: string;
  }> {
    return client.delete(`/admin/goals/${goalId}`);
  },

  /**
   * Get goal templates
   * @param type - Optional goal type filter
   * @returns Promise with goal templates
   */
  getGoalTemplates(type?: string): Promise<{
    templates: Array<{
      id: string;
      type: 'weight' | 'steps' | 'calories' | 'workout' | 'water' | 'sleep' | 'custom';
      title: string;
      description: string;
      defaultTarget: number;
      unit: string;
      duration: number; // in days
      difficulty: 'easy' | 'medium' | 'hard';
      category: string;
    }>;
  }> {
    // TODO: Check if this endpoint exists in BE
    return client.get('/admin/goals/templates', { params: { type } });
  },

  /**
   * Get goal statistics
   * @param userId - User ID
   * @param period - Time period
   * @returns Promise with goal statistics
   */
  getGoalStatistics(
    userId: string,
    period: 'week' | 'month' | 'year' | 'all'
  ): Promise<{
    period: string;
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    successRate: number;
    averageCompletionTime: number; // in days
    byType: Record<string, {
      total: number;
      completed: number;
      successRate: number;
      averageTarget: number;
    }>;
    streaks: {
      current: number;
      longest: number;
      average: number;
    };
    monthlyProgress: Array<{
      month: string;
      completed: number;
      created: number;
      successRate: number;
    }>;
  }> {
    // TODO: Check if this endpoint exists in BE
    return client.get(`/admin/goals/user/${userId}/statistics`, {
      params: { period }
    });
  },

  /**
   * Get goal reminders
   * @param userId - User ID
   * @returns Promise with goal reminders
   */
  getReminders(userId: string): Promise<{
    reminders: Array<{
      id: string;
      goalId: string;
      goalTitle: string;
      type: 'progress_update' | 'deadline_approaching' | 'streak_ending';
      message: string;
      scheduledFor: string;
      isRead: boolean;
      createdAt: string;
    }>;
    unreadCount: number;
  }> {
    // TODO: Check if this endpoint exists in BE
    return client.get(`/admin/goals/user/${userId}/reminders`);
  },

  /**
   * Mark reminder as read
   * @param reminderId - Reminder ID
   * @returns Promise with update confirmation
   */
  markReminderRead(reminderId: string): Promise<{
    message: string;
  }> {
    // TODO: Check if this endpoint exists in BE
    return client.put(`/admin/goals/reminders/${reminderId}/read`);
  }
};
