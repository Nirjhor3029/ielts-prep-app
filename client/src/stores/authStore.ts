import { create } from 'zustand';
import { authAPI } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  streak: number;
  totalCorrect: number;
  totalAttempts: number;
  xp: number;
  level: number;
  streakFreezes: number;
  achievements: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('ielts-token'),
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem('ielts-token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  register: async (name: string, email: string, password: string) => {
    const data = await authAPI.register({ name, email, password });
    localStorage.setItem('ielts-token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('ielts-token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const data = await authAPI.me();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('ielts-token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('ielts-token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    await useAuthStore.getState().fetchMe();
  },
}));
