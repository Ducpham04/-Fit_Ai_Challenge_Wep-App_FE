export interface ChallengeDto {
  id: string;
  title: string;
  description: string;
  video?: string[]; // Array of video URLs
  difficulty: ChallengeDifficulty;
  participants: number;
  reward: string;
  status: ChallengeStatus;
  createdAt: string;
  updatedAt: string;
}

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ChallengeStatus = 'Active' | 'Upcoming' | 'Completed';

export interface CreateChallengeRequest {
  title: string;
  description: string;
  video?: string[];
  difficulty: ChallengeDifficulty;
  reward: string;
}

export interface UpdateChallengeRequest extends Partial<CreateChallengeRequest> {
  status?: ChallengeStatus;
}

export interface JoinChallengeRequest {
  challengeId: string;
  userId: string;
}

export interface ChallengeParticipantDto {
  userId: string;
  userName: string;
  joinedAt: string;
  progress: number;
  completed: boolean;
}
