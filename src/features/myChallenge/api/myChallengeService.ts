// services/myChallengeService.ts
import client from '../../../api/client'; // axios instance đã config baseURL và auth
import { UserCurrentTrainingPlan, TrainingPlanDetail, DayChallenges, Challenge, TrainingPlanDetailDTO } from '../types/myChallenge.type';

/**
 * Transform Backend DTO to Frontend Challenge type
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
  const res = await client.get(`/api/user/training/${userId}`);
  
  // Backend returns: { success: true, message: "...", data: UserTrainingDTO[] }
  const userTrainingDTOs = res.data?.data || [];
  
  // Map backend DTO to frontend type
  const mappedPlans: UserCurrentTrainingPlan[] = userTrainingDTOs.map((dto: any) => {
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
    
    return {
      id: dto.id, // utId (UserTraining ID)
      trainingPlanId: dto.trainingPlanId || dto.id, // Fallback to id if trainingPlanId not available
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
  });
  
  return mappedPlans;
};

/**
 * Lấy chi tiết một training plan theo planId
 * Maps BE response to FE structure with day-based organization
 */
export const getTrainingPlanDetail = async (trainingPlanId: number): Promise<TrainingPlanDetail> => {
  try {
    const res = await client.get(`/admin/training-plan-details/${trainingPlanId}`);

    // Handle response format: { success, message, data: TrainingPlanDetailDTO[] }
    const dtoArray: TrainingPlanDetailDTO[] = res.data.data || [];
    
    if (dtoArray.length === 0) {
      throw new Error('No training plan details found');
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
      id: firstDto.trainingPlanId.toString(),
      planName: firstDto.trainingPlanTitle,
      description: 'Training Plan Description',
      duration: `${totalDays} days`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      difficulty: difficultyMap[firstDto.challenge.difficult] || 'Intermediate',
      totalDays,
      progressPercentage,
      dayChallenges,
      userId: '',
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
  const res = await client.patch(`/api/user/training/${trainingPlanId}/challenge/${challengeId}/status`, {
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
