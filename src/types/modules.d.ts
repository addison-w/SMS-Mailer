// Type declarations for external modules without TypeScript support

declare module '@maniac-tech/react-native-expo-read-sms' {
  export interface SmsPermissionResult {
    hasReceiveSmsPermission: boolean;
    hasReadSmsPermission: boolean;
  }

  export function requestReadSMSPermission(): Promise<boolean>;
  export function checkIfHasSMSPermission(): Promise<SmsPermissionResult>;
  export function startReadSMS(
    onSuccess: (status: string, smsData: string) => void,
    onError: (error: string) => void
  ): void;
}
