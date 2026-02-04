// src/components/features/PermissionCard.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/theme/colors';

interface PermissionCardProps {
  title: string;
  granted: boolean;
  onRequestPermission?: () => void;
  actionLabel?: string;
}

export function PermissionCard({
  title,
  granted,
  onRequestPermission,
  actionLabel = 'Enable',
}: PermissionCardProps) {
  return (
    <View style={[styles.card, granted ? styles.cardGranted : styles.cardDenied]}>
      <View style={styles.row}>
        <Text style={styles.icon}>{granted ? '✓' : '✗'}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {!granted && onRequestPermission && (
        <Pressable style={styles.button} onPress={onRequestPermission}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGranted: {
    borderColor: colors.success + '40',
  },
  cardDenied: {
    borderColor: colors.error + '40',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
