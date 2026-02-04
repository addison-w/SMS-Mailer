// Type declarations for external modules without TypeScript support

declare module 'react-native-sim-cards-manager' {
  interface SimCardRationale {
    title: string;
    message: string;
    buttonNeutral: string;
    buttonNegative: string;
    buttonPositive: string;
  }

  interface SimCard {
    carrierName?: string;
    displayName?: string;
    isoCountryCode?: string;
    mobileCountryCode?: string;
    mobileNetworkCode?: string;
    isNetworkRoaming?: boolean;
    isDataRoaming?: boolean;
    simSlotIndex?: number;
    phoneNumber?: string;
    simSerialNumber?: string;
    subscriptionId?: number;
  }

  const SimCardsManagerModule: {
    getSimCards(rationale?: SimCardRationale): Promise<SimCard[]>;
    getSimCardsNative(): Promise<SimCard[]>;
    isEsimSupported(): Promise<boolean>;
  };

  export default SimCardsManagerModule;
}

declare module 'react-native-battery-optimization-check' {
  export function BatteryOptEnabled(): Promise<boolean>;
  export function OpenOptimizationSettings(): void;
  export function RequestDisableOptimization(): Promise<void>;
}

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
