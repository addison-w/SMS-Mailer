// src/app/(tabs)/index.tsx
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { Card, Button } from '@/components/ui';
import { PermissionCard } from '@/components/features/PermissionCard';
import { usePermissions } from '@/hooks/usePermissions';
import { useServiceStore } from '@/stores/service';
import { useHistoryStore } from '@/stores/history';
import { useSettingsStore } from '@/stores/settings';
import { startBackgroundService, stopBackgroundService } from '@/services/background';

export default function StatusScreen() {
  const router = useRouter();
  const { isRunning, setRunning } = useServiceStore();
  const { isConfigured } = useSettingsStore();
  const { getPending, getFailed } = useHistoryStore();
  const {
    permissions,
    isLoading,
    requestSmsPermission,
    requestNotifications,
    requestBatteryOptimization,
  } = usePermissions();

  const pendingCount = getPending().length;
  const failedCount = getFailed().length;

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

  const allPermissionsGranted =
    permissions.sms && permissions.notifications && permissions.batteryOptimization;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Service Status */}
        <Card>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>SERVICE STATUS</Text>
            <View style={[styles.statusBadge, isRunning ? styles.statusRunning : styles.statusStopped]}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusText}>{isRunning ? 'Running' : 'Stopped'}</Text>
            </View>
          </View>
          <Button
            title={isRunning ? 'Stop Service' : (isConfigured ? 'Start Service' : 'Configure Settings')}
            onPress={handleToggleService}
            variant={isRunning ? 'danger' : 'primary'}
            disabled={!allPermissionsGranted && isConfigured}
          />
          {!isConfigured && (
            <Text style={styles.hint}>Configure SMTP settings to start the service</Text>
          )}
          {isConfigured && !allPermissionsGranted && (
            <Text style={styles.hint}>Grant all permissions to start the service</Text>
          )}
        </Card>

        {/* Permissions */}
        <Text style={styles.sectionTitle}>PERMISSIONS</Text>

        <PermissionCard
          title="SMS Permission"
          granted={permissions.sms}
          onRequestPermission={requestSmsPermission}
          actionLabel="Grant"
        />

        <PermissionCard
          title="Notification Access"
          granted={permissions.notifications}
          onRequestPermission={requestNotifications}
          actionLabel="Enable"
        />

        <PermissionCard
          title="Battery Optimization"
          granted={permissions.batteryOptimization}
          onRequestPermission={requestBatteryOptimization}
          actionLabel="Disable"
        />

        {/* Quick Stats */}
        <Card title="QUICK STATS" style={styles.statsCard}>
          <Pressable style={styles.statsRow} onPress={() => router.push('/history')}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, failedCount > 0 && styles.statError]}>
                {failedCount}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          </Pressable>
        </Card>
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
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusRunning: {
    backgroundColor: colors.success + '20',
  },
  statusStopped: {
    backgroundColor: colors.textMuted + '20',
  },
  statusDot: {
    fontSize: 10,
    color: colors.success,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
  },
  statsCard: {
    marginTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statError: {
    color: colors.error,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
