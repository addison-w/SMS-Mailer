// src/stores/service.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServiceState {
  isRunning: boolean;
  startedAt: number | null;
  setRunning: (running: boolean) => void;
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set) => ({
      isRunning: false,
      startedAt: null,

      setRunning: (running) => {
        set({
          isRunning: running,
          startedAt: running ? Date.now() : null,
        });
      },
    }),
    {
      name: 'sms-mailer-service',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
