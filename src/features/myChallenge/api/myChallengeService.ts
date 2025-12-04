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
 */
export const getCurrentTrainingPlans = async (userId: string): Promise<UserCurrentTrainingPlan[]> => {
  console.log("User Id", userId)
  const res = await client.get(`/user/training/${userId}`);
  
  return res.data.data; // trả về mảng training plan
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
