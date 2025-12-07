import client from "./client";

export const NutritionAPI = {
  /**
   * Get all nutrition plans
   * @param params - Query parameters
   * @returns Promise with paginated nutrition plans
   */
  getNutritionPlans(params?: {
    status?: 'published' | 'draft' | 'archived';
    target?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: Array<{
      id: number;
      name: string;
      description: string;
      target: string;
      dailyCalories: number;
      subscribers: number;
      price: number;
      status?: string;
      createdAt?: string;
      updatedAt?: string;
    }>;
  }> {
    return client.get('/nutrition-plans', { params });
  },

  /**
   * Get nutrition plan by ID
   * @param planId - Nutrition plan ID
   * @returns Promise with nutrition plan details
   */
  getNutritionPlan(planId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      id: number;
      name: string;
      description: string;
      target: string;
      dailyCalories: number;
      subscribers: number;
      price: number;
      status?: string;
      createdAt?: string;
      updatedAt?: string;
      meals?: Array<{
        mealId: number;
        name: string;
        description: string;
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        caloriesEstimate: number;
        foods?: Array<{
          mfId: number;
          foodId: number;
          foodName: string;
          quantityG: number;
          totalCalories: number;
          totalProtein: number;
          totalCarbs: number;
          totalFat: number;
        }>;
      }>;
    };
  }> {
    return client.get(`/nutrition-plans/${planId}`);
  },

  /**
   * Create user nutrition subscription
   * @param request - User nutrition request
   * @returns Promise with subscription details
   */
  createUserNutrition(request: {
    userId: number;
    nutritionPlanId: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return client.post(`/user-nutrition`, request);
  },

  /**
   * Get user nutrition by ID
   * @param id - User nutrition ID
   * @returns Promise with user nutrition details
   */
  getUserNutrition(id: string | number): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return client.get(`/user-nutrition/${id}`);
  },

  /**
   * Get all user nutrition subscriptions
   * @returns Promise with all user nutrition subscriptions
   */
  getAllUserNutrition(): Promise<{
    success: boolean;
    message: string;
    data?: any[];
  }> {
    return client.get(`/user-nutrition`);
  },

  /**
   * Update user nutrition subscription
   * @param id - User nutrition ID
   * @param request - Updated user nutrition data
   * @returns Promise with updated subscription
   */
  updateUserNutrition(
    id: string | number,
    request: {
      userId?: number;
      nutritionPlanId?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return client.put(`/user-nutrition/${id}`, request);
  },

  /**
   * Delete user nutrition subscription
   * @param id - User nutrition ID
   * @returns Promise with deletion confirmation
   */
  deleteUserNutrition(id: string | number): Promise<{
    success: boolean;
    message: string;
  }> {
    return client.delete(`/user-nutrition/${id}`);
  },

  /**
   * Get nutrition plans by goal ID
   * @param goalId - Goal ID
   * @returns Promise with nutrition plans for the goal
   */
  getPlansByGoal(goalId: string | number): Promise<{
    success: boolean;
    message: string;
    data?: any[];
  }> {
    return client.get(`/nutrition-plans/goal/${goalId}`);
  }
};
