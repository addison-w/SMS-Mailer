// src/stores/history.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QueueItem, SmsMessage } from '@/types';

interface HistoryState {
  totalForwarded: number;
  queue: QueueItem[];

  addToQueue: (sms: SmsMessage) => void;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
  removeFromQueue: (id: string) => void;
  markAsForwarded: (id: string) => void;
  markAsFailed: (id: string, error: string) => void;
  retryItem: (id: string) => void;
  clearFailed: () => void;
  getPending: () => QueueItem[];
  getFailed: () => QueueItem[];
  getNextRetry: () => QueueItem | null;
}

const RETRY_DELAYS = [0, 30000, 120000]; // immediate, 30s, 2min
const MAX_ATTEMPTS = 3;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      totalForwarded: 0,
      queue: [],

      addToQueue: (sms) => {
        const item: QueueItem = {
          id: sms.id,
          sms,
          status: 'pending',
          attempts: 0,
          lastAttempt: 0,
          nextRetry: Date.now(),
        };
        set((state) => ({ queue: [...state.queue, item] }));
      },

      updateQueueItem: (id, updates) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        }));
      },

      markAsForwarded: (id) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
          totalForwarded: state.totalForwarded + 1,
        }));
      },

      markAsFailed: (id, error) => {
        set((state) => ({
          queue: state.queue.map((item) => {
            if (item.id !== id) return item;

            const attempts = item.attempts + 1;
            if (attempts >= MAX_ATTEMPTS) {
              return { ...item, status: 'failed', attempts, error };
            }

            const nextRetry = Date.now() + RETRY_DELAYS[attempts];
            return { ...item, attempts, lastAttempt: Date.now(), nextRetry, error };
          }),
        }));
      },

      retryItem: (id) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? { ...item, status: 'pending', attempts: 0, nextRetry: Date.now(), error: undefined }
              : item
          ),
        }));
      },

      clearFailed: () => {
        set((state) => ({
          queue: state.queue.filter((item) => item.status !== 'failed'),
        }));
      },

      getPending: () => get().queue.filter((item) => item.status === 'pending'),

      getFailed: () => get().queue.filter((item) => item.status === 'failed'),

      getNextRetry: () => {
        const pending = get().getPending();
        const ready = pending.filter((item) => item.nextRetry <= Date.now());
        return ready.sort((a, b) => a.nextRetry - b.nextRetry)[0] || null;
      },
    }),
    {
      name: 'sms-mailer-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
