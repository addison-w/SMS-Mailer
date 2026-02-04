// src/components/features/PermissionCard.tsx
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button as PaperButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';

// M3 semantic colors
const SUCCESS_COLOR = '#22C55E';
const WARNING_COLOR = '#F59E0B';

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
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
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
  }, [delay]);

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

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRequestPermission?.();
  };

  const borderColor = granted ? SUCCESS_COLOR + '30' : theme.colors.outlineVariant;
  const backgroundColor = granted ? SUCCESS_COLOR + '08' : theme.colors.surface;

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <Surface
        style={[styles.card, { borderColor, backgroundColor }]}
        elevation={0}
      >
        <View style={styles.row}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: granted ? SUCCESS_COLOR + '20' : WARNING_COLOR + '20',
                transform: [{ scale: iconScale }],
              },
            ]}
          >
            <MaterialCommunityIcons
              name={granted ? 'check' : 'alert'}
              size={18}
              color={granted ? SUCCESS_COLOR : WARNING_COLOR}
            />
          </Animated.View>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {title}
          </Text>
        </View>
        {!granted && onRequestPermission && (
          <PaperButton
            mode="contained"
            compact
            onPress={handleButtonPress}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            accessibilityLabel={`${actionLabel} ${title} permission`}
          >
            {actionLabel}
          </PaperButton>
        )}
        {granted && (
          <Text variant="labelMedium" style={{ color: SUCCESS_COLOR }}>
            Granted
          </Text>
        )}
      </Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  buttonContent: {
    minHeight: 36,
    paddingHorizontal: 4,
  },
  buttonLabel: {
    fontSize: 13,
    marginVertical: 0,
  },
});
