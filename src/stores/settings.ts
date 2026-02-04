// src/stores/settings.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { SmtpConfig } from '@/types';

interface SettingsState {
  smtp: SmtpConfig;
  isConfigured: boolean;
  setSmtp: (config: Partial<SmtpConfig>) => void;
  savePassword: (password: string) => Promise<void>;
  loadPassword: () => Promise<string>;
  clearSettings: () => void;
}

const defaultSmtp: SmtpConfig = {
  host: '',
  port: '587',
  security: 'tls',
  username: '',
  password: '',
  fromEmail: '',
  toEmail: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      smtp: defaultSmtp,
      isConfigured: false,

      setSmtp: (config) => {
        set((state) => {
          const newSmtp = { ...state.smtp, ...config };
          const isConfigured = Boolean(
            newSmtp.host &&
            newSmtp.port &&
            newSmtp.username &&
            newSmtp.fromEmail &&
            newSmtp.toEmail
          );
          return { smtp: newSmtp, isConfigured };
        });
      },

      savePassword: async (password) => {
        await SecureStore.setItemAsync('smtp_password', password);
        set((state) => ({
          smtp: { ...state.smtp, password: '••••••••' },
        }));
      },

      loadPassword: async () => {
        const password = await SecureStore.getItemAsync('smtp_password');
        return password || '';
      },

      clearSettings: () => {
        SecureStore.deleteItemAsync('smtp_password');
        set({ smtp: defaultSmtp, isConfigured: false });
      },
    }),
    {
      name: 'sms-mailer-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        smtp: { ...state.smtp, password: '' },
        isConfigured: state.isConfigured,
      }),
    }
  )
);
