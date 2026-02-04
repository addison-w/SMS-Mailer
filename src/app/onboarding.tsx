// src/app/onboarding.tsx
import { View, StyleSheet, Dimensions, Pressable, Animated } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboarding';

const { width } = Dimensions.get('window');

type IconName = 'email-fast' | 'cog' | 'shield-lock' | 'battery-charging';

const STEPS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'email-fast',
    title: 'Forward SMS to Email',
    description: 'Automatically forward all incoming SMS messages to your email address. Never miss an important text again.',
  },
  {
    icon: 'cog',
    title: 'Configure SMTP',
    description: 'Connect any SMTP email server - Gmail, Outlook, or your own. Full control over your email delivery.',
  },
  {
    icon: 'shield-lock',
    title: 'Secure & Private',
    description: 'Your credentials are stored securely on your device. Messages are forwarded directly to your email.',
  },
  {
    icon: 'battery-charging',
    title: 'Always Running',
    description: 'Runs reliably in the background even when your phone is locked. Battery-optimized for minimal impact.',
  },
];

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useOnboardingStore();

  const translateX = useRef(new Animated.Value(0)).current;

  const goToStep = (step: number) => {
    Animated.timing(translateX, {
      toValue: -step * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setCurrentStep(step);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {currentStep < STEPS.length - 1 && (
          <TouchableRipple
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
          >
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              Skip
            </Text>
          </TouchableRipple>
        )}
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.stepsContainer, { transform: [{ translateX }] }]}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons
                  name={step.icon}
                  size={48}
                  color={theme.colors.onPrimaryContainer}
                />
              </View>
              <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                {step.title}
              </Text>
              <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                {step.description}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        {/* Progress dots */}
        <View
          style={styles.dotsContainer}
          accessibilityRole="tablist"
          accessibilityLabel={`Step ${currentStep + 1} of ${STEPS.length}`}
        >
          {STEPS.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => goToStep(index)}
              style={[
                styles.dot,
                { backgroundColor: theme.colors.outlineVariant },
                index === currentStep && [styles.dotActive, { backgroundColor: theme.colors.primary }],
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: index === currentStep }}
              accessibilityLabel={`Go to step ${index + 1}`}
            />
          ))}
        </View>

        <Button
          title={currentStep === STEPS.length - 1 ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          accessibilityLabel={
            currentStep === STEPS.length - 1
              ? 'Complete onboarding and get started'
              : `Continue to step ${currentStep + 2}`
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 48,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  stepsContainer: {
    flexDirection: 'row',
    width: width * STEPS.length,
  },
  step: {
    width: width,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
});
