// services/myChallengeService.ts
import client from '../../../api/client'; // axios instance đã config baseURL và auth
import { UserCurrentTrainingPlan, TrainingPlanDetail, DayChallenges, Challenge, TrainingPlanDetailDTO, DailyTrainingLogDTO } from '../types/myChallenge.type';

/**
 * Transform DailyTrainingLog DTO to Frontend Challenge type
 */
const transformDailyTrainingLogDTO = (dto: DailyTrainingLogDTO): Challenge => {
  // Map status from DailyTrainingLog to Challenge status
  let status: Challenge['status'] = 'not_started';
  if (dto.status === 'completed') {
    status = 'COMPLETED';
  } else if (dto.status === 'in_progress') {
    status = 'in_progress';
  } else if (dto.status === 'skipped') {
    status = 'INACTIVE';
  } else {
    status = 'not_started';
  }

  // ✅ FIX: Map aiAnalysis từ DailyTrainingLogDTO nếu có dữ liệu
  // Sử dụng score, confidence, repsCompleted, setsCompleted để tạo aiAnalysis object
  let aiAnalysis: Challenge['aiAnalysis'] | undefined = undefined;
  if (dto.status === 'completed' && (dto.repsCompleted !== undefined || dto.score !== undefined)) {
    const correctReps = dto.repsCompleted || 0;
    const totalReps = dto.repsCompleted || dto.targetReps || 0;
    const accuracy = dto.score !== undefined ? dto.score : (dto.confidence ? Math.round(dto.confidence * 100) : 0);
    
    // Tạo feedback dựa trên score và reps
    let feedback = 'Good job completing the challenge!';
    if (accuracy >= 80) {
      feedback = 'Excellent form and execution! Keep up the great work.';
    } else if (accuracy >= 60) {
      feedback = 'Good effort! Focus on maintaining proper form throughout.';
    } else {
      feedback = 'Keep practicing to improve your form and technique.';
    }
    
    // Xác định posture dựa trên score
    let posture = 'Good';
    if (accuracy >= 80) {
      posture = 'Excellent';
    } else if (accuracy >= 60) {
      posture = 'Good';
    } else {
      posture = 'Fair';
    }
    
    aiAnalysis = {
      correctReps: correctReps,
      totalReps: totalReps,
      accuracy: accuracy, // score từ backend (0-100)
      feedback: feedback,
      posture: posture,
    };
  }

  return {
    id: dto.dtlId || dto.challengeId, // Use dtlId if exists, otherwise challengeId
    challengeId: dto.challengeId,
    challengeName: dto.challengeName,
    title: dto.challengeTitle,
    sets: dto.targetSets,
    reps: dto.targetReps,
    status: status,
    description: dto.challengeDescription,
    difficulty: dto.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
    videoUrl: dto.videoUrl,
    exerciseType: dto.exerciseType,
    // Progress tracking from DailyTrainingLog
    setsCompleted: dto.setsCompleted,
    repsCompleted: dto.repsCompleted,
    actualDurationMinutes: dto.actualDurationMinutes,
    caloriesBurned: dto.caloriesBurned,
    score: dto.score,
    confidence: dto.confidence,
    // ✅ FIX: Thêm aiAnalysis để hiển thị kết quả trong ChallengeCard
    aiAnalysis: aiAnalysis,
  };
};

/**
 * Transform Backend DTO to Frontend Challenge type (for template fallback)
 */
const transformChallengeDTO = (dto: TrainingPlanDetailDTO): Challenge => {
  return {
    id: dto.tpdId,
    challengeId: dto.challenge.goalId,
    challengeName: dto.challengeName,
    title: dto.challenge.title,
    sets: dto.sets,
    reps: dto.reps,
    status: (dto.challenge.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as any,
    description: dto.challenge.description,
    difficulty: dto.challenge.difficult,
    videoUrl: dto.challenge.linkVideos,
    exerciseType: dto.challenge.exerciseType, // AI model/exercise type from backend
  };
};

/**
 * Group challenges by day and format with day names
 */
const groupChallengesByDay = (dtoArray: TrainingPlanDetailDTO[]): DayChallenges[] => {
  const grouped = new Map<number, TrainingPlanDetailDTO[]>();
  
  // Group by dayNumber
  dtoArray.forEach((dto) => {
    if (!grouped.has(dto.dayNumber)) {
      grouped.set(dto.dayNumber, []);
    }
    grouped.get(dto.dayNumber)!.push(dto);
  });

  // Sort by day number and create DayChallenges array
  const days: DayChallenges[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([dayNum, dtos]) => {
      const dayIndex = (dayNum - 1) % 7;
      days.push({
        dayNumber: dayNum,
        dayName: `Day ${dayNum} - ${dayNames[dayIndex]}`,
        challenges: dtos.map(transformChallengeDTO),
      });
    });

  return days;
};

/**
 * Lấy danh sách training plans hiện tại của user
 * Maps backend UserTrainingDTO to frontend UserCurrentTrainingPlan
 */
export const getCurrentTrainingPlans = async (userId: string): Promise<UserCurrentTrainingPlan[]> => {
  console.log("User Id", userId)
  const res = await client.get(`/user/training/${userId}`);
  
  // Backend returns: { success: true, message: "...", data: UserTrainingDTO[] }
  const userTrainingDTOs = res.data?.data || [];
  
  // Map backend DTO to frontend type
  const mappedPlans: UserCurrentTrainingPlan[] = userTrainingDTOs.map((dto: any) => {
    console.log('Mapping UserTraining DTO:', {
      id: dto.id,
      trainingPlanId: dto.trainingPlanId,
      name: dto.name,
    });
    
    // Calculate days between start and end date
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate progress and days completed
    const completionPercentage = dto.completionPercentage || 0;
    const daysCompleted = Math.round((completionPercentage / 100) * daysDiff);
    
    // Map status
    const statusStr = (dto.Status || dto.status || 'active').toLowerCase();
    const status = (statusStr === 'completed' ? 'completed' : 
                   statusStr === 'pending' ? 'pending' : 
                   'active') as 'active' | 'completed' | 'pending';
    
    // IMPORTANT: 
    // - id = utId (UserTraining ID) - dùng để load personalized data
    // - trainingPlanId = Template Plan ID - dùng để load plan details từ template
    const mapped = {
      id: dto.id, // utId (UserTraining ID)
      trainingPlanId: dto.trainingPlanId, // Training Plan template ID (KHÔNG fallback)
      name: dto.name,
      planName: dto.name || 'Training Plan',
      description: 'Complete daily challenges to achieve your fitness goals',
      difficulty: 'Intermediate', // Default, can be enhanced later
      duration: `${daysDiff} days`,
      progressPercentage: Math.round(completionPercentage),
      completionPercentage: completionPercentage,
      startDate: dto.startDate,
      endDate: dto.endDate,
      daysCompleted: daysCompleted,
      totalDays: daysDiff,
      lastActivityDate: dto.endDate || dto.startDate, // Use endDate as fallback
      status: status,
    };
    
    console.log('Mapped plan:', {
      id: mapped.id,
      trainingPlanId: mapped.trainingPlanId,
      planName: mapped.planName,
    });
    
    return mapped;
  });
  
  return mappedPlans;
};

/**
 * Lấy daily training logs từ DailyTrainingLog API
 * Kết hợp với challenge information từ template
 */
export const getDailyTrainingLogs = async (trainingPlanId: number): Promise<DailyTrainingLogDTO[]> => {
  try {
    const res = await client.get(`/user/daily-training-logs/plan/${trainingPlanId}`);
    
    if (res.data?.success && res.data?.data) {
      return res.data.data as DailyTrainingLogDTO[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching daily training logs:', error);
    return [];
  }
};

/**
 * Tạo hoặc cập nhật DailyTrainingLog khi complete challenge
 * Backend hiện tại chỉ hỗ trợ cập nhật status, các field khác sẽ được lưu sau
 */
export const saveDailyTrainingLog = async (
  trainingPlanId: number,
  dayNumber: number,
  challengeId: number,
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped',
  analysisData?: {
    repsCompleted?: number;
    setsCompleted?: number;
    score?: number;
    confidence?: number;
    actualDurationMinutes?: number;
  }
): Promise<void> => {
  console.log('🔵 [saveDailyTrainingLog] Function called with:', {
    trainingPlanId,
    dayNumber,
    challengeId,
    status,
    analysisData,
  });

  try {
    const params = new URLSearchParams({
      trainingPlanId: trainingPlanId.toString(),
      dayNumber: dayNumber.toString(),
      challengeId: challengeId.toString(),
      status: status,
    });

    // Sử dụng baseURL từ client (đã được config tự động, có /api)
    // Nhưng cần base URL không có /api cho file URLs
    const baseUrl = (client.defaults.baseURL || 'http://localhost:8080/api').replace('/api', '');
    const url = `/user/daily-training-logs?${params.toString()}`;
    const fullUrl = `${baseUrl}${url}`;
    const body = analysisData || {};
    
    console.log('🔵 [saveDailyTrainingLog] ========== MAKING API CALL ==========');
    console.log('🔵 [saveDailyTrainingLog] Full API URL:', fullUrl);
    console.log('🔵 [saveDailyTrainingLog] Relative URL:', url);
    console.log('🔵 [saveDailyTrainingLog] Method: POST');
    console.log('🔵 [saveDailyTrainingLog] Query Params:', params.toString());
    console.log('🔵 [saveDailyTrainingLog] Request Body:', JSON.stringify(body, null, 2));
    console.log('🔵 [saveDailyTrainingLog] Headers:', {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [token]',
    });

    // ✅ FIX: Gửi analysisData trong request body thay vì chỉ query params
    const res = await client.post(url, body);
    
    console.log('🔵 [saveDailyTrainingLog] API Response received:');
    console.log('   - Status:', res.status);
    console.log('   - Data:', JSON.stringify(res.data, null, 2));
    
    if (res.data?.success) {
      console.log('✅ [saveDailyTrainingLog] DailyTrainingLog saved successfully:', {
        trainingPlanId,
        dayNumber,
        challengeId,
        status,
        analysisData,
        message: res.data.message,
      });
    } else {
      console.error('❌ [saveDailyTrainingLog] API returned failure:', res.data);
      throw new Error(res.data?.message || 'Failed to save DailyTrainingLog');
    }
  } catch (error: any) {
    console.error('❌ [saveDailyTrainingLog] Error occurred:');
    console.error('   - Error type:', error?.constructor?.name);
    console.error('   - Error message:', error?.message);
    console.error('   - Error response:', error?.response?.data);
    console.error('   - Error status:', error?.response?.status);
    console.error('   - Error config:', error?.config);
    console.error('   - Full error:', error);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to save DailyTrainingLog';
    
    if (error?.response) {
      // Server responded with error
      const responseData = error.response.data;
      if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (responseData?.error) {
        errorMessage = responseData.error;
      } else {
        errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
      }
    } else if (error?.request) {
      // Request was made but no response received
      errorMessage = 'Network error: No response from server. Please check your connection.';
    } else if (error?.message) {
      // Error setting up request
      errorMessage = `Request error: ${error.message}`;
    }
    
    const detailedError = new Error(errorMessage);
    (detailedError as any).originalError = error;
    (detailedError as any).status = error?.response?.status;
    (detailedError as any).responseData = error?.response?.data;
    throw detailedError;
  }
};

/**
 * Lấy chi tiết một training plan theo planId
 * Sử dụng DailyTrainingLog (kết hợp với template) thay vì chỉ template
 * Maps BE response to FE structure with day-based organization
 */
export const getTrainingPlanDetail = async (trainingPlanId: number): Promise<TrainingPlanDetail> => {
  try {
    // First, try to get DailyTrainingLog (user's actual progress)
    const dailyLogs = await getDailyTrainingLogs(trainingPlanId);
    
    if (dailyLogs.length > 0) {
      // Use DailyTrainingLog data
      console.log('Using DailyTrainingLog data:', dailyLogs);
      
      // Group by day
      const grouped = new Map<number, DailyTrainingLogDTO[]>();
      for (const log of dailyLogs) {
        if (!grouped.has(log.dayNumber)) {
          grouped.set(log.dayNumber, []);
        }
        grouped.get(log.dayNumber)!.push(log);
      }
      
      const dayChallenges: DayChallenges[] = Array.from(grouped.entries())
        .sort(([a], [b]) => a - b)
        .map(([dayNumber, logs]) => ({
          dayNumber,
          dayName: `Day ${dayNumber}`,
          challenges: logs.map(transformDailyTrainingLogDTO),
        }));
      
      const totalDays = Math.max(...dailyLogs.map(d => d.dayNumber));
      const completedCount = dailyLogs.filter(d => d.status === 'completed').length;
      const progressPercentage = Math.round((completedCount / dailyLogs.length) * 100);
      
      const firstLog = dailyLogs[0];
      
      return {
        id: trainingPlanId,
        planName: firstLog.trainingPlanTitle,
        description: 'Training Plan Description',
        duration: `${totalDays} days`,
        startDate: firstLog.trainingDate,
        endDate: new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        difficulty: 'Intermediate',
        totalDays,
        progressPercentage,
        dayChallenges,
        userId: firstLog.userId,
        status: 'active',
      };
    }
    
    // Fallback: Use template data if no DailyTrainingLog exists
    console.log('No DailyTrainingLog found, falling back to template');
    const res = await client.get(`/training-plans/${trainingPlanId}/details`);
    
    console.log('Training Plan Details Response:', res.data);
    
    // Handle response format: { success, message, data: TrainingPlanDetailDTO[] }
    // Check if response has data property
    const responseData = res.data?.data || res.data || [];
    const dtoArray: TrainingPlanDetailDTO[] = Array.isArray(responseData) ? responseData : [];
    
    console.log('Parsed DTO Array:', dtoArray);
    console.log('DTO Array Length:', dtoArray.length);
    
    if (dtoArray.length === 0) {
      console.warn(`No training plan details found for planId: ${trainingPlanId}`);
      // Try to get basic plan info as fallback
      try {
        const planRes = await client.get(`/training-plans/${trainingPlanId}`);
        const planData = planRes.data;
        console.log('Fallback Plan Data:', planData);
        
        // Return empty plan structure
        return {
          id: trainingPlanId,
          planName: planData?.title || 'Training Plan',
          description: planData?.description || 'No description available',
          duration: `${planData?.duration || 0} days`,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          difficulty: planData?.difficulty || 'Intermediate',
          totalDays: 0,
          progressPercentage: 0,
          dayChallenges: [],
          userId: 0,
          status: 'active',
        };
      } catch (fallbackError) {
        console.error('Error fetching fallback plan data:', fallbackError);
        throw new Error(`Training plan ${trainingPlanId} exists but has no details. Please contact admin to add exercises to this plan.`);
      }
    }

    // Get plan info from first item
    const firstDto = dtoArray[0];

    // Group challenges by day
    const dayChallenges = groupChallengesByDay(dtoArray);

    // Calculate total days
    const totalDays = Math.max(...dtoArray.map(d => d.dayNumber));

    // Calculate progress percentage
    const completedChallenges = dtoArray.filter(d => d.challenge.status === 'COMPLETED').length;
    const progressPercentage = Math.round((completedChallenges / dtoArray.length) * 100);

    // Map difficulty from challenge
    const difficultyMap: { [key: string]: string } = {
      'EASY': 'Beginner',
      'MEDIUM': 'Intermediate',
      'HARD': 'Advanced',
    };

    const trainingPlanDetail: TrainingPlanDetail = {
      id: firstDto.trainingPlanId,
      planName: firstDto.trainingPlanTitle,
      description: 'Training Plan Description',
      duration: `${totalDays} days`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      difficulty: difficultyMap[firstDto.challenge.difficult] || 'Intermediate',
      totalDays,
      progressPercentage,
      dayChallenges,
      userId: 0,
      status: 'active',
    };

    return trainingPlanDetail;
  } catch (error) {
    console.error('Error fetching training plan detail:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái challenge
 */
export const updateChallengeStatus = async (
  trainingPlanId: number,
  challengeId: number,
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'in_progress' | 'not_started'
) => {
  const res = await client.patch(`/user/training/${trainingPlanId}/challenge/${challengeId}/status`, {
    status,
  });
  return res.data;
};

/**
 * Gửi video challenge để AI phân tích
 */
export const submitChallengeVideo = async (
  trainingPlanId: number,
  challengeId: number,
  videoFile: File
) => {
  const formData = new FormData();
  formData.append('video', videoFile);

  const res = await client.post(
    `/api/user/training/${trainingPlanId}/challenge/${challengeId}/submitVideo`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return res.data; // Trả về kết quả phân tích AI
};

/**
 * Đánh dấu challenge đã hoàn thành
 * @param userChallengeId - ID của UserChallenge (ucId), không phải challengeId
 */
export const completeChallenge = async (userChallengeId: number) => {
  const res = await client.put(`/user/challenges/${userChallengeId}/complete`);
  return res.data;
};

/**
 * Lấy danh sách bài tập đã được cá nhân hóa cho một ngày cụ thể
 * @param utId - UserTraining ID (ut_id)
 * @param dayNumber - Day number
 */
export const getPersonalizedDayDetails = async (utId: number, dayNumber: number) => {
  try {
    const res = await client.get(`/user/training/${utId}/day/${dayNumber}`);
    
    if (res.data?.success && res.data?.data) {
      return res.data.data; // Array of PersonalizedPlanDetailResponse
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching personalized day details:', error);
    return [];
  }
};

/**
 * Tạo lại PersonalizedPlanDetail cho một UserTraining
 * Dùng khi PersonalizedPlanDetail chưa được tạo hoặc cần tạo lại
 * @param utId - UserTraining ID (ut_id)
 */
export const regeneratePersonalizedPlanDetails = async (utId: number): Promise<void> => {
  try {
    console.log('🔄 Regenerating personalized plan details for utId:', utId);
    const res = await client.post(`/user/training/${utId}/regenerate-personalized`);
    
    if (res.data?.success) {
      console.log('✅ Personalized plan details regenerated successfully:', res.data.message);
    } else {
      throw new Error(res.data?.message || 'Failed to regenerate personalized plan details');
    }
  } catch (error) {
    console.error('❌ Error regenerating personalized plan details:', error);
    throw error;
  }
};

/**
 * Interface cho My Challenge stats
 */
export interface MyChallengeStats {
  activePlans: number;
  completedChallenges: number;
  currentStreak: number;
}

/**
 * Lấy stats cho My Challenge page
 * @param userId - User ID
 * @returns Promise với stats (active plans, completed challenges, streak)
 */
export const getMyChallengeStats = async (userId: string): Promise<MyChallengeStats> => {
  try {
    // Lấy training plans để tính active plans
    const trainingPlans = await getCurrentTrainingPlans(userId);
    const activePlans = trainingPlans.filter(
      plan => plan.status === 'active' || !plan.status || plan.status === 'pending'
    ).length;

    // Lấy stats từ user profile endpoint
    const profileRes = await client.get(`/api/v1/users/${userId}/profile/full`);
    const stats = profileRes.data?.stats || {};
    
    return {
      activePlans,
      completedChallenges: stats.challengesCompleted || 0,
      currentStreak: stats.currentStreak || 0,
    };
  } catch (error) {
    console.error('Error fetching My Challenge stats:', error);
    // Fallback: tính từ training plans nếu profile endpoint fail
    try {
      const trainingPlans = await getCurrentTrainingPlans(userId);
      const activePlans = trainingPlans.filter(
        plan => plan.status === 'active' || !plan.status || plan.status === 'pending'
      ).length;
      
      return {
        activePlans,
        completedChallenges: 0,
        currentStreak: 0,
      };
    } catch (fallbackError) {
      console.error('Error in fallback stats calculation:', fallbackError);
      return {
        activePlans: 0,
        completedChallenges: 0,
        currentStreak: 0,
      };
    }
  }
};

/**
 * Xóa training plan của user (chỉ user sở hữu mới có thể xóa)
 * @param utId - UserTraining ID (không phải trainingPlanId)
 */
export const deleteUserTraining = async (utId: number): Promise<void> => {
  try {
    const res = await client.delete(`/training-plans/user/${utId}`);
    
    if (res.data?.success) {
      console.log('✅ Training plan deleted successfully:', res.data.message);
    } else {
      throw new Error(res.data?.message || 'Failed to delete training plan');
    }
  } catch (error) {
    console.error('❌ Error deleting training plan:', error);
    throw error;
  }
};
