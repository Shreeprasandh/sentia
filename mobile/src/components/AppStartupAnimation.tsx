import React, { useEffect, useRef } from 'react';
import {
  Text,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/tokens';

interface AppStartupAnimationProps {
  onAnimationComplete: () => void;
}

/**
 * AppStartupAnimation
 * Minimal, quiet luxury opening sequence:
 * Centered Sentia emblem smoothly fades in, pauses briefly, and dissolves into the app.
 */
export const AppStartupAnimation: React.FC<AppStartupAnimationProps> = ({
  onAnimationComplete,
}) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Gentle fade and subtle scale
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtle brand text reveals
    const timerText = setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 300);

    // 3. Graceful dissolve into Dashboard at 1.4s
    const timerExit = setTimeout(() => {
      handleComplete();
    }, 1400);

    return () => {
      clearTimeout(timerText);
      clearTimeout(timerExit);
    };
  }, []);

  const handleComplete = () => {
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      onAnimationComplete();
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.centerStage}
        onPress={handleComplete}
      >
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/brand/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
          <Text style={styles.brandTitle}>S E N T I A</Text>
          <Text style={styles.tagline}>A SMARTER EVERYDAY</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.canvas,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  textBlock: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textTertiary,
    letterSpacing: 2,
    marginTop: 6,
  },
});
