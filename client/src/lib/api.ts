import type { IChapter, IQuestionSet, IQuestion, IAttempt, IMistake, IAnalytics, IUserProgress, IVocabSentence, IProgressStats } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('ielts-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request<{ user: any }>('/auth/me'),
};

// Chapters
export const chaptersAPI = {
  list: () => request<{ chapters: IChapter[] }>('/chapters'),

  getBySlug: (slug: string) =>
    request<{ chapter: IChapter; progress: any }>(`/chapters/${slug}`),

  getQuestions: (slug: string, setId: string, mode: string) =>
    request<{ questionSet: any; questions: any[] }>(`/chapters/${slug}/questions/${setId}?mode=${mode}`),

  listWithProgress: () => request<{ chapters: any[] }>('/chapters/with-progress/list'),

  unlock: (id: string) =>
    request<{ success: boolean; chapter: string; alreadyUnlocked: boolean }>(`/chapters/${id}/unlock`, { method: 'POST' }),
};

// Attempts
export const attemptsAPI = {
  create: (data: any) =>
    request<{ attempt: any }>('/attempts', { method: 'POST', body: JSON.stringify(data) }),

  list: (page = 1, limit = 20) =>
    request<{ attempts: any[]; total: number }>(`/attempts?page=${page}&limit=${limit}`),

  getById: (id: string) => request<{ attempt: any }>(`/attempts/${id}`),

  getStats: () => request<{ summary: any; recentAttempts: any[]; topChapter: any }>('/attempts/stats'),
};

// Mistakes
export const mistakesAPI = {
  list: (chapterId?: string) =>
    request<{ mistakes: any[]; unreviewedCount: number }>(
      `/mistakes${chapterId ? `?chapterId=${chapterId}` : ''}`
    ),

  stats: () =>
    request<{ total: number; unreviewedCount: number; byChapter: any[] }>('/mistakes/stats'),

  review: (id: string) =>
    request<{ mistake: any }>(`/mistakes/${id}/review`, { method: 'POST' }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/mistakes/${id}`, { method: 'DELETE' }),
};

// Admin
export const adminAPI = {
  createChapter: (data: any) =>
    request<{ chapter: IChapter }>('/admin/chapters', { method: 'POST', body: JSON.stringify(data) }),

  updateChapter: (id: string, data: any) =>
    request<{ chapter: IChapter }>(`/admin/chapters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteChapter: (id: string) =>
    request<{ success: boolean }>(`/admin/chapters/${id}`, { method: 'DELETE' }),

  togglePublish: (id: string) =>
    request<{ chapter: IChapter }>(`/admin/chapters/${id}/publish`, { method: 'POST' }),
};

// Analytics
export const analyticsAPI = {
  trackVisit: (isNewUser: boolean) =>
    request<{ success: boolean }>('/analytics/visit', {
      method: 'POST',
      body: JSON.stringify({ isNewUser }),
    }),

  dashboard: () =>
    request<{
      summary: { totalUsers: number; totalAttempts: number; overallAvg: string; todayVisitors: number };
      dailyVisitors: { date: string; visitors: number; newUsers: number; returningUsers: number }[];
      chapterStats: { title: string; slug: string; difficulty: string; attempts: number; avgScorePercent: number; accuracy: number }[];
      userRanking: { name: string; email: string; role: string; attempts: number; totalCorrect: number; accuracy: number; bestScore: number }[];
    }>('/analytics/dashboard'),
};

// Progress
export const progressAPI = {
  get: (chapterId: string) =>
    request<{ progress: IUserProgress }>(`/progress/${chapterId}`),

  markCard: (chapterId: string, topic: string) =>
    request<{ progress: IUserProgress }>(`/progress/${chapterId}/card`, {
      method: 'POST',
      body: JSON.stringify({ topic }),
    }),

  savePractice: (chapterId: string, score: number) =>
    request<{ progress: IUserProgress; xpGain: number }>(`/progress/${chapterId}/practice`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    }),

  saveChallenge: (chapterId: string, score: number, totalQuestions: number) =>
    request<{ progress: IUserProgress; xpGain: number; stars: number }>(`/progress/${chapterId}/challenge`, {
      method: 'POST',
      body: JSON.stringify({ score, totalQuestions }),
    }),

  updateVocab: (chapterId: string, word: string, stage: string) =>
    request<{ progress: IUserProgress; xpGain: number }>(`/progress/${chapterId}/vocab`, {
      method: 'POST',
      body: JSON.stringify({ word, stage }),
    }),

  addSentence: (chapterId: string, word: string, sentence: string) =>
    request<{ sentence: IVocabSentence; xpGain: number }>(`/progress/${chapterId}/sentence`, {
      method: 'POST',
      body: JSON.stringify({ word, sentence }),
    }),

  getSentences: (chapterId: string, word?: string) =>
    request<{ sentences: IVocabSentence[] }>(`/progress/${chapterId}/sentences${word ? `?word=${word}` : ''}`),

  likeSentence: (sentenceId: string) =>
    request<{ sentence: IVocabSentence; liked: boolean }>(`/progress/sentences/${sentenceId}/like`, {
      method: 'POST',
    }),

  getReviewDue: () =>
    request<{ reviewDue: any[] }>('/progress/review-due'),

  completeReview: (chapterId: string, score: number) =>
    request<{ progress: IUserProgress }>(`/progress/review`, {
      method: 'POST',
      body: JSON.stringify({ chapterId, score }),
    }),

  getStats: () =>
    request<{ stats: IProgressStats }>('/progress/stats'),
};
