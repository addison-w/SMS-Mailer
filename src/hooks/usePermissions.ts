// src/hooks/usePermissions.ts
import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { checkSmsPermissions, requestSmsPermissions } from '@/services/sms-listener';
import type { PermissionStatus } from '@/types';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    sms: false,
    notifications: false,
    batteryOptimization: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check notification permission
      const { status: notifStatus } = await Notifications.getPermissionsAsync();

      // Check SMS permissions
      const smsStatus = await checkSmsPermissions();
      const smsGranted = smsStatus.hasReadSmsPermission && smsStatus.hasReceiveSmsPermission;

      // Battery optimization - we can't easily check this, assume false
      // User needs to manually verify
      const batteryOptDisabled = false;

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

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setPermissions((prev) => ({ ...prev, notifications: true }));
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const requestSmsPermission = async () => {
    const granted = await requestSmsPermissions();
    if (granted) {
      setPermissions((prev) => ({ ...prev, sms: true }));
    } else {
      Alert.alert(
        'SMS Permission Required',
        'Please grant SMS permissions to forward messages.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const requestBatteryOptimization = async () => {
    if (Platform.OS !== 'android') return;

    Alert.alert(
      'Battery Optimization',
      'To keep SMS Mailer running reliably, please disable battery optimization for this app in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: async () => {
            try {
              await Linking.openSettings();
              // Assume user enabled it after opening settings
              setPermissions((prev) => ({ ...prev, batteryOptimization: true }));
            } catch (error) {
              Alert.alert('Error', 'Unable to open settings');
            }
          }
        },
      ]
    );
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
