// src/app/(tabs)/history.tsx
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Card, Button } from '@/components/ui';
import { QueueItemCard } from '@/components/features/QueueItemCard';
import { useHistoryStore } from '@/stores/history';

export default function HistoryScreen() {
  const {
    totalForwarded,
    getPending,
    getFailed,
    retryItem,
    removeFromQueue,
    clearFailed,
  } = useHistoryStore();

  const pending = getPending();
  const failed = getFailed();
  const hasItems = pending.length > 0 || failed.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {!hasItems ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySubtitle}>
              No pending or failed messages
            </Text>
            <Text style={styles.successCount}>
              {totalForwarded} forwarded successfully
            </Text>
          </View>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>PENDING ({pending.length})</Text>
                {pending.map((item) => (
                  <QueueItemCard key={item.id} item={item} />
                ))}
              </>
            )}

            {failed.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>FAILED ({failed.length})</Text>
                {failed.map((item) => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    onRetry={() => retryItem(item.id)}
                    onDismiss={() => removeFromQueue(item.id)}
                  />
                ))}
                <Button
                  title="Clear All Failed"
                  onPress={clearFailed}
                  variant="secondary"
                  style={styles.clearButton}
                />
              </>
            )}

            <View style={styles.divider} />
            <Text style={styles.successText}>
              ✓ {totalForwarded} messages forwarded successfully
            </Text>
          </>
        )}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.success,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  successCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  successText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
