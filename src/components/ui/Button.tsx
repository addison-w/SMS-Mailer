// src/components/ui/Button.tsx
import { StyleSheet, ViewStyle, Animated } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: string;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  icon,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Map variants to Paper button modes and colors
  const getButtonProps = () => {
    switch (variant) {
      case 'secondary':
        return {
          mode: 'outlined' as const,
          textColor: theme.colors.primary,
        };
      case 'danger':
        return {
          mode: 'contained' as const,
          buttonColor: theme.colors.error,
          textColor: theme.colors.onError,
        };
      default: // primary
        return {
          mode: 'contained' as const,
          buttonColor: theme.colors.primary,
          textColor: theme.colors.onPrimary,
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <PaperButton
        {...buttonProps}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        loading={loading}
        icon={icon}
        contentStyle={styles.content}
        labelStyle={styles.label}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
      >
        {title}
      </PaperButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    minHeight: 48, // M3 touch target minimum
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
