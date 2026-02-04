// src/app/(tabs)/index.tsx
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '@/theme/colors';
import { Card, Button } from '@/components/ui';
import { PermissionCard } from '@/components/features/PermissionCard';
import { usePermissions } from '@/hooks/usePermissions';
import { useServiceStore } from '@/stores/service';
import { useHistoryStore } from '@/stores/history';
import { useSettingsStore } from '@/stores/settings';
import { startBackgroundService, stopBackgroundService } from '@/services/background';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function StatusScreen() {
  const router = useRouter();
  const { isRunning, setRunning } = useServiceStore();
  const { isConfigured } = useSettingsStore();
  const { getPending, getFailed, totalForwarded } = useHistoryStore();
  const {
    permissions,
    isLoading,
    requestSmsPermission,
    requestNotifications,
    requestBatteryOptimization,
  } = usePermissions();

  const pendingCount = getPending().length;
  const failedCount = getFailed().length;

  // Animated pulse for running indicator
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const statsScale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      pulseScale.value = withRepeat(
        withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1);
      pulseOpacity.value = withTiming(0);
    }
  }, [isRunning]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statsScale.value }],
  }));

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
    statsScale.value = withSpring(0.95, { damping: 15 }, () => {
      statsScale.value = withSpring(1);
    });
    router.push('/history');
  };

  const allPermissionsGranted =
    permissions.sms && permissions.notifications && permissions.batteryOptimization;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Hero Service Status */}
        <Card delay={0}>
          <View style={styles.heroContainer}>
            <View style={styles.statusIndicatorContainer}>
              {isRunning && (
                <Animated.View style={[styles.pulse, pulseStyle]} />
              )}
              <View style={[styles.statusDot, isRunning ? styles.dotRunning : styles.dotStopped]} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>
                {isRunning ? 'Service Active' : 'Service Stopped'}
              </Text>
              <Text style={styles.heroSubtitle}>
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
          />
          {isConfigured && !allPermissionsGranted && (
            <Text style={styles.hint}>Grant all permissions below to start</Text>
          )}
        </Card>

        {/* Quick Stats */}
        <AnimatedPressable onPress={handleStatsPress} style={statsAnimatedStyle}>
          <Card delay={100}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalForwarded}</Text>
                <Text style={styles.statLabel}>Forwarded</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.statPending]}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, failedCount > 0 && styles.statError]}>
                  {failedCount}
                </Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
            </View>
          </Card>
        </AnimatedPressable>

        {/* Permissions */}
        <Text style={styles.sectionTitle}>PERMISSIONS</Text>
        <Text style={styles.sectionSubtitle}>Required for reliable SMS forwarding</Text>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.success,
  },
  statusDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dotRunning: {
    backgroundColor: colors.success,
  },
  dotStopped: {
    backgroundColor: colors.textMuted,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    color: colors.warning,
    textAlign: 'center',
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
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statPending: {
    color: colors.warning,
  },
  statError: {
    color: colors.error,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
