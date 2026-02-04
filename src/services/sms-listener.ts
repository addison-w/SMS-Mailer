// src/services/sms-listener.ts
import {
  checkIfHasSMSPermission,
  requestReadSMSPermission,
  startReadSMS,
} from '@maniac-tech/react-native-expo-read-sms';
import type { SmsMessage } from '@/types';

export interface SmsPermissionStatus {
  hasReceiveSmsPermission: boolean;
  hasReadSmsPermission: boolean;
}

export async function checkSmsPermissions(): Promise<SmsPermissionStatus> {
  try {
    const result = await checkIfHasSMSPermission();
    return result;
  } catch (error) {
    console.error('Error checking SMS permissions:', error);
    return {
      hasReceiveSmsPermission: false,
      hasReadSmsPermission: false,
    };
  }
}

export async function requestSmsPermissions(): Promise<boolean> {
  try {
    const granted = await requestReadSMSPermission();
    return granted;
  } catch (error) {
    console.error('Error requesting SMS permissions:', error);
    return false;
  }
}

let smsListenerActive = false;

export function startSmsListener(
  onSmsReceived: (sms: SmsMessage) => void
): void {
  if (smsListenerActive) {
    console.log('SMS listener already active');
    return;
  }

  smsListenerActive = true;

  startReadSMS(
    (status: string, smsData: string) => {
      try {
        // smsData format: "[+919999999999, this is a sample message body]"
        const match = smsData.match(/\[(.+?),\s*(.+)\]/);
        if (match) {
          const sender = match[1];
          const body = match[2];

          const sms: SmsMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender,
            body,
            timestamp: Date.now(),
            simSlot: 0, // TODO: Get actual SIM slot if available
            receiverNumber: 'Unknown', // TODO: Get actual receiver number
          };

          onSmsReceived(sms);
        }
      } catch (error) {
        console.error('Error parsing SMS:', error);
      }
    },
    (error: string) => {
      console.error('SMS listener error:', error);
      smsListenerActive = false;
    }
  );
}

export function stopSmsListener(): void {
  smsListenerActive = false;
  // Note: The library doesn't provide a stop method
  // The listener will be cleaned up when the app closes
}
