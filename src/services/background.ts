// src/services/background.ts
import BackgroundService from 'react-native-background-actions';
import * as Notifications from 'expo-notifications';
import { startSmsListener, stopSmsListener } from './sms-listener';
import { sendEmail } from './email-sender';
import { useHistoryStore } from '@/stores/history';
import { useSettingsStore } from '@/stores/settings';
import { useServiceStore } from '@/stores/service';
import type { SmsMessage } from '@/types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const NOTIFICATION_CHANNEL = 'sms-mailer-service';

async function setupNotifications() {
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
    name: 'SMS Mailer Service',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0],
    lightColor: '#3B82F6',
  });
}

async function showFailureNotification(failedCount: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SMS Mailer - Delivery Failed',
      body: `${failedCount} message(s) failed to forward. Tap to view.`,
      data: { screen: 'history' },
    },
    trigger: null,
  });
}

async function processQueue() {
  const historyStore = useHistoryStore.getState();
  const settingsStore = useSettingsStore.getState();

  const nextItem = historyStore.getNextRetry();
  if (!nextItem) return;

  const password = await settingsStore.loadPassword();
  const result = await sendEmail(settingsStore.smtp, password, nextItem.sms);

  if (result.success) {
    historyStore.markAsForwarded(nextItem.id);
  } else {
    historyStore.markAsFailed(nextItem.id, result.error || 'Unknown error');

    // Check if this was the final retry
    const updatedItem = historyStore.queue.find((i) => i.id === nextItem.id);
    if (updatedItem?.status === 'failed') {
      const failedCount = historyStore.getFailed().length;
      await showFailureNotification(failedCount);
    }
  }
}

async function backgroundTask(taskData?: { delay: number }) {
  const delay = taskData?.delay || 5000;

  // Set up SMS listener
  startSmsListener((sms: SmsMessage) => {
    const historyStore = useHistoryStore.getState();
    historyStore.addToQueue(sms);
  });

  // Main loop
  while (BackgroundService.isRunning()) {
    await processQueue();
    await sleep(delay);
  }

  stopSmsListener();
}

const backgroundOptions = {
  taskName: 'SMS Mailer',
  taskTitle: 'SMS Mailer Active',
  taskDesc: 'Listening for incoming SMS messages',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#3B82F6',
  linkingURI: 'smsmailer://status',
  parameters: {
    delay: 5000,
  },
};

export async function startBackgroundService(): Promise<boolean> {
  try {
    await setupNotifications();
    await BackgroundService.start(backgroundTask, backgroundOptions);
    useServiceStore.getState().setRunning(true);
    return true;
  } catch (error) {
    console.error('Failed to start background service:', error);
    return false;
  }
}

export async function stopBackgroundService(): Promise<void> {
  try {
    await BackgroundService.stop();
    useServiceStore.getState().setRunning(false);
  } catch (error) {
    console.error('Failed to stop background service:', error);
  }
}

export function isBackgroundServiceRunning(): boolean {
  return BackgroundService.isRunning();
}
