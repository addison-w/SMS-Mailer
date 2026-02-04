// src/app/(tabs)/history.tsx
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@/components/ui';
import { QueueItemCard } from '@/components/features/QueueItemCard';
import { useHistoryStore } from '@/stores/history';

// M3 semantic color for success state
const SUCCESS_COLOR = '#22C55E';

export default function HistoryScreen() {
  const theme = useAppTheme();
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {!hasItems ? (
          <View style={styles.emptyState} accessibilityRole="text">
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color={SUCCESS_COLOR}
              style={styles.emptyIcon}
            />
            <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
              All Clear
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              No pending or failed messages
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {totalForwarded} forwarded successfully
            </Text>
          </View>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <Text
                  variant="labelLarge"
                  style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
                >
                  PENDING ({pending.length})
                </Text>
                {pending.map((item) => (
                  <QueueItemCard key={item.id} item={item} />
                ))}
              </>
            )}

            {failed.length > 0 && (
              <>
                <Text
                  variant="labelLarge"
                  style={[styles.sectionTitle, { color: theme.colors.error }]}
                >
                  FAILED ({failed.length})
                </Text>
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
                  accessibilityLabel={`Clear all ${failed.length} failed messages`}
                />
              </>
            )}

            <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={styles.successRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={SUCCESS_COLOR}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}
              >
                {totalForwarded} messages forwarded successfully
              </Text>
            </View>
          </>
        )}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptySubtitle: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
