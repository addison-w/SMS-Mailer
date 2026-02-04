// src/components/features/PermissionCard.tsx
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { colors } from '@/theme/colors';

interface PermissionCardProps {
  title: string;
  granted: boolean;
  onRequestPermission?: () => void;
  actionLabel?: string;
  delay?: number;
}

export function PermissionCard({
  title,
  granted,
  onRequestPermission,
  actionLabel = 'Enable',
  delay = 0,
}: PermissionCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(granted ? 1 : 0.8)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: granted ? 1.2 : 0.8,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    if (granted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [granted]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    onRequestPermission?.();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        granted ? styles.cardGranted : styles.cardDenied,
        { opacity, transform: [{ scale }] },
      ]}
    >
      <View style={styles.row}>
        <Animated.View style={[styles.iconContainer, granted ? styles.iconGranted : styles.iconDenied, { transform: [{ scale: iconScale }] }]}>
          <Text style={[styles.icon, granted ? styles.iconTextGranted : styles.iconTextDenied]}>
            {granted ? '✓' : '!'}
          </Text>
        </Animated.View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {!granted && onRequestPermission && (
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={handleButtonPress}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </Pressable>
        </Animated.View>
      )}
      {granted && (
        <Text style={styles.grantedLabel}>Granted</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGranted: {
    borderColor: colors.success + '30',
    backgroundColor: colors.success + '08',
  },
  cardDenied: {
    borderColor: colors.warning + '30',
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGranted: {
    backgroundColor: colors.success + '20',
  },
  iconDenied: {
    backgroundColor: colors.warning + '20',
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
  },
  iconTextGranted: {
    color: colors.success,
  },
  iconTextDenied: {
    color: colors.warning,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  grantedLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.success,
  },
});
