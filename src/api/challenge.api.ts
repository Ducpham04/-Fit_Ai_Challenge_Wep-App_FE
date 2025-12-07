import client from "./client";

export interface ChallengeResponseDTO {
  id: number;
  title: string;
  description: string;
  difficult: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'COMPLETED';
  reward?: string;
  videos: string[];
  participantsCount: number;
  participants?: Array<{
    userId: number;
    userName: string;
    profileImage?: string;
    joinedAt: string;
    progress?: number;
  }>;
  goal?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface JoinChallengeRequest {
  userId: number;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const ChallengeAPI = {
  /**
   * Get all challenges with pagination and filters
   * @param params - Query parameters
   * @returns Promise with paginated challenges
   */
  getChallenges(params?: {
    status?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    content: ChallengeResponseDTO[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    return client.get("/challenges", { params });
  },

  /**
   * Get challenge by ID with participants list
   * @param id - Challenge ID
   * @returns Promise with challenge details
   */
  getChallengeById(id: string | number): Promise<ChallengeResponseDTO> {
    return client.get(`/challenges/${id}`);
  },

  /**
   * Join a challenge
   * @param id - Challenge ID
   * @param userId - User ID
   * @returns Promise with join confirmation
   */
  joinChallenge(id: string | number, userId: number): Promise<NotificationResponse> {
    return client.post(`/challenges/${id}/join`, { userId });
  }
};

