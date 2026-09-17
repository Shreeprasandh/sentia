import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Lock,
  Unlock,
  BatteryCharging,
  Mic,
  Droplets,
  ShieldCheck,
  Scale,
  Flame,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SentiAvatars } from '../assets/mascotMap';
import { SentiMood } from '../types';

export type WidgetTheme = 'cream' | 'emerald' | 'obsidian';

export interface WidgetDataProps {
  mood?: SentiMood;
  batteryLevel?: number;
  isLocked?: boolean;
  weightKg?: number;
  hydrationMl?: number;
  hydrationGoalMl?: number;
  lumbarHeatOn?: boolean;
  statusMessage?: string;
  theme?: WidgetTheme;
  onPress?: () => void;
  onVoicePress?: () => void;
  onLockToggle?: () => void;
}

const THEME_STYLES = {
  cream: {
    background: '#FAF6EE',
    border: '#E8E1D5',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textAccent: '#064E3B',
    pillBg: '#F1EBDD',
    cardInner: '#FFFFFF',
    glowColor: 'rgba(6, 78, 59, 0.08)',
    accent: '#064E3B',
    batteryGreen: '#059669',
  },
  emerald: {
    background: '#0B2317',
    border: '#1E4530',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textAccent: '#34D399',
    pillBg: '#133322',
    cardInner: '#0E2C1E',
    glowColor: 'rgba(52, 211, 153, 0.15)',
    accent: '#34D399',
    batteryGreen: '#10B981',
  },
  obsidian: {
    background: '#121417',
    border: '#262930',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textAccent: '#10B981',
    pillBg: '#1C2026',
    cardInner: '#171B21',
    glowColor: 'rgba(16, 185, 129, 0.12)',
    accent: '#10B981',
    batteryGreen: '#10B981',
  },
};

/**
 * 2x2 Compact Android Home Screen Companion Widget
 * Minimalist luxury aura with Senti avatar, battery ring, and instant voice/status link.
 */
export const SentiaWidget2x2: React.FC<WidgetDataProps> = ({
  mood = '01_happy',
  batteryLevel = 84,
  isLocked = true,
  statusMessage = 'Guarded & Serene',
  theme = 'cream',
  onPress,
}) => {
  const t = THEME_STYLES[theme];

  // Gentle organic breathing animation
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.98,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );

    const aura = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    );

    breathing.start();
    aura.start();

    return () => {
      breathing.stop();
      aura.stop();
    };
  }, [breatheAnim, pulseAnim]);

  const handleTap = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (onPress) onPress();
  };

  const avatarSource = SentiAvatars[mood] || SentiAvatars['01_happy'];

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handleTap}
      style={[
        styles.widget2x2Container,
        { backgroundColor: t.background, borderColor: t.border },
      ]}
    >
      {/* Subtle Halo Glow */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            backgroundColor: t.glowColor,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Header Pill: Telemetry Status */}
      <View style={[styles.headerPill, { backgroundColor: t.pillBg }]}>
        <BatteryCharging size={11} color={t.batteryGreen} />
        <Text style={[styles.headerPillText, { color: t.textPrimary }]}>
          {batteryLevel}%
        </Text>
        <View style={styles.headerPillDot} />
        {isLocked ? (
          <Lock size={10} color={t.textSecondary} />
        ) : (
          <Unlock size={10} color="#E11D48" />
        )}
      </View>

      {/* Center Senti Avatar with organic breathing motion */}
      <Animated.View
        style={[
          styles.avatarWrapper2x2,
          { transform: [{ scale: breatheAnim }] },
        ]}
      >
        <Image
          source={avatarSource}
          style={styles.avatarImage2x2}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Minimal Status Caption */}
      <View style={styles.footer2x2}>
        <Text style={[styles.statusText2x2, { color: t.textPrimary }]} numberOfLines={1}>
          {statusMessage}
        </Text>
        <Text style={[styles.subStatus2x2, { color: t.textSecondary }]}>
          Sentia Living Systems
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * 4x4 Command Centre Android Home Screen Widget
 * Rich hardware dashboard with Senti companion, smart lock control, weight, and voice launcher.
 */
export const SentiaWidget4x4: React.FC<WidgetDataProps> = ({
  mood = '01_happy',
  batteryLevel = 84,
  isLocked = true,
  weightKg = 3.4,
  hydrationMl = 2100,
  hydrationGoalMl = 3000,
  lumbarHeatOn = false,
  statusMessage = 'Pacing is steady, Sir.',
  theme = 'cream',
  onPress,
  onVoicePress,
  onLockToggle,
}) => {
  const t = THEME_STYLES[theme];

  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.04,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.98,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [breatheAnim]);

  const avatarSource = SentiAvatars[mood] || SentiAvatars['01_happy'];
  const hydrationPct = Math.min(Math.round((hydrationMl / hydrationGoalMl) * 100), 100);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={[
        styles.widget4x4Container,
        { backgroundColor: t.background, borderColor: t.border },
      ]}
    >
      {/* Top Brand Header */}
      <View style={styles.topRow4x4}>
        <View style={styles.brandGroup}>
          <Text style={[styles.brandTitle, { color: t.textAccent }]}>SENTIA</Text>
          <Text style={[styles.brandSub, { color: t.textSecondary }]}>AUTONOMOUS COMPANION</Text>
        </View>

        {/* Quick Voice Trigger Button */}
        <TouchableOpacity
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {}
            if (onVoicePress) onVoicePress();
          }}
          style={[styles.voiceActionBtn, { backgroundColor: t.accent }]}
          activeOpacity={0.8}
        >
          <Mic size={14} color="#FFFFFF" />
          <Text style={styles.voiceActionText}>Talk</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Split: Left Companion, Right Telemetry Grid */}
      <View style={styles.contentSplit4x4}>
        {/* Left Column: Senti Avatar & Mood Presence */}
        <View style={styles.leftCol4x4}>
          <Animated.View
            style={[
              styles.avatarContainer4x4,
              { transform: [{ scale: breatheAnim }] },
            ]}
          >
            <Image
              source={avatarSource}
              style={styles.avatarImage4x4}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={[styles.sentiStatus4x4, { color: t.textPrimary }]} numberOfLines={2}>
            {statusMessage}
          </Text>
        </View>

        {/* Right Column: Hardware Command & Telemetry */}
        <View style={styles.rightCol4x4}>
          {/* Lock & Battery Tile */}
          <View style={styles.tileRow}>
            {/* Lock Toggle Tile */}
            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch {}
                if (onLockToggle) onLockToggle();
              }}
              style={[
                styles.miniTile,
                { backgroundColor: t.cardInner, borderColor: t.border },
              ]}
              activeOpacity={0.8}
            >
              {isLocked ? (
                <Lock size={15} color={t.accent} />
              ) : (
                <Unlock size={15} color="#E11D48" />
              )}
              <Text style={[styles.miniTileLabel, { color: t.textPrimary }]}>
                {isLocked ? 'TSA Locked' : 'Unlocked'}
              </Text>
            </TouchableOpacity>

            {/* Battery Tile */}
            <View
              style={[
                styles.miniTile,
                { backgroundColor: t.cardInner, borderColor: t.border },
              ]}
            >
              <BatteryCharging size={15} color={t.batteryGreen} />
              <Text style={[styles.miniTileLabel, { color: t.textPrimary }]}>
                {batteryLevel}% Pwr
              </Text>
            </View>
          </View>

          {/* Weight & Lumbar Heat Tile */}
          <View style={styles.tileRow}>
            {/* Spinal Load */}
            <View
              style={[
                styles.miniTile,
                { backgroundColor: t.cardInner, borderColor: t.border },
              ]}
            >
              <Scale size={15} color={t.accent} />
              <Text style={[styles.miniTileLabel, { color: t.textPrimary }]}>
                {weightKg} kg Load
              </Text>
            </View>

            {/* Lumbar Recovery */}
            <View
              style={[
                styles.miniTile,
                { backgroundColor: t.cardInner, borderColor: t.border },
              ]}
            >
              <Flame size={15} color={lumbarHeatOn ? '#D97706' : t.textSecondary} />
              <Text style={[styles.miniTileLabel, { color: t.textPrimary }]}>
                {lumbarHeatOn ? '40°C Heat' : 'Pad Idle'}
              </Text>
            </View>
          </View>

          {/* Hydration Pacing Progress Bar */}
          <View
            style={[
              styles.hydrationCard,
              { backgroundColor: t.cardInner, borderColor: t.border },
            ]}
          >
            <View style={styles.hydrationHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Droplets size={12} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={[styles.hydrationTitle, { color: t.textSecondary }]}>
                  Hydration Pacing
                </Text>
              </View>
              <Text style={[styles.hydrationValue, { color: t.textPrimary }]}>
                {(hydrationMl / 1000).toFixed(1)}L / {(hydrationGoalMl / 1000).toFixed(1)}L
              </Text>
            </View>

            <View style={[styles.progressBarTrack, { backgroundColor: t.pillBg }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${hydrationPct}%`, backgroundColor: t.accent },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 2x2 Widget Styles
  widget2x2Container: {
    width: 156,
    height: 156,
    borderRadius: 28,
    borderWidth: 1.2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    top: 24,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  headerPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  headerPillDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  avatarWrapper2x2: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage2x2: {
    width: 68,
    height: 68,
  },
  footer2x2: {
    alignItems: 'center',
    width: '100%',
  },
  statusText2x2: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  subStatus2x2: {
    fontSize: 8,
    fontWeight: '500',
    marginTop: 1,
    letterSpacing: 0.3,
  },

  // 4x4 Widget Styles
  widget4x4Container: {
    width: 330,
    height: 200,
    borderRadius: 30,
    borderWidth: 1.2,
    padding: 14,
    overflow: 'hidden',
  },
  topRow4x4: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandGroup: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandSub: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  voiceActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  voiceActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  contentSplit4x4: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  leftCol4x4: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer4x4: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage4x4: {
    width: 72,
    height: 72,
  },
  sentiStatus4x4: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 13,
  },
  rightCol4x4: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tileRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  miniTileLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  hydrationCard: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  hydrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hydrationTitle: {
    fontSize: 9,
    fontWeight: '600',
  },
  hydrationValue: {
    fontSize: 9,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
});
