/**
 * Workout Plan API Service
 * 
 * Provides API client for fetching workout plan data.
 * Supports switching between mock and production backends via environment variables.
 * 
 * Usage:
 *   import { workoutPlanApi } from './workoutPlanApi';
 *   const plan = await workoutPlanApi.getFullPlan('intermediate');
 *   const dayTarget = await workoutPlanApi.getDayTarget(1, 'intermediate');
 */

// ============================================
// CONFIGURATION
// ============================================

/**
 * API configuration
 * Set VITE_USE_MOCK_API=false in .env to use production API
 * 
 * To switch to production API:
 * 1. Create .env file in project root
 * 2. Add: VITE_USE_MOCK_API=false
 * 3. Add: VITE_API_URL=https://your-api.com/api
 */
const config = {
  // Use mock API by default in development
  // To use real API, call workoutPlanApi.config.setUseMockApi(false)
  useMockApi: true,
  
  // API base URLs
  mockApiUrl: 'http://localhost:3001/api',
  productionApiUrl: 'https://api.fitai.com/api',
  
  // Request timeout (ms)
  timeout: 10000,
};

/**
 * Get the active API base URL based on configuration
 */
function getBaseUrl(): string {
  return config.useMockApi ? config.mockApiUrl : config.productionApiUrl;
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export type PlanType = 'beginner' | 'intermediate' | 'advanced';

export interface DailyWorkout {
  day: number;
  pushUps: number;
  squats: number;
  jumpingJacks: number;
  plankSeconds: number;
}

export interface WorkoutPlan {
  planType: PlanType;
  totalDays: number;
  currentDay: number;
  plan: DailyWorkout[];
}

export interface ApiError {
  error: string;
  code: string;
  timestamp?: string;
}

// ============================================
// HTTP CLIENT
// ============================================

/**
 * Generic fetch wrapper with timeout and error handling
 */
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
        code: 'HTTP_ERROR',
      }));
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
    
    throw new Error('Unknown error occurred');
  }
}

// ============================================
// API METHODS
// ============================================

/**
 * Get the complete workout plan
 * 
 * @param planType - Type of plan: 'beginner', 'intermediate', or 'advanced'
 * @param days - Number of days in the plan (default: 14)
 * @returns Complete workout plan with all days
 * 
 * @example
 * const plan = await workoutPlanApi.getFullPlan('intermediate');
 * console.log(plan.currentDay); // 1
 * console.log(plan.plan[0].pushUps); // 27
 */
async function getFullPlan(
  planType: PlanType = 'intermediate',
  days: number = 14
): Promise<WorkoutPlan> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/workout-plan?type=${planType}&days=${days}`;
  
  console.log(`📡 Fetching workout plan: ${planType} (${days} days)`);
  console.log(`   URL: ${url}`);
  console.log(`   Mode: ${config.useMockApi ? 'MOCK' : 'PRODUCTION'}`);
  
  const plan = await fetchWithTimeout<WorkoutPlan>(url);
  
  console.log(`✅ Plan loaded: Day ${plan.currentDay}/${plan.totalDays}`);
  return plan;
}

/**
 * Get workout targets for a specific day
 * 
 * @param dayNumber - Day number (1-14)
 * @param planType - Type of plan (default: 'intermediate')
 * @returns Daily workout targets
 * 
 * @example
 * const dayTargets = await workoutPlanApi.getDayTarget(1, 'intermediate');
 * console.log(dayTargets.pushUps); // 27
 * console.log(dayTargets.squats); // 41
 */
async function getDayTarget(
  dayNumber: number,
  planType: PlanType = 'intermediate'
): Promise<DailyWorkout> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/workout-plan/day/${dayNumber}?type=${planType}`;
  
  console.log(`📡 Fetching day ${dayNumber} target: ${planType}`);
  console.log(`   URL: ${url}`);
  
  const dayTarget = await fetchWithTimeout<DailyWorkout>(url);
  
  console.log(`✅ Day ${dayNumber} target: ${dayTarget.pushUps} push-ups, ${dayTarget.squats} squats`);
  return dayTarget;
}

/**
 * Get current day's workout target
 * Convenience method that fetches the full plan and returns today's target
 * 
 * @param planType - Type of plan (default: 'intermediate')
 * @returns Today's workout targets
 * 
 * @example
 * const today = await workoutPlanApi.getCurrentDayTarget('intermediate');
 * console.log(`Today's target: ${today.pushUps} push-ups`);
 */
async function getCurrentDayTarget(
  planType: PlanType = 'intermediate'
): Promise<DailyWorkout> {
  const plan = await getFullPlan(planType);
  const currentDayData = plan.plan.find(d => d.day === plan.currentDay);
  
  if (!currentDayData) {
    throw new Error(`Current day ${plan.currentDay} not found in plan`);
  }
  
  return currentDayData;
}

// ============================================
// EXPORTS
// ============================================

export const workoutPlanApi = {
  getFullPlan,
  getDayTarget,
  getCurrentDayTarget,
  
  // Expose config for debugging/testing
  config: {
    getBaseUrl,
    isUsingMockApi: () => config.useMockApi,
    setUseMockApi: (useMock: boolean) => {
      config.useMockApi = useMock;
      console.log(`🔄 Switched to ${useMock ? 'MOCK' : 'PRODUCTION'} API`);
    },
  },
};

export default workoutPlanApi;
