import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { SentiMood } from '../types';
import { SentiAvatars } from '../assets/mascotMap';

interface TourStep {
  title: string;
  description: string;
  mood: SentiMood;
  buttonLabel: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Sentia',
    description: "I'm Senti, your smart bag companion. I live right inside your bag to keep your daily life organized, secure, and stress-free.",
    mood: '01_happy',
    buttonLabel: 'Meet Senti →',
  },
  {
    title: 'Morning Smart Essentials',
    description: 'Never wonder if you forgot your keys or charger. Your essentials checklist resets automatically every morning based on your schedule.',
    mood: '04_wink',
    buttonLabel: 'Next: Security →',
  },
  {
    title: 'Perimeter Radar & Guard',
    description: "Rest easy at coffee shops and transit. Arm the Perimeter Shield and your phone will instantly alert you if anyone touches your bag.",
    mood: '08_cool',
    buttonLabel: 'Next: Wellness →',
  },
  {
    title: 'Discreet Cycle Care',
    description: 'Thoughtful health tracking gives you a gentle 48-hour heads up before your period so your bag is always stocked with care essentials.',
    mood: '05_love',
    buttonLabel: 'Almost Ready →',
  },
  {
    title: "You're All Set!",
    description: 'Tap me quietly in the corner whenever you have a question or need a hand. Enjoy a smarter everyday.',
    mood: '20_celebrating',
    buttonLabel: 'Enter Sentia',
  },
];

interface OnboardingTourProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  visible,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onComplete();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onComplete}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Skip link at top right */}
          <View style={styles.topRow}>
            <Text style={styles.stepCounter}>
              Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </Text>
            {currentStepIndex < TOUR_STEPS.length - 1 && (
              <TouchableOpacity onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Senti Mascot Visual */}
          <View style={styles.avatarContainer}>
            <Image
              source={SentiAvatars[currentStep.mood] || SentiAvatars['01_happy']}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          {/* Editorial Content */}
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.description}>{currentStep.description}</Text>

          {/* Progress Indicators */}
          <View style={styles.dotsRow}>
            {TOUR_STEPS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentStepIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{currentStep.buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: Math.min(width - 40, 360),
    backgroundColor: Colors.canvas,
    borderRadius: 24,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.floating,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepCounter: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  avatarContainer: {
    width: 130,
    height: 130,
    backgroundColor: Colors.canvasElevated,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.subtle,
  },
  mascotImage: {
    width: 105,
    height: 105,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.cardAccentBorder,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
