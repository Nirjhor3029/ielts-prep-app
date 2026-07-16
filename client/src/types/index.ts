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
  xp: number;
  level: number;
  lastStudyDate?: string;
  streakFreezes: number;
  achievements: string[];
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

export interface IVocabItem {
  _id: string;
  word: string;
  meaning: string;
  example: string;
  partOfSpeech: string;
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
  subTopics: string[];
  vocab: IVocabItem[];
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
  isManuallyUnlocked: boolean;
  lastScore?: string;
  lastAttemptDate?: string;
  completedAttempts: number;
}

export interface IUserProgress {
  _id: string;
  userId: string;
  chapterId: string;
  cardsRead: string[];
  practiceScore: number;
  practiceCompleted: boolean;
  challengeScore: number;
  challengeCompleted: boolean;
  stars: number;
  vocabStagesCompleted: { word: string; stages: string[] }[];
  vocabSentences: { word: string; sentence: string; createdAt: string }[];
  totalTimeSpent: number;
  lastStudiedAt?: string;
  nextReviewAt?: string;
  reviewInterval: number;
  reviewCount: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  masteredAt?: string;
}

export interface IVocabSentence {
  _id: string;
  userId: { _id: string; name: string; avatarUrl?: string } | string;
  chapterId: string;
  word: string;
  sentence: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export interface IProgressStats {
  totalChaptersStarted: number;
  totalChaptersMastered: number;
  averageChallengeScore: number;
  totalStars: number;
  totalTimeSpent: number;
  xp: number;
  level: number;
  streak: number;
  streakFreezes: number;
  achievements: string[];
}
