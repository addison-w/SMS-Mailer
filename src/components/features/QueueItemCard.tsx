// src/components/features/QueueItemCard.tsx
import { View, StyleSheet } from 'react-native';
import { Text, Button as PaperButton, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { QueueItem } from '@/types';

// M3 semantic colors
const WARNING_COLOR = '#F59E0B';

interface QueueItemCardProps {
  item: QueueItem;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function QueueItemCard({ item, onRetry, onDismiss }: QueueItemCardProps) {
  const theme = useAppTheme();
  const [countdown, setCountdown] = useState(0);
  const isPending = item.status === 'pending';

  useEffect(() => {
    if (!isPending) return;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((item.nextRetry - Date.now()) / 1000));
      setCountdown(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [item.nextRetry, isPending]);

  const truncatedBody = item.sms.body.length > 50
    ? item.sms.body.substring(0, 50) + '...'
    : item.sms.body;

  const borderColor = isPending ? WARNING_COLOR + '40' : theme.colors.error + '40';

  return (
    <Card
      style={[styles.card, { borderColor }]}
      mode="outlined"
      accessibilityLabel={`${isPending ? 'Pending' : 'Failed'} message from ${item.sms.sender}`}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name={isPending ? 'clock-outline' : 'close-circle'}
            size={20}
            color={isPending ? WARNING_COLOR : theme.colors.error}
          />
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {item.sms.sender}
          </Text>
        </View>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          "{truncatedBody}"
        </Text>
        {isPending ? (
          <Text variant="labelSmall" style={[styles.status, { color: theme.colors.onSurfaceVariant }]}>
            {countdown > 0 ? `Retry in ${countdown}s` : 'Retrying...'}
          </Text>
        ) : (
          <>
            <Text variant="labelSmall" style={{ color: theme.colors.error, marginTop: 8 }}>
              {item.error}
            </Text>
            <Text variant="labelSmall" style={[styles.status, { color: theme.colors.onSurfaceVariant }]}>
              {item.attempts} retries exhausted
            </Text>
            <View style={styles.actions}>
              {onRetry && (
                <PaperButton
                  mode="contained"
                  compact
                  onPress={onRetry}
                  contentStyle={styles.buttonContent}
                  accessibilityLabel={`Retry sending message from ${item.sms.sender}`}
                >
                  Retry
                </PaperButton>
              )}
              {onDismiss && (
                <PaperButton
                  mode="outlined"
                  compact
                  onPress={onDismiss}
                  contentStyle={styles.buttonContent}
                  accessibilityLabel={`Dismiss failed message from ${item.sms.sender}`}
                >
                  Dismiss
                </PaperButton>
              )}
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderWidth: 1,
  },
  content: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  status: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  buttonContent: {
    minHeight: 36,
  },
});
