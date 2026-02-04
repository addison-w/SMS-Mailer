// src/hooks/usePermissions.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { BatteryOptEnabled, RequestDisableOptimization } from 'react-native-battery-optimization-check';
import { checkSmsPermissions, requestSmsPermissions } from '@/services/sms-listener';
import type { PermissionStatus } from '@/types';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    sms: false,
    notifications: false,
    batteryOptimization: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check notification permission
      const { status: notifStatus } = await Notifications.getPermissionsAsync();

      // Check SMS permissions
      const smsStatus = await checkSmsPermissions();
      const smsGranted = smsStatus.hasReadSmsPermission && smsStatus.hasReceiveSmsPermission;

      // Check battery optimization status (Android only)
      // BatteryOptEnabled returns true if optimization IS enabled (which is bad for us)
      // We want batteryOptimization=true when optimization is DISABLED
      let batteryOptDisabled = false;
      if (Platform.OS === 'android') {
        try {
          const isOptEnabled = await BatteryOptEnabled();
          batteryOptDisabled = !isOptEnabled; // We want it disabled
        } catch (error) {
          console.error('Error checking battery optimization:', error);
          batteryOptDisabled = false;
        }
      }

      setPermissions({
        sms: smsGranted,
        notifications: notifStatus === 'granted',
        batteryOptimization: batteryOptDisabled,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Re-check permissions when app comes back to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground, re-check permissions
        checkPermissions();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [checkPermissions]);

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setPermissions((prev) => ({ ...prev, notifications: true }));
    }
    // Re-check to get accurate state
    await checkPermissions();
  };

  const requestSmsPermission = async () => {
    await requestSmsPermissions();
    // Re-check to get accurate state
    await checkPermissions();
  };

  const requestBatteryOptimization = async () => {
    if (Platform.OS !== 'android') return;

    try {
      // This shows a system dialog to disable battery optimization
      await RequestDisableOptimization();
    } catch (error) {
      console.error('Error requesting battery optimization:', error);
    }
    // Status will be re-checked when app returns to foreground
  };

  return {
    permissions,
    isLoading,
    checkPermissions,
    requestNotifications,
    requestSmsPermission,
    requestBatteryOptimization,
  };
}
