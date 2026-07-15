export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  streak: number;
  totalCorrect: number;
  totalAttempts: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = 'mcq' | 'fill-blank' | 'error-identification' | 'sentence-correction';

export interface IQuestion {
  _id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  justification: string;
}

export interface IQuestionSet {
  _id: string;
  type: 'practice' | 'test';
  title: string;
  timeLimitMinutes?: number;
  questions: IQuestion[];
}

export interface IChapter {
  _id: string;
  module: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing';
  title: string;
  slug: string;
  order: number;
  description: string;
  readTimeMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes: string;
  icon: string;
  questionSets: IQuestionSet[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAttemptAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface IAttempt {
  _id: string;
  userId: string;
  chapterId: string;
  questionSetId: string;
  mode: 'practice' | 'test';
  answers: IAttemptAnswer[];
  score: number;
  totalQuestions: number;
  startedAt: string;
  completedAt: string;
  createdAt: string;
}

export interface IMistake {
  _id: string;
  userId: string;
  chapterId: string;
  questionSetId: string;
  questionId: string;
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
  justification: string;
  reviewCount: number;
  lastReviewedAt?: string;
  createdAt: string;
}

export interface IAnalytics {
  _id: string;
  date: string;
  uniqueVisitors: number;
  newUsers: number;
  returningUsers: number;
  totalAttempts: number;
  averageScore: number;
  topChapters: { chapterId: string; count: number }[];
}

export interface ChapterWithProgress extends IChapter {
  isLocked: boolean;
  lastScore?: number;
  lastAttemptDate?: string;
  completedAttempts: number;
  totalQuestionsInSets: number;
}
