import client from "./client";

/**
 * NOTE: Workout endpoints may not be fully implemented in BE yet.
 * Consider using User Training endpoints instead:
 * - GET /api/user/training - User training details
 * - POST /api/user/training - Create user training
 */
export const WorkoutAPI = {
  /**
   * Start a new workout session
   * @param sessionData - Workout session data
   * @returns Promise with session details
   */
  startWorkout(sessionData: {
    trainingPlanId?: string;
    workoutType: string;
    estimatedDuration?: number;
    exercises: Array<{
      exerciseId: string;
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
      restTime: number;
    }>;
  }): Promise<{
    sessionId: string;
    userId: string;
    trainingPlanId?: string;
    workoutType: string;
    startTime: string;
    estimatedDuration?: number;
    exercises: Array<{
      exerciseId: string;
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
      restTime: number;
      completedSets: number;
    }>;
    status: 'active';
  }> {
    return client.post('/workouts/start', sessionData);
  },

  /**
   * Get active workout session
   * @param userId - User ID
   * @returns Promise with active session
   */
  getActiveWorkout(userId: string): Promise<{
    sessionId: string;
    userId: string;
    trainingPlanId?: string;
    workoutType: string;
    startTime: string;
    estimatedDuration?: number;
    currentExercise?: {
      exerciseId: string;
      name: string;
      setNumber: number;
      totalSets: number;
      reps: number;
      weight?: number;
      duration?: number;
      restTime: number;
      startTime: string;
    };
    exercises: Array<{
      exerciseId: string;
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
      restTime: number;
      completedSets: number;
      completedReps: number[];
      actualWeight?: number[];
      actualDuration?: number[];
    }>;
    status: 'active';
    elapsedTime: number;
  }> {
    return client.get(`/workouts/active/${userId}`);
  },

  /**
   * Log exercise completion
   * @param sessionId - Workout session ID
   * @param exerciseData - Exercise completion data
   * @returns Promise with completion confirmation
   */
  logExercise(sessionId: string, exerciseData: {
    exerciseId: string;
    setNumber: number;
    actualReps?: number;
    actualWeight?: number;
    actualDuration?: number;
    notes?: string;
  }): Promise<{
    sessionId: string;
    exerciseId: string;
    setNumber: number;
    completedAt: string;
    points: number;
    nextExercise?: {
      exerciseId: string;
      name: string;
      setNumber: number;
      totalSets: number;
      reps: number;
      weight?: number;
      duration?: number;
      restTime: number;
    };
  }> {
    return client.post(`/workouts/${sessionId}/exercise`, exerciseData);
  },

  /**
   * Pause workout session
   * @param sessionId - Workout session ID
   * @returns Promise with pause confirmation
   */
  pauseWorkout(sessionId: string): Promise<{
    sessionId: string;
    status: 'paused';
    pausedAt: string;
    elapsedTime: number;
  }> {
    return client.put(`/workouts/${sessionId}/pause`);
  },

  /**
   * Resume workout session
   * @param sessionId - Workout session ID
   * @returns Promise with resume confirmation
   */
  resumeWorkout(sessionId: string): Promise<{
    sessionId: string;
    status: 'active';
    resumedAt: string;
    elapsedTime: number;
  }> {
    return client.put(`/workouts/${sessionId}/resume`);
  },

  /**
   * Complete workout session
   * @param sessionId - Workout session ID
   * @param completionData - Completion data
   * @returns Promise with completion summary
   */
  completeWorkout(sessionId: string, completionData?: {
    rating?: number;
    notes?: string;
    actualDuration?: number;
  }): Promise<{
    sessionId: string;
    status: 'completed';
    completedAt: string;
    totalDuration: number;
    totalCalories: number;
    totalExercises: number;
    totalSets: number;
    totalReps: number;
    points: number;
    achievements: Array<{
      id: string;
      name: string;
      description: string;
      points: number;
    }>;
    rating?: number;
    notes?: string;
  }> {
    return client.put(`/workouts/${sessionId}/complete`, completionData);
  },

  /**
   * Get workout history
   * @param userId - User ID
   * @param params - Query parameters
   * @returns Promise with workout history
   */
  getWorkoutHistory(userId: string, params?: {
    startDate?: string;
    endDate?: string;
    workoutType?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    workouts: Array<{
      sessionId: string;
      workoutType: string;
      startTime: string;
      completedAt: string;
      totalDuration: number;
      totalCalories: number;
      totalExercises: number;
      totalSets: number;
      totalReps: number;
      rating?: number;
      notes?: string;
      points: number;
    }>;
    total: number;
    page: number;
    totalPages: number;
    summary: {
      totalWorkouts: number;
      totalDuration: number;
      totalCalories: number;
      averageRating?: number;
      favoriteWorkoutType: string;
    };
  }> {
    return client.get(`/workouts/history/${userId}`, { params });
  },

  /**
   * Get workout statistics
   * @param userId - User ID
   * @param period - Time period
   * @returns Promise with workout statistics
   */
  getWorkoutStatistics(userId: string, period: 'week' | 'month' | 'year' | 'all'): Promise<{
    period: string;
    totalWorkouts: number;
    totalDuration: number;
    totalCalories: number;
    averageWorkoutDuration: number;
    averageCaloriesPerWorkout: number;
    mostActiveDay: string;
    favoriteWorkoutType: string;
    consistencyStreak: number;
    longestStreak: number;
    byDay: Array<{
      date: string;
      workouts: number;
      duration: number;
      calories: number;
    }>;
    byType: Array<{
      type: string;
      count: number;
      totalDuration: number;
      totalCalories: number;
      averageDuration: number;
    }>;
    progress: {
      vsLastPeriod: {
        workouts: number;
        duration: number;
        calories: number;
      };
    };
  }> {
    return client.get(`/workouts/statistics/${userId}`, {
      params: { period }
    });
  },

  /**
   * Get workout by session ID
   * @param sessionId - Workout session ID
   * @returns Promise with workout details
   */
  getWorkout(sessionId: string): Promise<{
    sessionId: string;
    userId: string;
    trainingPlanId?: string;
    workoutType: string;
    startTime: string;
    completedAt?: string;
    totalDuration?: number;
    totalCalories: number;
    status: 'active' | 'paused' | 'completed';
    exercises: Array<{
      exerciseId: string;
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
      restTime: number;
      completedSets: number;
      completedReps: number[];
      actualWeight?: number[];
      actualDuration?: number[];
      notes?: string[];
    }>;
    rating?: number;
    notes?: string;
    points: number;
  }> {
    return client.get(`/workouts/${sessionId}`);
  },

  /**
   * Delete workout session
   * @param sessionId - Workout session ID
   * @returns Promise with deletion confirmation
   */
  deleteWorkout(sessionId: string): Promise<{
    message: string;
  }> {
    return client.delete(`/workouts/${sessionId}`);
  },

  /**
   * Get exercise library
   * @param params - Query parameters
   * @returns Promise with exercises
   */
  getExercises(params?: {
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    equipment?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    exercises: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      equipment: string[];
      muscleGroups: string[];
      instructions: string[];
      videoUrl?: string;
      imageUrl?: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    return client.get('/exercises', { params });
  },

  /**
   * Get exercise details
   * @param exerciseId - Exercise ID
   * @returns Promise with exercise details
   */
  getExercise(exerciseId: string): Promise<{
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    equipment: string[];
    muscleGroups: string[];
    instructions: string[];
    videoUrl?: string;
    imageUrl?: string;
    variations: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }> {
    return client.get(`/exercises/${exerciseId}`);
  }
};
