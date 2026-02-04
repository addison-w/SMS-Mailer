// src/app/(tabs)/index.tsx
import { View, StyleSheet, ScrollView, Pressable, Alert, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Button } from '@/components/ui';
import { PermissionCard } from '@/components/features/PermissionCard';
import { usePermissions } from '@/hooks/usePermissions';
import { useServiceStore } from '@/stores/service';
import { useHistoryStore } from '@/stores/history';
import { useSettingsStore } from '@/stores/settings';
import { startBackgroundService, stopBackgroundService } from '@/services/background';

// M3 semantic color for success state (green)
const SUCCESS_COLOR = '#22C55E';
const WARNING_COLOR = '#F59E0B';

export default function StatusScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { isRunning } = useServiceStore();
  const { isConfigured } = useSettingsStore();
  const { getPending, getFailed, totalForwarded } = useHistoryStore();
  const {
    permissions,
    requestSmsPermission,
    requestNotifications,
    requestBatteryOptimization,
    requestBackgroundActivity,
  } = usePermissions();

  const pendingCount = getPending().length;
  const failedCount = getFailed().length;

  // Animated pulse for running indicator
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const statsScale = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRunning) {
      pulseAnimation.current = Animated.loop(
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.4,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.current.start();
    } else {
      if (pulseAnimation.current) {
        pulseAnimation.current.stop();
      }
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    return () => {
      if (pulseAnimation.current) {
        pulseAnimation.current.stop();
      }
    };
  }, [isRunning]);

  const handleToggleService = async () => {
    if (!isConfigured) {
      router.push('/settings');
      return;
    }

    if (isRunning) {
      await stopBackgroundService();
    } else {
      const started = await startBackgroundService();
      if (!started) {
        Alert.alert('Error', 'Failed to start the service. Please check permissions.');
      }
    }
  };

  const handleStatsPress = () => {
    Animated.sequence([
      Animated.spring(statsScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(statsScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    router.push('/history');
  };

  const allPermissionsGranted =
    permissions.sms && permissions.notifications && permissions.batteryOptimization && permissions.backgroundActivity;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Hero Service Status */}
        <Card delay={0}>
          <View style={styles.heroContainer}>
            <View style={styles.statusIndicatorContainer}>
              {isRunning && (
                <Animated.View
                  style={[
                    styles.pulse,
                    { backgroundColor: SUCCESS_COLOR, transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                  ]}
                />
              )}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isRunning ? SUCCESS_COLOR : theme.colors.outlineVariant },
                ]}
              />
            </View>
            <View style={styles.heroText}>
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                {isRunning ? 'Service Active' : 'Service Stopped'}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {isRunning
                  ? 'Forwarding SMS to email'
                  : isConfigured
                    ? 'Tap below to start forwarding'
                    : 'Configure settings to begin'}
              </Text>
            </View>
          </View>
          <Button
            title={isRunning ? 'Stop Service' : (isConfigured ? 'Start Service' : 'Configure Settings')}
            onPress={handleToggleService}
            variant={isRunning ? 'danger' : 'primary'}
            disabled={!allPermissionsGranted && isConfigured}
            accessibilityLabel={
              isRunning
                ? 'Stop SMS forwarding service'
                : isConfigured
                  ? 'Start SMS forwarding service'
                  : 'Go to settings to configure SMTP'
            }
          />
          {isConfigured && !allPermissionsGranted && (
            <Text
              variant="bodySmall"
              style={[styles.hint, { color: WARNING_COLOR }]}
            >
              Grant all permissions below to start
            </Text>
          )}
        </Card>

        {/* Quick Stats */}
        <Pressable
          onPress={handleStatsPress}
          accessibilityRole="button"
          accessibilityLabel={`View history. ${totalForwarded} forwarded, ${pendingCount} pending, ${failedCount} failed`}
        >
          <Animated.View style={[styles.statsCard, { transform: [{ scale: statsScale }] }]}>
            <Card delay={100}>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text variant="displaySmall" style={{ color: theme.colors.onSurface }}>
                    {totalForwarded}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    FORWARDED
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
                <View style={styles.statItem}>
                  <Text variant="displaySmall" style={{ color: WARNING_COLOR }}>
                    {pendingCount}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    PENDING
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
                <View style={styles.statItem}>
                  <Text
                    variant="displaySmall"
                    style={{ color: failedCount > 0 ? theme.colors.error : theme.colors.onSurface }}
                  >
                    {failedCount}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    FAILED
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        </Pressable>

        {/* Permissions */}
        <Text
          variant="labelMedium"
          style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
        >
          PERMISSIONS
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Required for reliable SMS forwarding
        </Text>

        <PermissionCard
          title="SMS Access"
          granted={permissions.sms}
          onRequestPermission={requestSmsPermission}
          actionLabel="Grant"
          delay={200}
        />

        <PermissionCard
          title="Notifications"
          granted={permissions.notifications}
          onRequestPermission={requestNotifications}
          actionLabel="Enable"
          delay={250}
        />

        <PermissionCard
          title="Battery Optimization"
          granted={permissions.batteryOptimization}
          onRequestPermission={requestBatteryOptimization}
          actionLabel="Disable"
          delay={300}
        />

        <PermissionCard
          title="Background Activity"
          granted={permissions.backgroundActivity}
          onRequestPermission={requestBackgroundActivity}
          actionLabel="Allow"
          delay={350}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicatorContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  hint: {
    textAlign: 'center',
    marginTop: 12,
  },
  statsCard: {
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  sectionTitle: {
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 16,
  },
});
