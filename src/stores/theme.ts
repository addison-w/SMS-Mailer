// src/stores/theme.ts
// Theme state management with persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | 'system';

interface ThemeState {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: 'dark', // Default to dark to match current app
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
    }),
    {
      name: 'sms-mailer-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
