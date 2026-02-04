// src/components/features/PermissionCard.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedProps,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { colors } from '@/theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);
  const iconScale = useSharedValue(granted ? 1 : 0.8);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    iconScale.value = withSpring(granted ? 1.2 : 0.8, { damping: 10 }, () => {
      iconScale.value = withSpring(1);
    });
    if (granted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [granted]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSpring(0.9, { damping: 15 }, () => {
      buttonScale.value = withSpring(1);
    });
    onRequestPermission?.();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        granted ? styles.cardGranted : styles.cardDenied,
        cardAnimatedStyle,
      ]}
    >
      <View style={styles.row}>
        <Animated.View style={[styles.iconContainer, granted ? styles.iconGranted : styles.iconDenied, iconAnimatedStyle]}>
          <Text style={[styles.icon, granted ? styles.iconTextGranted : styles.iconTextDenied]}>
            {granted ? '✓' : '!'}
          </Text>
        </Animated.View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {!granted && onRequestPermission && (
        <AnimatedPressable
          style={[styles.button, buttonAnimatedStyle]}
          onPress={handleButtonPress}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </AnimatedPressable>
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
