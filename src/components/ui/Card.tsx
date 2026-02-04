// src/components/ui/Card.tsx
import { StyleSheet, ViewStyle, Animated, View } from 'react-native';
import { Card as PaperCard, Text } from 'react-native-paper';
import { useEffect, useRef } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  mode?: 'elevated' | 'outlined' | 'contained';
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Card({
  title,
  children,
  style,
  delay = 0,
  mode = 'outlined',
  onPress,
  accessibilityLabel,
}: CardProps) {
  const theme = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const cardContent = (
    <>
      {title && (
        <Text
          variant="labelMedium"
          style={[styles.title, { color: theme.colors.onSurfaceVariant }]}
        >
          {title}
        </Text>
      )}
      {children}
    </>
  );

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <PaperCard
        mode={mode}
        style={[styles.card, style]}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={onPress ? 'button' : undefined}
      >
        <PaperCard.Content style={styles.content}>
          {cardContent}
        </PaperCard.Content>
      </PaperCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
