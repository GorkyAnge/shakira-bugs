export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ChallengeStatus = 'PENDING' | 'ANNOUNCED' | 'SOLVED';
export type MessageKind = 'TEXT' | 'ALERT' | 'CELEBRATION' | 'SYSTEM';

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  difficultyLabel: string;
  points: number;
  file: string;
  fileUrl: string;
  status: ChallengeStatus;
  alert: string;
  announcedAt: string | null;
  solvedBy: string | null;
  solvedAt: string | null;
}

export interface Message {
  id: number;
  senderName: string;
  senderGithub: string | null;
  kind: MessageKind;
  content: string;
  challenge: Challenge | null;
  points: number | null;
  createdAt: string;
}

export interface Player {
  rank: number;
  githubUser: string;
  displayName: string;
  points: number;
  solvedCount: number;
}

export interface Me {
  githubUser: string;
  displayName: string;
}
