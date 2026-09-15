import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  Calendar,
  Heart,
  ShieldCheck,
  Bell,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { SentiAvatars } from '../assets/mascotMap';

interface CycleTrackerScreenProps {
  onBack: () => void;
}

export const CycleTrackerScreen: React.FC<CycleTrackerScreenProps> = ({ onBack }) => {
  const [bagSyncEnabled, setBagSyncEnabled] = useState(true);

  const toggleSync = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setBagSyncEnabled((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cycle Care Sync</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Cycle Ring Card */}
        <View style={styles.cycleCard}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Heart size={26} color="#BE185D" />
              <Text style={styles.cycleDaysRemaining}>6</Text>
              <Text style={styles.cycleDaysLabel}>Days Until Next Cycle</Text>
            </View>
          </View>

          <View style={styles.phasePill}>
            <Text style={styles.phasePillText}>Day 22 • Luteal Phase</Text>
          </View>
          <Text style={styles.phaseDescription}>
            Body temperature slightly elevated. Keep hydration steady and rest well.
          </Text>
        </View>

        {/* Senti Caring Companion Card */}
        <View style={styles.sentiCard}>
          <Image
            source={SentiAvatars['05_love']}
            style={styles.sentiImage}
            resizeMode="contain"
          />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.sentiTitle}>Thoughtful Bag Sync</Text>
            <Text style={styles.sentiBody}>
              I’ll quietly prompt you 48 hours in advance to pack personal care essentials into your bag’s discreet interior sleeve.
            </Text>
          </View>
        </View>

        {/* Smart Bag Sync Toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={toggleSync}
          activeOpacity={0.85}
        >
          <View style={styles.toggleLeft}>
            <View style={styles.bellIconWrap}>
              <Bell size={18} color={Colors.primary} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.toggleTitle}>48h Advance Bag Prompt</Text>
              <Text style={styles.toggleSubtitle}>
                Add care pouch to morning checklist 2 days prior
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.switchTrack,
              bagSyncEnabled ? styles.switchOn : styles.switchOff,
            ]}
          >
            <View
              style={[
                styles.switchThumb,
                bagSyncEnabled ? styles.thumbOn : styles.thumbOff,
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Strict Privacy Shield Notice */}
        <View style={styles.privacyCard}>
          <ShieldCheck size={18} color={Colors.primary} />
          <Text style={styles.privacyText}>
            End-to-End Private: Your cycle telemetry is encrypted on-device. Sentia never sells, tracks, or shares reproductive health data with third parties.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.lg,
  },
  cycleCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 24,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  ringOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 6,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cycleDaysRemaining: {
    fontSize: 36,
    fontWeight: '800',
    color: '#9D174D',
    marginTop: 2,
  },
  cycleDaysLabel: {
    fontSize: 11,
    color: '#BE185D',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  phasePill: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    marginTop: Spacing.lg,
  },
  phasePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9D174D',
  },
  phaseDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  sentiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasWarm,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginBottom: Spacing.md,
  },
  sentiImage: {
    width: 56,
    height: 56,
  },
  sentiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sentiBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.canvasElevated,
    padding: Spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.subtle,
    marginBottom: Spacing.lg,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bellIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: Colors.primary,
  },
  switchOff: {
    backgroundColor: '#D1D5DB',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FAF6EE',
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E6F4EA',
    borderRadius: 16,
    padding: Spacing.md,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: Colors.primaryMuted,
    lineHeight: 16,
    marginLeft: 8,
  },
});
