// src/app/onboarding.tsx
import { View, Text, StyleSheet, Dimensions, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import { Button } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboarding';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    icon: '📨',
    title: 'Forward SMS to Email',
    description: 'Automatically forward all incoming SMS messages to your email address. Never miss an important text again.',
  },
  {
    icon: '⚙️',
    title: 'Configure SMTP',
    description: 'Connect any SMTP email server - Gmail, Outlook, or your own. Full control over your email delivery.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your credentials are stored securely on your device. Messages are forwarded directly to your email.',
  },
  {
    icon: '🔋',
    title: 'Always Running',
    description: 'Runs reliably in the background even when your phone is locked. Battery-optimized for minimal impact.',
  },
];

export default function OnboardingScreen() {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentStep < STEPS.length - 1 && (
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.stepsContainer, { transform: [{ translateX }] }]}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.step}>
              <Text style={styles.icon}>{step.icon}</Text>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.description}>{step.description}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {STEPS.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => goToStep(index)}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          title={currentStep === STEPS.length - 1 ? 'Get Started' : 'Continue'}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
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
  icon: {
    fontSize: 72,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
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
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});
