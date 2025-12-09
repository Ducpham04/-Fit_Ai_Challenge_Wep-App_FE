import client from '@/api/client';
import { getDailyTrainingLogs, getMyChallengeStats, getCurrentTrainingPlans } from '@/features/myChallenge/api/myChallengeService';
import { DailyTrainingLogDTO } from '@/features/myChallenge/types/myChallenge.type';
import { getUserFullProfile } from '@/features/profile/api/profileService';
import { UserInfoAPI } from '@/api/userInfo.api';

interface PersonalizedPlanDetailResponse {
  id: number;
  userId: number;
  dayNumber: number;
  challengeId: number;
  exerciseName: string;
  sets: number;
  reps: number;
  difficulty: string;
  targetMuscle?: string;
  videoUrl?: string;
  challengeName?: string;
  estimatedCalories?: number;
}

export interface DashboardStats {
  weeklyCalories: number;
  weeklyWorkouts: number;
  weeklyMinutes: number;
  currentStreak: number;
  weeklyChart: Array<{
    day: string;
    calories: number;
    minutes: number;
  }>;
  todayProgress: {
    calories: number;
    caloriesGoal: number;
    workouts: number;
    workoutsGoal: number;
    minutes: number;
    minutesGoal: number;
  };
}

export interface RecentActivity {
  id: string;
  title: string;
  time: string;
  duration: string;
  calories: number;
  type: string;
  challengeName?: string;
}

/**
 * Calculate current streak from DailyTrainingLog
 * Streak = consecutive days with at least one completed log
 */
const calculateStreakFromLogs = (allLogs: DailyTrainingLogDTO[]): number => {
  // Filter completed logs only
  const completedLogs = allLogs.filter(log => log.status === 'completed' && log.trainingDate);
  
  if (completedLogs.length === 0) {
    return 0;
  }
  
  // Get unique dates with completed logs, sorted by date (most recent first)
  const completedDates = Array.from(
    new Set(
      completedLogs
        .map(log => {
          const dateStr = String(log.trainingDate).split('T')[0];
          return dateStr;
        })
        .filter(dateStr => dateStr) // Remove null/undefined
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort descending (most recent first)
  
  if (completedDates.length === 0) {
    return 0;
  }
  
  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let streak = 0;
  let expectedDate: string | null = null;
  
  for (const dateStr of completedDates) {
    if (expectedDate === null) {
      // First date: must be today or yesterday to start streak
      if (dateStr === todayStr || dateStr === yesterdayStr) {
        streak = 1;
        expectedDate = dateStr;
      } else {
        // Too old, no streak
        break;
      }
    } else {
      // Check if this date is the day before expectedDate
      const expectedDateObj: Date = new Date(expectedDate + 'T00:00:00');
      expectedDateObj.setDate(expectedDateObj.getDate() - 1);
      const previousDayStr: string = expectedDateObj.toISOString().split('T')[0];
      
      if (dateStr === previousDayStr) {
        streak++;
        expectedDate = dateStr;
      } else {
        // Gap in streak
        break;
      }
    }
  }
  
  return streak;
};

/**
 * Get all DailyTrainingLogs for user across all training plans
 */
const getAllUserDailyLogs = async (userId: string): Promise<DailyTrainingLogDTO[]> => {
  try {
    console.log('📊 [getAllUserDailyLogs] Fetching logs for userId:', userId);
    
    // Get all training plans for user
    const trainingPlans = await getCurrentTrainingPlans(userId);
    console.log('📊 [getAllUserDailyLogs] Training plans found:', trainingPlans.length);
    
    // Get logs from all plans
    const allLogs: DailyTrainingLogDTO[] = [];
    for (const plan of trainingPlans) {
      try {
        console.log(`📊 [getAllUserDailyLogs] Fetching logs for plan ${plan.trainingPlanId}...`);
        const logs = await getDailyTrainingLogs(plan.trainingPlanId);
        console.log(`📊 [getAllUserDailyLogs] Fetched ${logs.length} logs from plan ${plan.trainingPlanId}`);
        
        // Log sample from this plan
        if (logs.length > 0) {
          console.log(`📊 [getAllUserDailyLogs] Sample from plan ${plan.trainingPlanId}:`, logs.slice(0, 3).map(log => ({
            dtlId: log.dtlId,
            trainingDate: log.trainingDate,
            status: log.status,
            challengeName: log.challengeName,
            calories: log.caloriesBurned
          })));
        }
        
        allLogs.push(...logs);
      } catch (error) {
        console.warn(`⚠️ [getAllUserDailyLogs] Could not load logs for plan ${plan.trainingPlanId}:`, error);
      }
    }
    
    console.log('📊 [getAllUserDailyLogs] Total logs collected:', allLogs.length);
    return allLogs;
  } catch (error) {
    console.error('❌ [getAllUserDailyLogs] Error loading all user daily logs:', error);
    return [];
  }
};

/**
 * Get dashboard stats from DailyTrainingLog
 */
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    console.log('📊 [Dashboard] Loading stats for userId:', userId);
    
    // Get all daily logs
    const allLogs = await getAllUserDailyLogs(userId);
    console.log('📊 [Dashboard] Total logs fetched:', allLogs.length);
    
    // Debug: Log all logs to see what we have
    if (allLogs.length > 0) {
      console.log('📊 [Dashboard] ========== ALL LOGS DEBUG ==========');
      allLogs.forEach((log, index) => {
        console.log(`📊 [Dashboard] Log #${index + 1}:`, {
          dtlId: log.dtlId,
          trainingDate: log.trainingDate,
          trainingDateType: typeof log.trainingDate,
          status: log.status,
          challengeName: log.challengeName,
          caloriesBurned: (log as any).caloriesBurned,
          calories: (log as any).calories,
          caloriesFinal: (log as any).caloriesBurned ?? (log as any).calories ?? 0,
          actualDurationMinutes: log.actualDurationMinutes,
          setsCompleted: log.setsCompleted,
          repsCompleted: log.repsCompleted
        });
      });
      console.log('📊 [Dashboard] ======================================');
    } else {
      console.warn('⚠️ [Dashboard] NO LOGS FOUND! Check getAllUserDailyLogs.');
    }
    
    // Calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    console.log('📊 [Dashboard] Date range:', {
      today: today.toISOString().split('T')[0],
      weekAgo: weekAgo.toISOString().split('T')[0]
    });
    
    // ✅ FIX: First filter completed logs from ALL logs (not just weekly)
    // This ensures we don't miss any completed logs
    const allCompletedLogs = allLogs.filter(log => {
      const isCompleted = log.status === 'completed';
      if (!isCompleted) {
        console.log(`⚠️ [Dashboard] Log not completed: status="${log.status}", challenge="${log.challengeName}", date="${log.trainingDate}"`);
      }
      return isCompleted;
    });
    
    console.log('📊 [Dashboard] All completed logs (from all time):', allCompletedLogs.length);
    
    // Debug: Log all completed logs
    if (allCompletedLogs.length > 0) {
      console.log('📊 [Dashboard] All completed logs details:', allCompletedLogs.map(log => ({
        dtlId: log.dtlId,
        trainingDate: log.trainingDate,
        challengeName: log.challengeName,
        caloriesBurned: (log as any).caloriesBurned,
        calories: (log as any).calories,
        caloriesFinal: (log as any).caloriesBurned ?? (log as any).calories ?? 0,
        minutes: log.actualDurationMinutes,
        sets: log.setsCompleted,
        reps: log.repsCompleted,
        status: log.status
      })));
    }
    
    // Filter logs from last 7 days
    // ✅ FIX: Compare date strings directly (YYYY-MM-DD) to avoid timezone issues
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    const weeklyLogs = allCompletedLogs.filter(log => {
      if (!log.trainingDate) {
        console.warn('⚠️ [Dashboard] Log missing trainingDate:', log.dtlId);
        return false;
      }
      // trainingDate is already in YYYY-MM-DD format from backend (LocalDate serialized as string)
      // Handle both YYYY-MM-DD and ISO format (YYYY-MM-DDTHH:mm:ss)
      const logDateStr = String(log.trainingDate).split('T')[0];
      const isInRange = logDateStr >= weekAgoStr && logDateStr <= todayStr;
      
      if (!isInRange) {
        console.log(`⚠️ [Dashboard] Log date out of range: ${logDateStr} (range: ${weekAgoStr} to ${todayStr})`);
      }
      
      return isInRange;
    });
    
    console.log('📊 [Dashboard] Weekly completed logs (last 7 days):', weeklyLogs.length);
    
    // Debug: Log weekly logs details
    if (weeklyLogs.length > 0) {
      console.log('📊 [Dashboard] Weekly completed logs details:', weeklyLogs.map(log => ({
        trainingDate: log.trainingDate,
        challengeName: log.challengeName,
        caloriesBurned: (log as any).caloriesBurned,
        calories: (log as any).calories,
        caloriesFinal: (log as any).caloriesBurned ?? (log as any).calories ?? 0,
        minutes: log.actualDurationMinutes,
        sets: log.setsCompleted,
        reps: log.repsCompleted
      })));
    } else {
      console.warn('⚠️ [Dashboard] NO COMPLETED LOGS IN LAST 7 DAYS!');
      console.warn('⚠️ [Dashboard] All completed logs dates:', allCompletedLogs.map(log => ({
        date: log.trainingDate,
        challenge: log.challengeName
      })));
    }
    
    // Use weeklyLogs as completedLogs (already filtered)
    const completedLogs = weeklyLogs;
    
    // Calculate weekly totals
    // ✅ FIX: Handle both caloriesBurned and calories field names (backend might return different field names)
    const weeklyCalories = completedLogs.reduce((sum, log) => {
      // Try caloriesBurned first, then calories (for backward compatibility)
      const calories = (log as any).caloriesBurned ?? (log as any).calories ?? 0;
      if (calories > 0) {
        console.log(`📊 [Dashboard] Adding calories: ${calories} from ${log.challengeName} (field: ${(log as any).caloriesBurned !== undefined ? 'caloriesBurned' : 'calories'})`);
      }
      return sum + calories;
    }, 0);
    
    // Weekly workouts = number of unique days with completed logs (not total logs)
    const uniqueDaysWithWorkouts = new Set(
      completedLogs
        .map(log => String(log.trainingDate).split('T')[0])
        .filter(dateStr => dateStr)
    ).size;
    const weeklyWorkouts = uniqueDaysWithWorkouts;
    
    const weeklyMinutes = completedLogs.reduce((sum, log) => {
      const minutes = log.actualDurationMinutes ?? 0;
      if (minutes > 0) {
        console.log(`📊 [Dashboard] Adding minutes: ${minutes} from ${log.challengeName}`);
      }
      return sum + minutes;
    }, 0);
    
    console.log('📊 [Dashboard] Weekly totals calculation:', {
      completedLogsCount: completedLogs.length,
      uniqueDays: uniqueDaysWithWorkouts,
      calories: weeklyCalories,
      workouts: weeklyWorkouts,
      minutes: weeklyMinutes,
      logsWithCalories: completedLogs.filter(log => ((log as any).caloriesBurned ?? (log as any).calories ?? 0) > 0).length,
      logsWithMinutes: completedLogs.filter(log => (log.actualDurationMinutes ?? 0) > 0).length,
      sampleLog: completedLogs.length > 0 ? {
        caloriesBurned: (completedLogs[0] as any).caloriesBurned,
        calories: (completedLogs[0] as any).calories,
        actualDurationMinutes: completedLogs[0].actualDurationMinutes,
        allFields: Object.keys(completedLogs[0])
      } : null
    });
    
    // Create weekly chart data (last 7 days, from oldest to newest)
    const weeklyChart: Array<{ day: string; calories: number; minutes: number }> = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Build chart from 6 days ago to today (7 days total)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      
      // ✅ FIX: Compare date strings directly (YYYY-MM-DD) to avoid timezone issues
      const dayLogs = completedLogs.filter(log => {
        if (!log.trainingDate) return false;
        // trainingDate is already in YYYY-MM-DD format from backend
        const logDateStr = String(log.trainingDate).split('T')[0]; // Handle both YYYY-MM-DD and ISO format
        return logDateStr === dateStr;
      });
      
      const dayCalories = dayLogs.reduce((sum, log) => {
        const calories = (log as any).caloriesBurned ?? (log as any).calories ?? 0;
        return sum + calories;
      }, 0);
      const dayMinutes = dayLogs.reduce((sum, log) => sum + (log.actualDurationMinutes ?? 0), 0);
      
      weeklyChart.push({
        day: dayName,
        calories: dayCalories,
        minutes: dayMinutes,
      });
    }
    
    console.log('📊 [Dashboard] Weekly chart data:', weeklyChart);
    
    // Calculate current streak from DailyTrainingLog (completed logs on consecutive days)
    const currentStreak = calculateStreakFromLogs(allLogs);
    console.log('📊 [Dashboard] Current streak:', currentStreak);
    
    // Calculate today's progress
    // ✅ FIX: Use the same todayStr from above (already calculated)
    const todayLogs = completedLogs.filter(log => {
      if (!log.trainingDate) return false;
      // trainingDate is already in YYYY-MM-DD format from backend
      const logDateStr = String(log.trainingDate).split('T')[0]; // Handle both YYYY-MM-DD and ISO format
      return logDateStr === todayStr;
    });
    
    const todayCalories = todayLogs.reduce((sum, log) => {
      const calories = (log as any).caloriesBurned ?? (log as any).calories ?? 0;
      return sum + calories;
    }, 0);
    const todayWorkouts = todayLogs.length;
    const todayMinutes = todayLogs.reduce((sum, log) => sum + (log.actualDurationMinutes ?? 0), 0);
    
    console.log('📊 [Dashboard] Today progress calculation:', {
      todayLogsCount: todayLogs.length,
      calories: todayCalories,
      workouts: todayWorkouts,
      minutes: todayMinutes,
      todayLogsDetails: todayLogs.map(log => ({
        challenge: log.challengeName,
        caloriesBurned: (log as any).caloriesBurned,
        calories: (log as any).calories,
        caloriesFinal: (log as any).caloriesBurned ?? (log as any).calories ?? 0,
        minutes: log.actualDurationMinutes
      }))
    });
    
    console.log('📊 [Dashboard] Today progress:', {
      calories: todayCalories,
      workouts: todayWorkouts,
      minutes: todayMinutes,
      logsCount: todayLogs.length
    });
    
    // Get today's goals from PersonalizedPlanDetail
    let caloriesGoal = 500; // Default goal
    let workoutsGoal = 2; // Default goal
    let minutesGoal = 60; // Default goal
    
    try {
      // Get current training plans to find today's day number
      const trainingPlans = await getCurrentTrainingPlans(userId);
      if (trainingPlans.length > 0) {
        // Get the first training plan (most recent or active)
        const activePlan = trainingPlans[0];
        
        // Calculate day number based on start date
        let todayDayNumber = 1;
        if (activePlan.startDate) {
          const startDate = new Date(activePlan.startDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          startDate.setHours(0, 0, 0, 0);
          const diffTime = today.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          todayDayNumber = Math.max(1, diffDays + 1);
        }
        
        // Get personalized plan details for today
        try {
          const personalizedResponse = await client.get('/user/personalized/today', {
            params: { dayNumber: todayDayNumber }
          });
          
          const personalizedDetails: PersonalizedPlanDetailResponse[] = 
            personalizedResponse.data?.data || [];
          
          if (personalizedDetails.length > 0) {
            // Calculate goals from personalized plan
            const totalEstimatedCalories = personalizedDetails.reduce(
              (sum, detail) => sum + (detail.estimatedCalories || 0), 
              0
            );
            
            // Estimate duration: 3 minutes per set (including rest)
            const totalEstimatedMinutes = personalizedDetails.reduce(
              (sum, detail) => sum + (detail.sets * 3), 
              0
            );
            
            // Number of workouts = number of exercises
            const numberOfWorkouts = personalizedDetails.length;
            
            if (totalEstimatedCalories > 0) {
              caloriesGoal = totalEstimatedCalories;
            }
            if (numberOfWorkouts > 0) {
              workoutsGoal = numberOfWorkouts;
            }
            if (totalEstimatedMinutes > 0) {
              minutesGoal = totalEstimatedMinutes;
            }
            
            console.log('✅ [Dashboard] Today goals from personalized plan:', {
              caloriesGoal,
              workoutsGoal,
              minutesGoal,
              dayNumber: todayDayNumber,
              exercises: numberOfWorkouts,
              personalizedDetailsCount: personalizedDetails.length
            });
          } else {
            console.warn('⚠️ [Dashboard] No personalized details found for day', todayDayNumber);
          }
        } catch (personalizedError) {
          console.warn('⚠️ [Dashboard] Could not load personalized plan details, trying fallback:', personalizedError);
        }
      } else {
        console.warn('⚠️ [Dashboard] No training plans found for user');
      }
      
      // Fallback: Try to get goals from user profile
      if (caloriesGoal === 500 || workoutsGoal === 2 || minutesGoal === 60) {
        try {
          const userProfile = await getUserFullProfile(userId);
          if (userProfile?.goals) {
            const goals = userProfile.goals;
            
            // Daily calories goal: from recommendedCalories or dailyCalories
            if (caloriesGoal === 500 && goals.dailyCalories && goals.dailyCalories > 0) {
              caloriesGoal = goals.dailyCalories;
            }
            
            // Daily workouts goal: calculate from weekly target (weeklyWorkoutsTarget / 7)
            if (workoutsGoal === 2 && goals.weeklyWorkoutsTarget && goals.weeklyWorkoutsTarget > 0) {
              workoutsGoal = Math.max(1, Math.ceil(goals.weeklyWorkoutsTarget / 7));
            }
            
            // Minutes goal: can be calculated from average workout duration or use default
            if (minutesGoal === 60 && weeklyMinutes > 0) {
              minutesGoal = Math.max(30, Math.ceil(weeklyMinutes / 7));
            }
          }
        } catch (error) {
          console.warn('Could not load user goals, using defaults:', error);
        }
      }
      
      // Final fallback: Try UserInfo API for calories
      if (caloriesGoal === 500) {
        try {
          const userInfoResponse = await UserInfoAPI.getUserInfo();
          const userInfo = userInfoResponse?.data;
          if (userInfo && userInfo.recommendedCalories) {
            caloriesGoal = Math.round(Number(userInfo.recommendedCalories));
          }
        } catch (err) {
          console.warn('Could not load user info, using defaults:', err);
        }
      }
    } catch (error) {
      console.warn('Error loading today goals, using defaults:', error);
    }
    
    const result = {
      weeklyCalories,
      weeklyWorkouts,
      weeklyMinutes,
      currentStreak,
      weeklyChart,
      todayProgress: {
        calories: todayCalories,
        caloriesGoal,
        workouts: todayWorkouts,
        workoutsGoal,
        minutes: todayMinutes,
        minutesGoal,
      },
    };
    
    console.log('📊 [Dashboard] Final stats:', {
      weeklyCalories: result.weeklyCalories,
      weeklyWorkouts: result.weeklyWorkouts,
      weeklyMinutes: result.weeklyMinutes,
      todayProgress: result.todayProgress,
      weeklyChartLength: result.weeklyChart.length
    });
    
    return result;
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    // Return default stats on error
    return {
      weeklyCalories: 0,
      weeklyWorkouts: 0,
      weeklyMinutes: 0,
      currentStreak: 0,
      weeklyChart: [
        { day: 'Mon', calories: 0, minutes: 0 },
        { day: 'Tue', calories: 0, minutes: 0 },
        { day: 'Wed', calories: 0, minutes: 0 },
        { day: 'Thu', calories: 0, minutes: 0 },
        { day: 'Fri', calories: 0, minutes: 0 },
        { day: 'Sat', calories: 0, minutes: 0 },
        { day: 'Sun', calories: 0, minutes: 0 },
      ],
      todayProgress: {
        calories: 0,
        caloriesGoal: 500,
        workouts: 0,
        workoutsGoal: 2,
        minutes: 0,
        minutesGoal: 60,
      },
    };
  }
};

/**
 * Get recent activities from DailyTrainingLog
 */
export const getRecentActivities = async (userId: string, limit: number = 5): Promise<RecentActivity[]> => {
  try {
    const allLogs = await getAllUserDailyLogs(userId);
    
    // Filter completed logs and sort by completedAt (most recent first)
    const completedLogs = allLogs
      .filter(log => log.status === 'completed' && log.completedAt)
      .sort((a, b) => {
        const dateA = new Date(a.completedAt || 0).getTime();
        const dateB = new Date(b.completedAt || 0).getTime();
        return dateB - dateA; // Most recent first
      })
      .slice(0, limit);
    
    return completedLogs.map((log, index) => {
      const completedDate = log.completedAt ? new Date(log.completedAt) : new Date();
      const now = new Date();
      const isToday = completedDate.toDateString() === now.toDateString();
      const isYesterday = completedDate.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
      
      let timeStr = '';
      if (isToday) {
        timeStr = `Today, ${completedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (isYesterday) {
        timeStr = `Yesterday, ${completedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        timeStr = completedDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
      
      const duration = log.actualDurationMinutes 
        ? `${log.actualDurationMinutes} min`
        : 'N/A';
      
      // Handle both caloriesBurned and calories field names
      const calories = (log as any).caloriesBurned ?? (log as any).calories ?? 0;
      
      return {
        id: log.dtlId?.toString() || `activity-${index}`,
        title: log.challengeName || 'Workout',
        time: timeStr,
        duration,
        calories: calories,
        type: log.exerciseType || 'Exercise',
        challengeName: log.challengeName,
      };
    });
  } catch (error) {
    console.error('Error loading recent activities:', error);
    return [];
  }
};

