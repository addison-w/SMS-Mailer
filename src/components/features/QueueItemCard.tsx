// src/components/features/QueueItemCard.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { colors } from '@/theme/colors';
import type { QueueItem } from '@/types';

interface QueueItemCardProps {
  item: QueueItem;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function QueueItemCard({ item, onRetry, onDismiss }: QueueItemCardProps) {
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

  const truncatedBody = item.sms.body.length > 30
    ? item.sms.body.substring(0, 30) + '...'
    : item.sms.body;

  return (
    <View style={[styles.card, isPending ? styles.cardPending : styles.cardFailed]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{isPending ? '⏳' : '✗'}</Text>
        <Text style={styles.sender}>{item.sms.sender}</Text>
      </View>
      <Text style={styles.body}>"{truncatedBody}"</Text>
      {isPending ? (
        <Text style={styles.status}>
          {countdown > 0 ? `Retry in ${countdown}s` : 'Retrying...'}
        </Text>
      ) : (
        <>
          <Text style={styles.error}>{item.error}</Text>
          <Text style={styles.status}>{item.attempts} retries exhausted</Text>
          <View style={styles.actions}>
            {onRetry && (
              <Pressable style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            )}
            {onDismiss && (
              <Pressable style={styles.dismissButton} onPress={onDismiss}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardPending: {
    borderColor: colors.warning + '40',
  },
  cardFailed: {
    borderColor: colors.error + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  status: {
    fontSize: 12,
    color: colors.textMuted,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dismissText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
