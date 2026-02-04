// src/components/ui/Card.tsx
import { Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '@/theme/colors';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export function Card({ title, children, style, delay = 0 }: CardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
