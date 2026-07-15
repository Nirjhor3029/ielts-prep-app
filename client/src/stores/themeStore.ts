import { create } from 'zustand';

interface ThemeState {
  mode: 'light' | 'dark';
  toggle: () => void;
  init: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',

  init: () => {
    const saved = localStorage.getItem('ielts-theme') as 'light' | 'dark' | null;
    if (saved) {
      set({ mode: saved });
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      set({ mode: prefersDark ? 'dark' : 'light' });
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  },

  toggle: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    set({ mode: next });
    localStorage.setItem('ielts-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  },
}));
