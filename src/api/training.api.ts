import client from "./client";
import { TrainingPlanDto, Exercise, DayPlan } from '../../dto/training/training.dto';

export const TrainingAPI = {
  /**
   * Get all available training plans
   * @param params - Query parameters for filtering
   * @returns Promise with paginated training plans
   */
  getTrainingPlans(params?: {
    difficulty?: string;
    status?: string;
    goalId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    content: TrainingPlanDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    return client.get("/training-plans", { params });
  },

  /**
   * Get training plan by ID
   * @param id - Training plan ID
   * @returns Promise with training plan details
   */
  getTrainingPlanById(id: string): Promise<TrainingPlanDto> {
    return client.get(`/training-plans/${id}`);
  },

  /**
   * Start a training plan (with personalization)
   * @param planId - Training plan ID
   * @param startDate - Start date (optional, format: YYYY-MM-DD, userId from JWT)
   * @returns Promise with start confirmation including utId
   */
  startTrainingPlan(planId: number, startDate?: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      utId: number;
      trainingPlanId: number;
      email: string ;
      userId: number;
      startDate: string;
      endDate: string;
      personalized: boolean;
    };
  }> {
    return client.post(`/training-plans/${planId}/start`, { 
      startDate: startDate || new Date().toISOString().split('T')[0]
    });
  },

  // Note: The following endpoints may not be implemented in BE yet
  // They are kept for future use or should be removed if not needed
  
  /**
   * Get user's active training plans
   * @param userId - User ID
   * @returns Promise with user's training plans
   */
  getMyTrainingPlans(userId: string): Promise<{
    activePlans: (TrainingPlanDto & { subscriptionId: string; progress: number; nextWorkout: DayPlan })[];
    completedPlans: (TrainingPlanDto & { completedAt: string; rating?: number })[];
  }> {
    // TODO: Check if this endpoint exists in BE
    return client.get(`/users/${userId}/training-plans`);
  }
};