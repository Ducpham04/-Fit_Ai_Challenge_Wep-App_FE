import client from "./client";

export const RewardsAPI = {
  /**
   * Get all available rewards
   * @param params - Query parameters
   * @returns Promise with paginated rewards
   */
  getRewards(params?: {
    status?: 'active' | 'inactive';
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: Array<{
      rewardId: number;
      name: string;
      description: string;
      costPoints: number;
      claimed: number;
      linkImage: string;
      stock: number;
      status?: string;
      expireAt?: string;
      createdAt?: string;
    }>;
  }> {
    return client.get('/admin/rewards', { params });
  },

  /**
   * Get reward by ID
   * @param rewardId - Reward ID
   * @returns Promise with reward details
   */
  getReward(rewardId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      rewardId: number;
      name: string;
      description: string;
      costPoints: number;
      claimed: number;
      linkImage: string;
      stock: number;
      status?: string;
      expireAt?: string;
      createdAt?: string;
    };
  }> {
    return client.get(`/admin/rewards/${rewardId}`);
  },

  /**
   * Claim a reward (redeem)
   * @param rewardId - Reward ID
   * @param userId - User ID
   * @returns Promise with claim confirmation
   */
  claimReward(rewardId: string, userId: number): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return client.post(`/reward-redemptions`, { 
      rewardId: Number(rewardId),
      userId 
    });
  },

  /**
   * Get user's reward redemption history
   * @param params - Query parameters
   * @returns Promise with user's reward redemption history
   */
  getUserRewards(params?: {
    userId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: Array<{
      redemptionId: number;
      rewardId: number;
      userId: number;
      status: string;
      requestedAt?: string;
      completedAt?: string;
    }>;
  }> {
    return client.get(`/reward-redemptions`, { params });
  },

  /**
   * Get user's points balance
   * Note: This endpoint may need to be implemented in BE
   * Currently using user profile endpoint to get points
   * @param userId - User ID
   * @returns Promise with points information
   */
  getUserPoints(userId: string): Promise<{
    userId: string;
    currentPoints: number;
    totalEarned: number;
    totalSpent: number;
    level: number;
    nextLevelPoints: number;
    pointsToNextLevel: number;
    lastUpdated: string;
  }> {
    // TODO: Check if this endpoint exists in BE, otherwise use user profile
    return client.get(`/users/${userId}/points`);
  }
};
