// src/hooks/usePermissions.ts
import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { PermissionStatus } from '@/types';

// Note: SMS permissions need to be checked via native module
// This is a simplified version - full implementation requires native code

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

      // SMS permissions will be checked via native module
      // For now, we'll set a placeholder
      const smsGranted = false; // TODO: Check via @maniac-tech/react-native-expo-read-sms

      // Battery optimization - Android only
      const batteryOptDisabled = false; // TODO: Check via native module

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
    // TODO: Implement via @maniac-tech/react-native-expo-read-sms
    // For now, direct to settings
    Alert.alert(
      'SMS Permission Required',
      'Please grant SMS permissions in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const requestBatteryOptimization = async () => {
    if (Platform.OS !== 'android') return;

    // Open battery optimization settings
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert('Error', 'Unable to open settings');
    }
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
