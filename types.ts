
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  nis?: string;
  nisn?: string;
  kelas?: string;
  tahun_ajaran?: string;
  nip?: string;
  created_at?: string;
  password?: string;
}

export interface QuestionGroup {
  id: number;
  group_code: string;
  group_name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes: number;
  extra_time_minutes: number;
  is_shuffled: number; 
  teacher_ids?: string[]; 
  target_classes?: string[]; 
  created_by?: string;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  last_started_at?: string;
}

export type QuestionType = 'single' | 'table' | 'multiple';
export type ScoringMode = 'partial' | 'all_or_nothing';

export interface Question {
  id: string;
  group_ids?: number[];
  subject: string;
  text: string;
  type: QuestionType;
  scoring_mode: ScoringMode; 
  points: number; 
  sort_order?: number; 
  target_time?: number; 
  mediaUrl?: string;
  tableOptions?: string[]; 
  options?: {
    id: string;
    text: string;
    points: number;
    mediaUrl?: string;
  }[];
  correctOptionId?: string; 
  correctOptionIds?: string[]; 
  statements?: {
    id: string;
    text: string;
    points: number; 
    correctAnswer: string;
    mediaUrl?: string;
  }[];
  explanation?: string;
  created_by?: string;
  creator_name?: string;
}

export interface ExamSession {
  id: string;
  studentId: string;
  groupId?: number;
  group_name?: string;
  startTime: number;
  endTime?: number | string;
  score?: number;
  totalPointsEarned?: number;
  maxPossiblePoints?: number;
  answers: Record<string, any>; 
  uncertainAnswers: string[]; 
  shuffledQuestions?: Question[];
}

export interface Score {
  id: string;
  studentId: string;
  groupId: number;
  group_name: string;
  score: number;
  answers_json: string;
  uncertain_json: string;
  durationMs: number;
  createdAt: string;
  status: 'active' | 'reset';
}
