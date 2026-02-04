// src/app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { useOnboardingStore } from '@/stores/onboarding';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { hasCompletedOnboarding } = useOnboardingStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to let Zustand hydrate from AsyncStorage
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, segments, isReady]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
