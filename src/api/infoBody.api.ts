import client from "./client";

export interface InformationBodyDTO {
  infoId?: number;
  userId: number;
  userName?: string;
  heightCm: number;
  weightKg: number;
  age: number;
  gender: string;
  bodyFatPct?: number;
  bmi?: number;
  goalId: number;
  goalName?: string;
  createdAt?: string;
}

export interface GoalDTO {
  id: number;
  name: string;
  description?: string;
  imageLink?: string;
}

export interface BodyAnalysisResult {
  bmi: number;
  bodyType: string;
  recommendedTrainingPlan?: {
    id: number;
    name: string;
    difficulty: string;
    duration: number;
    description: string;
  };
}

export const InfoBodyAPI = {
  /**
   * Get all body information records for a user
   */
  getByUserId(userId: number): Promise<{
    success: boolean;
    message: string;
    data: InformationBodyDTO[];
  }> {
    return client.get(`/admin/information-body/${userId}`);
  },

  /**
   * Create new body information record
   */
  create(data: Omit<InformationBodyDTO, 'infoId' | 'createdAt'>): Promise<{
    success: boolean;
    message: string;
    data?: InformationBodyDTO;
  }> {
    return client.post(`/admin/information-body`, data);
  },

  /**
   * Update body information record
   */
  update(infoId: number, data: Partial<InformationBodyDTO>): Promise<{
    success: boolean;
    message: string;
    data?: InformationBodyDTO;
  }> {
    return client.put(`/admin/information-body/${infoId}`, data);
  },

  /**
   * Get all available goals
   */
  getGoals(): Promise<{
    success: boolean;
    message: string;
    data: GoalDTO[];
  }> {
    return client.get(`/admin/goals`);
  },

  /**
   * Calculate BMI and body type
   */
  calculateBMI(heightCm: number, weightKg: number): { bmi: number; bodyType: string } {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    
    let bodyType = 'Normal';
    if (bmi < 18.5) {
      bodyType = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
      bodyType = 'Normal';
    } else if (bmi >= 25 && bmi < 30) {
      bodyType = 'Overweight';
    } else {
      bodyType = 'Obese';
    }
    
    return { bmi: Number(bmi.toFixed(2)), bodyType };
  }
};





