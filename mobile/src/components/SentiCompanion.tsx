import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SentiAvatars } from '../assets/mascotMap';
import { SentiMood } from '../types';
import { Colors, Shadows } from '../theme/tokens';

interface SentiCompanionProps {
  initialMood?: SentiMood;
  onPress?: () => void;
  size?: number;
  speechBubbleText?: string | null;
  idleTimeoutSeconds?: number;
}

/**
 * SentiCompanion
 * The Living Pocket Companion for Sentia.
 * 
 * Behaviors:
 * - Compact footprint (default 48px).
 * - Gentle, organic idle breathing loop.
 * - Inactivity timer (default 15s): smoothly fades to 35% opacity and enters sleep mood (13_sleepy).
 * - Instant tap to wake: springs up to 100% opacity with light tactile haptic feedback.
 * - Dynamic speech balloon with auto-dismiss.
 */
export const SentiCompanion: React.FC<SentiCompanionProps> = ({
  initialMood = '01_happy',
  onPress,
  size = 48,
  speechBubbleText = null,
  idleTimeoutSeconds = 15,
}) => {
  const [currentMood, setCurrentMood] = useState<SentiMood>(initialMood);
  const [isAsleep, setIsAsleep] = useState<boolean>(false);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(speechBubbleText);

  // Animated values
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  // Inactivity timer ref
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start organic breathing animation
  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.04,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.98,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [breatheAnim]);

  // Reset inactivity sleep timer
  const resetSleepTimer = () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }

    // Wake up immediately if asleep
    if (isAsleep) {
      setIsAsleep(false);
      setCurrentMood('04_wink');
      Animated.timing(opacityAnim, {
        toValue: 1.0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // After waking wink, transition to happy
        setTimeout(() => setCurrentMood(initialMood), 1500);
      });
    }

    // Arm sleep timer
    sleepTimerRef.current = setTimeout(() => {
      // Transition smoothly into quiet sleep
      setIsAsleep(true);
      setCurrentMood('13_sleepy');
      setBubbleMessage(null); // Clear any speech bubble when sleeping
      Animated.timing(opacityAnim, {
        toValue: 0.35,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    }, idleTimeoutSeconds * 1000);
  };

  // Monitor external mood or speech bubble changes
  useEffect(() => {
    if (speechBubbleText) {
      setBubbleMessage(speechBubbleText);
      resetSleepTimer();
    }
  }, [speechBubbleText]);

  useEffect(() => {
    resetSleepTimer();
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, []);

  // Handle tactile tap interaction
  const handlePress = () => {
    // Tactile haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback if haptics unavailable
    }

    // Playful squish & bounce animation (Disney principle)
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.08,
        friction: 4,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Wake up immediately
    resetSleepTimer();

    // Call external press handler (e.g. open Senti chat modal)
    if (onPress) {
      onPress();
    }
  };

  const imageSource = SentiAvatars[currentMood] || SentiAvatars['01_happy'];

  return (
    <View style={styles.container}>
      {/* Speech Balloon (only visible when active with text) */}
      {bubbleMessage && !isAsleep && (
        <Animated.View style={[styles.bubble, { opacity: opacityAnim }]}>
          <Text style={styles.bubbleText}>{bubbleMessage}</Text>
          <View style={styles.bubbleArrow} />
        </Animated.View>
      )}

      {/* Senti Interactive Avatar */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.avatarWrapper,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Animated.View
          style={[
            styles.imageContainer,
            {
              width: size,
              height: size,
              opacity: opacityAnim,
              transform: [{ scale: Animated.multiply(scaleAnim, breatheAnim) }],
            },
          ]}
        >
          <Image
            source={imageSource}
            style={{ width: size, height: size }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Quiet Sleep Status Ring */}
        {isAsleep && (
          <View style={styles.sleepBadge}>
            <Text style={styles.sleepZ}>z</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    backgroundColor: '#FDFBF7',
    borderWidth: 1.5,
    borderColor: '#EEDCC0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    ...Shadows.subtle,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    bottom: 56,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    maxWidth: 180,
    ...Shadows.subtle,
    zIndex: 100,
  },
  bubbleText: {
    color: '#FAF6EE',
    fontSize: 12,
    fontFamily: 'System',
    fontWeight: '500',
    textAlign: 'center',
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primaryMuted,
  },
  sleepBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.cardAccent,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  sleepZ: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primaryMuted,
  },
});
