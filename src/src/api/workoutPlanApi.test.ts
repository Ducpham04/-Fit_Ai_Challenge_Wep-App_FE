/**
 * Unit Tests for Workout Plan API
 * 
 * Tests API service layer functionality including:
 * - Fetching workout plans
 * - Fetching daily targets
 * - Error handling
 * - Mock/production API switching
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { workoutPlanApi, DailyWorkout, WorkoutPlan } from './workoutPlanApi';

// Mock fetch globally
global.fetch = jest.fn() as any;

describe('workoutPlanApi', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset to mock API mode
    workoutPlanApi.config.setUseMockApi(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getFullPlan', () => {
    it('should fetch the complete intermediate workout plan', async () => {
      // Arrange
      const mockResponse: WorkoutPlan = {
        planType: 'intermediate',
        totalDays: 14,
        currentDay: 1,
        plan: [
          { day: 1, pushUps: 27, squats: 41, jumpingJacks: 128, plankSeconds: 47 },
          { day: 2, pushUps: 28, squats: 42, jumpingJacks: 132, plankSeconds: 49 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await workoutPlanApi.getFullPlan('intermediate');

      // Assert
      expect(result.planType).toBe('intermediate');
      expect(result.totalDays).toBe(14);
      expect(result.currentDay).toBe(1);
      expect(result.plan.length).toBe(2);
      expect(result.plan[0].pushUps).toBe(27);
      expect(result.plan[0].squats).toBe(41);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-plan?type=intermediate&days=14'),
        expect.any(Object)
      );
    });

    it('should fetch beginner plan when specified', async () => {
      // Arrange
      const mockResponse: WorkoutPlan = {
        planType: 'beginner',
        totalDays: 14,
        currentDay: 1,
        plan: [
          { day: 1, pushUps: 10, squats: 15, jumpingJacks: 30, plankSeconds: 20 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await workoutPlanApi.getFullPlan('beginner');

      // Assert
      expect(result.planType).toBe('beginner');
      expect(result.plan[0].pushUps).toBe(10);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('type=beginner'),
        expect.any(Object)
      );
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error', code: 'INTERNAL_ERROR' }),
      });

      // Act & Assert
      await expect(workoutPlanApi.getFullPlan('intermediate')).rejects.toThrow('Server error');
    });

    it('should handle network timeout', async () => {
      // Arrange
      (global.fetch as any).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      );

      // Act & Assert
      await expect(workoutPlanApi.getFullPlan('intermediate')).rejects.toThrow();
    });
  });

  describe('getDayTarget', () => {
    it('should fetch target for a specific day', async () => {
      // Arrange
      const mockDayTarget: DailyWorkout = {
        day: 1,
        pushUps: 27,
        squats: 41,
        jumpingJacks: 128,
        plankSeconds: 47,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDayTarget,
      });

      // Act
      const result = await workoutPlanApi.getDayTarget(1, 'intermediate');

      // Assert
      expect(result.day).toBe(1);
      expect(result.pushUps).toBe(27);
      expect(result.squats).toBe(41);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-plan/day/1'),
        expect.any(Object)
      );
    });

    it('should fetch different day targets correctly', async () => {
      // Arrange
      const mockDay5Target: DailyWorkout = {
        day: 5,
        pushUps: 31,
        squats: 47,
        jumpingJacks: 147,
        plankSeconds: 54,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDay5Target,
      });

      // Act
      const result = await workoutPlanApi.getDayTarget(5, 'intermediate');

      // Assert
      expect(result.day).toBe(5);
      expect(result.pushUps).toBe(31);
      expect(result.squats).toBe(47);
    });

    it('should handle invalid day number', async () => {
      // Arrange
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ 
          error: 'Day number must be between 1 and 14', 
          code: 'INVALID_DAY_NUMBER' 
        }),
      });

      // Act & Assert
      await expect(workoutPlanApi.getDayTarget(99, 'intermediate'))
        .rejects.toThrow('Day number must be between 1 and 14');
    });
  });

  describe('getCurrentDayTarget', () => {
    it('should fetch current day target from full plan', async () => {
      // Arrange
      const mockResponse: WorkoutPlan = {
        planType: 'intermediate',
        totalDays: 14,
        currentDay: 3,
        plan: [
          { day: 1, pushUps: 27, squats: 41, jumpingJacks: 128, plankSeconds: 47 },
          { day: 2, pushUps: 28, squats: 42, jumpingJacks: 132, plankSeconds: 49 },
          { day: 3, pushUps: 29, squats: 44, jumpingJacks: 137, plankSeconds: 50 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await workoutPlanApi.getCurrentDayTarget('intermediate');

      // Assert
      expect(result.day).toBe(3);
      expect(result.pushUps).toBe(29);
      expect(result.squats).toBe(44);
    });

    it('should throw error if current day not found in plan', async () => {
      // Arrange
      const mockResponse: WorkoutPlan = {
        planType: 'intermediate',
        totalDays: 14,
        currentDay: 99, // Invalid day
        plan: [
          { day: 1, pushUps: 27, squats: 41, jumpingJacks: 128, plankSeconds: 47 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act & Assert
      await expect(workoutPlanApi.getCurrentDayTarget('intermediate'))
        .rejects.toThrow('Current day 99 not found in plan');
    });
  });

  describe('API mode switching', () => {
    it('should use mock API by default', () => {
      expect(workoutPlanApi.config.isUsingMockApi()).toBe(true);
      expect(workoutPlanApi.config.getBaseUrl()).toBe('http://localhost:3001/api');
    });

    it('should switch to production API', () => {
      // Act
      workoutPlanApi.config.setUseMockApi(false);

      // Assert
      expect(workoutPlanApi.config.isUsingMockApi()).toBe(false);
      expect(workoutPlanApi.config.getBaseUrl()).toBe('https://api.fitai.com/api');
    });

    it('should switch back to mock API', () => {
      // Arrange
      workoutPlanApi.config.setUseMockApi(false);

      // Act
      workoutPlanApi.config.setUseMockApi(true);

      // Assert
      expect(workoutPlanApi.config.isUsingMockApi()).toBe(true);
      expect(workoutPlanApi.config.getBaseUrl()).toBe('http://localhost:3001/api');
    });
  });

  describe('Data validation', () => {
    it('should validate push-up targets are within expected range', async () => {
      // Arrange
      const mockResponse: WorkoutPlan = {
        planType: 'intermediate',
        totalDays: 14,
        currentDay: 1,
        plan: [
          { day: 1, pushUps: 27, squats: 41, jumpingJacks: 128, plankSeconds: 47 },
          { day: 14, pushUps: 42, squats: 64, jumpingJacks: 200, plankSeconds: 74 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await workoutPlanApi.getFullPlan('intermediate');

      // Assert
      const day1 = result.plan[0];
      const day14 = result.plan[1];
      
      expect(day1.pushUps).toBeGreaterThan(0);
      expect(day1.pushUps).toBeLessThan(100);
      expect(day14.pushUps).toBeGreaterThan(day1.pushUps); // Progressive overload
    });

    it('should validate squat targets follow progression', async () => {
      // Arrange
      const mockResponse: WorkoutPlan = {
        planType: 'intermediate',
        totalDays: 14,
        currentDay: 1,
        plan: [
          { day: 1, pushUps: 27, squats: 41, jumpingJacks: 128, plankSeconds: 47 },
          { day: 7, pushUps: 33, squats: 50, jumpingJacks: 157, plankSeconds: 58 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await workoutPlanApi.getFullPlan('intermediate');

      // Assert
      const day1 = result.plan[0];
      const day7 = result.plan[1];
      
      expect(day7.squats).toBeGreaterThan(day1.squats);
      expect(day7.squats - day1.squats).toBeGreaterThan(0); // Shows progression
    });
  });
});
