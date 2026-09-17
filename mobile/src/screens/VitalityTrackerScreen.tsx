import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Flame,
  Droplets,
  Shield,
  Activity,
  Zap,
  Info,
  CheckCircle2,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';

interface VitalityTrackerScreenProps {
  onBack: () => void;
}

export const VitalityTrackerScreen: React.FC<VitalityTrackerScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const {
    vitalityData,
    toggleVitalityLumbarHeat,
    startFocusSprint,
    stopFocusSprint,
    logHydrationSip,
  } = useCircle();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [sprintDuration, setSprintDuration] = useState(90);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  const handleToggleHeat = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    toggleVitalityLumbarHeat();
  };

  const handleStartSprint = () => {
    if (vitalityData.isFocusSprintActive) {
      Alert.alert(
        'End Focus Sprint?',
        `You have ${vitalityData.focusSprintMinutesRemaining} minutes remaining in this deep focus session. Would you like to end this sprint now?`,
        [
          { text: 'Keep Focused', style: 'cancel' },
          {
            text: 'End Sprint',
            style: 'destructive',
            onPress: () => {
              stopFocusSprint();
            },
          },
        ]
      );
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    startFocusSprint(sprintDuration);
  };

  const handleLogSip = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    logHydrationSip(0.25);
  };

  const spinalPct = Math.min(
    100,
    Math.round((vitalityData.spinalLoadKg / vitalityData.recommendedMaxKg) * 100)
  );

  const hydrationPct = Math.min(
    100,
    Math.round((vitalityData.dailyHydrationCurrentL / vitalityData.dailyHydrationTargetL) * 100)
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} translucent={true} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCenter}>
          <Text style={styles.headerTitle}>Vitality & Focus</Text>
          <Text style={styles.headerSubtitle}>Hardware Ergonomics & Physical Pacing</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setShowInfoModal(true);
          }}
          style={styles.backButton}
          accessibilityLabel="Ergonomics Science Guide"
        >
          <Info size={19} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Spinal Load & Ergonomics Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <Activity size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Spinal Load & Posture</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#065F46' }]}>OPTIMAL</Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>
                Continuous strap sensor telemetry calculating ergonomic load
              </Text>
            </View>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{vitalityData.spinalLoadKg} kg</Text>
              <Text style={styles.metricLabel}>Current Bag Weight</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{vitalityData.recommendedMaxKg} kg</Text>
              <Text style={styles.metricLabel}>Max Safe Threshold (10%)</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${spinalPct}%`,
                    backgroundColor: spinalPct > 85 ? '#DC2626' : Colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Capacity Utilized: {spinalPct}%</Text>
              <Text style={styles.progressSubLabel}>
                {vitalityData.isPostureBalanced ? 'Dual Shoulder Balance Confirmed' : 'Imbalance Detected'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Hardware Lumbar Muscle Warmth Recovery */}
        <View style={[styles.card, vitalityData.lumbarHeatActive && styles.cardActiveWarmth]}>
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconCircle,
                vitalityData.lumbarHeatActive && { backgroundColor: '#FEE2E2' },
              ]}
            >
              <Flame
                size={20}
                color={vitalityData.lumbarHeatActive ? '#DC2626' : Colors.cognacAmber}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Hardware Lumbar Warmth</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: vitalityData.lumbarHeatActive ? '#FEE2E2' : '#F5EFE0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: vitalityData.lumbarHeatActive ? '#B91C1C' : Colors.cognacAmber },
                    ]}
                  >
                    {vitalityData.lumbarHeatActive ? '40°C ACTIVE' : 'STANDBY'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>
                Integrated lower-back thermal chamber for post-workout muscle recovery
              </Text>
            </View>
          </View>

          <View style={styles.warmthActionRow}>
            <Text style={styles.warmthStatusText}>
              {vitalityData.lumbarHeatActive
                ? `Relaxing muscles • ${vitalityData.lumbarHeatMinutesRemaining} min auto-shutoff`
                : '15-minute gentle muscle soothe after heavy lifting or long desk sitting'}
            </Text>
            <TouchableOpacity
              style={[
                styles.warmthToggleBtn,
                vitalityData.lumbarHeatActive && styles.warmthToggleBtnActive,
              ]}
              onPress={handleToggleHeat}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.warmthToggleBtnText,
                  vitalityData.lumbarHeatActive && styles.warmthToggleBtnTextActive,
                ]}
              >
                {vitalityData.lumbarHeatActive ? 'Turn Off Heat' : 'Activate 40°C Heat'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Hydration Pacing & Bottle Dock Sync */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Droplets size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Hydration Pacing Dock</Text>
                <Text style={styles.hydrationMetricSummary}>
                  {vitalityData.dailyHydrationCurrentL}L / {vitalityData.dailyHydrationTargetL}L
                </Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Weight-calibrated water bottle dock tracking daily physical pacing
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${hydrationPct}%`, backgroundColor: '#2563EB' },
                ]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>{hydrationPct}% of Daily 3.0L Target</Text>
              <TouchableOpacity onPress={handleLogSip} style={styles.quickLogBtn}>
                <Sparkles size={12} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.quickLogText}>+ Log 250ml Sip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. Ultradian Focus & Posture Sprint */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#FAF3E7' }]}>
              <Zap size={20} color={Colors.cognacAmber} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>90-Minute Focus Sprint</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#FAF3E7' }]}>
                  <Text style={[styles.statusBadgeText, { color: Colors.cognacAmber }]}>
                    {vitalityData.isFocusSprintActive ? 'RUNNING' : 'STANDBY'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>
                Ultradian deep work cycle with bag haptic posture resets
              </Text>
            </View>
          </View>

          <View style={styles.focusActionRow}>
            <View>
              <Text style={styles.focusTimerLarge}>
                {vitalityData.isFocusSprintActive
                  ? `${vitalityData.focusSprintMinutesRemaining} min`
                  : '90 min'}
              </Text>
              <Text style={styles.focusTimerSub}>
                {vitalityData.isFocusSprintActive
                  ? 'Deep focus session in progress'
                  : 'Optimal cognitive focus interval'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.focusStartBtn}
              onPress={handleStartSprint}
              activeOpacity={0.85}
            >
              {vitalityData.isFocusSprintActive ? (
                <>
                  <Pause size={16} color="#FAF6EE" />
                  <Text style={styles.focusStartBtnText}>Active</Text>
                </>
              ) : (
                <>
                  <Play size={16} color="#FAF6EE" />
                  <Text style={styles.focusStartBtnText}>Start Sprint</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Ergonomic Science Monograph Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalCard}>
            <View style={styles.infoModalHeader}>
              <View style={styles.infoIconBadge}>
                <Shield size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.infoModalTitle}>Hardware Ergonomic Science</Text>
                <Text style={styles.infoModalSub}>Spinal Biomechanics & Muscle Recovery</Text>
              </View>
              <TouchableOpacity onPress={() => setShowInfoModal(false)} style={styles.closeInfoBtn}>
                <X size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>The 10% Spinal Medical Rule</Text>
                <Text style={styles.infoSectionBody}>
                  Orthopedic medicine recommends that a backpack should never exceed 10% to 12% of your body weight. Sentia's embedded strap load cells measure your payload continuously to prevent spinal compression and nerve strain.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Thermal Lumbar Recovery</Text>
                <Text style={styles.infoSectionBody}>
                  The integrated 40°C thermal pad applies gentle heat to the L1-L5 lumbar vertebrae. This increases micro-circulation, relieves lower-back stiffness, and aids faster recovery after workouts or hours at a desk.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Ultradian Focus & Posture Breaks</Text>
                <Text style={styles.infoSectionBody}>
                  Human focus naturally follows 90-minute ultradian rhythms. When a focus sprint concludes, your Sentia bag emits a discreet double-pulse haptic vibration prompting you to hydrate, stretch, and reset your posture.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={() => setShowInfoModal(false)}>
              <Text style={styles.modalSubmitBtnText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.canvas,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvasElevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  headerTitleCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.card,
  },
  cardActiveWarmth: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFBFB',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.canvas,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.cardAccentBorder,
  },
  progressContainer: {
    marginTop: Spacing.xs,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#EEDCC0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressSubLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  warmthActionRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
  },
  warmthStatusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  warmthToggleBtn: {
    backgroundColor: Colors.canvasWarm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    borderRadius: BorderRadius.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  warmthToggleBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  warmthToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  warmthToggleBtnTextActive: {
    color: '#FAF6EE',
  },
  hydrationMetricSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  quickLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.cardAccent,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  quickLogText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  focusActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
  },
  focusTimerLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  focusTimerSub: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  focusStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
  },
  focusStartBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  infoModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E7',
  },
  infoIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF3E7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  infoModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  infoModalSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  closeInfoBtn: {
    padding: 6,
  },
  infoSection: {
    marginBottom: Spacing.md,
    backgroundColor: '#FAF3E7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  infoSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  infoSectionBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
});
