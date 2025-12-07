export interface Challenge {
  id: string;
  title: string;
  description: string;
  video?: string[]; // Array of video URLs
  difficulty: 'Easy' | 'Medium' | 'Hard';
  participants: number;
  reward: string;
  status: 'Active' | 'Upcoming' | 'Completed';
}

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ChallengeStatus = 'Active' | 'Upcoming' | 'Completed';
