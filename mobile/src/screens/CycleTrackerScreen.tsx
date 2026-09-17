import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  Heart,
  ShieldCheck,
  Bell,
  Sparkles,
  Flame,
  Droplets,
  PlusCircle,
  Activity,
  Check,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { SentiAvatars } from '../assets/mascotMap';
import { useCircle } from '../context/CircleContext';

interface CycleTrackerScreenProps {
  onBack: () => void;
}

const PHASES_INFO = [
  {
    phase: 'menstrual',
    title: 'Menstrual Phase',
    days: 'Days 1–5',
    color: '#BE185D',
    bgColor: '#FDF2F8',
    guidance: 'Low energy & cramping. Prioritize lumbar warmth, hydration, and gentle rest.',
    supplies: ['Discreet Sanitary Sleeve', '40°C Lumbar Heat', 'Electrolytes'],
  },
  {
    phase: 'follicular',
    title: 'Follicular Phase',
    days: 'Days 6–13',
    color: '#0D9488',
    bgColor: '#F0FDFA',
    guidance: 'Rising estrogen & cognitive vitality. Perfect for intense workouts & projects.',
    supplies: ['Gym Training Gear', 'Hydration Flask', 'Creative Journal'],
  },
  {
    phase: 'ovulatory',
    title: 'Ovulatory Phase',
    days: 'Days 14–16',
    color: '#D97706',
    bgColor: '#FFFBEB',
    guidance: 'Peak energy & social confidence. Senti keeps your daily calendar optimized.',
    supplies: ['Power Bank Insert', 'Hydration Target 2.6L', 'Refresh Mist'],
  },
  {
    phase: 'luteal',
    title: 'Luteal Phase',
    days: 'Days 17–28',
    color: '#064E3B',
    bgColor: '#FAF6EE',
    guidance: 'Body temperature +0.3°C. Progesterone rising. Keep hydration steady and rest well.',
    supplies: ['Magnesium Packets', 'Chamomile Tea', 'Sanitary Prep (48h)'],
  },
];

export const CycleTrackerScreen: React.FC<CycleTrackerScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { cycleData, syncCycleToBag, toggleLumbarHeat, logCycleSymptom } = useCircle();
  const [bagSyncEnabled, setBagSyncEnabled] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<'menstrual' | 'follicular' | 'ovulatory' | 'luteal'>(cycleData.phase);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  const toggleSync = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setBagSyncEnabled((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} translucent={true} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCenter}>
          <Text style={styles.headerTitle}>Cycle Care Sync</Text>
          <Text style={styles.headerSubtitle}>Hardware & Wellness Alliance</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cycle Ring Overview Card */}
        <View style={styles.cycleCard}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Heart size={26} color="#BE185D" />
              <Text style={styles.cycleDaysRemaining}>{cycleData.daysUntilNextCycle}</Text>
              <Text style={styles.cycleDaysLabel}>Days Until Next Cycle</Text>
            </View>
          </View>

          <View style={styles.phasePill}>
            <Text style={styles.phasePillText}>{cycleData.phaseTitle}</Text>
          </View>
          <Text style={styles.phaseDescription}>
            {cycleData.description}
          </Text>

          {/* 1-Tap Sync to Bag Button */}
          <TouchableOpacity style={styles.syncBagCta} onPress={syncCycleToBag}>
            <Sparkles size={15} color="#FAF6EE" />
            <Text style={styles.syncBagCtaText}>Sync Phase Essentials to Bag</Text>
          </TouchableOpacity>
        </View>

        {/* Hardware Lumbar Thermal Chamber Pouch */}
        <View style={[styles.hardwareHeatCard, cycleData.lumbarHeatActive && styles.hardwareHeatCardActive]}>
          <View style={styles.heatCardHeader}>
            <View style={[styles.heatIconCircle, cycleData.lumbarHeatActive && styles.heatIconCircleActive]}>
              <Flame size={20} color={cycleData.lumbarHeatActive ? '#B91C1C' : '#D97706'} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.heatTitleRow}>
                <Text style={styles.heatTitle}>Hardware Lumbar Warmth</Text>
                <View style={[styles.tempBadge, cycleData.lumbarHeatActive && styles.tempBadgeActive]}>
                  <Text style={[styles.tempBadgeText, cycleData.lumbarHeatActive && styles.tempBadgeTextActive]}>
                    40°C • 104°F
                  </Text>
                </View>
              </View>
              <Text style={styles.heatSubtitle}>
                Integrated ergonomic lower back warming pad for cramp relief
              </Text>
            </View>
          </View>

          <View style={styles.heatActionRow}>
            <Text style={styles.heatTimerText}>
              {cycleData.lumbarHeatActive
                ? `Active: ${cycleData.lumbarHeatMinutesRemaining} min remaining (Auto-off)`
                : 'Standby • 15 min soothing cycle'}
            </Text>
            <TouchableOpacity
              style={[styles.heatTriggerBtn, cycleData.lumbarHeatActive && styles.heatTriggerBtnActive]}
              onPress={toggleLumbarHeat}
            >
              <Flame size={14} color="#FAF6EE" />
              <Text style={styles.heatTriggerBtnText}>
                {cycleData.lumbarHeatActive ? 'Turn Off Heat' : 'Start Warmth'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4-Phase Horizon Selector */}
        <Text style={styles.sectionHeader}>4-Phase Rhythm & Bag Recommendations</Text>
        <View style={styles.phaseSelectorRow}>
          {PHASES_INFO.map((p) => {
            const isSelected = selectedPhase === p.phase;
            return (
              <TouchableOpacity
                key={p.phase}
                style={[
                  styles.phaseTab,
                  isSelected && { backgroundColor: p.color, borderColor: p.color },
                ]}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setSelectedPhase(p.phase as any);
                }}
              >
                <Text
                  style={[
                    styles.phaseTabText,
                    isSelected && { color: '#FAF6EE', fontWeight: '800' },
                  ]}
                >
                  {p.title.split(' ')[0]}
                </Text>
                <Text
                  style={[
                    styles.phaseTabDays,
                    isSelected && { color: 'rgba(255,255,255,0.8)' },
                  ]}
                >
                  {p.days}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detailed Selected Phase Card */}
        {(() => {
          const phaseDetail = PHASES_INFO.find((p) => p.phase === selectedPhase)!;
          return (
            <View style={[styles.phaseDetailCard, { backgroundColor: phaseDetail.bgColor }]}>
              <View style={styles.phaseDetailHeader}>
                <Text style={[styles.phaseDetailTitle, { color: phaseDetail.color }]}>
                  {phaseDetail.title} ({phaseDetail.days})
                </Text>
              </View>
              <Text style={styles.phaseDetailGuidance}>{phaseDetail.guidance}</Text>

              <Text style={styles.suppliesLabel}>Recommended Bag Packing:</Text>
              <View style={styles.suppliesList}>
                {phaseDetail.supplies.map((sup, idx) => (
                  <View key={idx} style={styles.supplyBadge}>
                    <CheckCircle2 size={12} color={phaseDetail.color} />
                    <Text style={styles.supplyText}>{sup}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        {/* Symptom & Wellness Logger */}
        <Text style={styles.sectionHeader}>Quick Symptom Logging</Text>
        <View style={styles.symptomGrid}>
          {[
            { label: 'Mild Cramps', icon: Activity },
            { label: 'Moderate Cramps', icon: Flame },
            { label: 'Low Energy', icon: Heart },
            { label: 'Hydration Deficit', icon: Droplets },
          ].map((symp, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.symptomCard}
              onPress={() => logCycleSymptom(symp.label)}
            >
              <symp.icon size={16} color={Colors.cognacAmber} />
              <Text style={styles.symptomLabel}>{symp.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Senti Caring Companion Card */}
        <View style={styles.sentiCard}>
          <Image
            source={SentiAvatars['05_love']}
            style={styles.sentiImage}
            resizeMode="contain"
          />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.sentiTitle}>Empathetic Senti Ally</Text>
            <Text style={styles.sentiBody}>
              I monitor your schedule against your body's rhythm, discreetly prompting essentials 48 hours prior and warming your bag when fatigue strikes.
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
          <ShieldCheck size={20} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.privacyHeading}>100% Solo-Confidential Data</Text>
            <Text style={styles.privacyText}>
              Your cycle telemetry is stored exclusively on this device with biometric encryption. It is permanently excluded from Friends Mode, Group Tribes, and third-party networks.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  cycleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  ringOuter: {
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 8,
    borderColor: '#FCE7F3',
    borderTopColor: '#BE185D',
    borderRightColor: '#BE185D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  ringInner: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleDaysRemaining: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F1F1A',
    lineHeight: 32,
    textAlign: 'center',
    marginTop: 2,
    includeFontPadding: false,
  },
  cycleDaysLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  phasePill: {
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  phasePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  phaseDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  syncBagCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
    gap: 8,
  },
  syncBagCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  hardwareHeatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  hardwareHeatCardActive: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  heatCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heatIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatIconCircleActive: {
    backgroundColor: '#FEE2E2',
  },
  heatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tempBadge: {
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  tempBadgeActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  tempBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.cognacAmber,
  },
  tempBadgeTextActive: {
    color: '#B91C1C',
  },
  heatSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  heatActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  heatTimerText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  heatTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cognacAmber,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    gap: 6,
  },
  heatTriggerBtnActive: {
    backgroundColor: '#B91C1C',
  },
  heatTriggerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  phaseSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  phaseTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  phaseTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phaseTabDays: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  phaseDetailCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: 180,
  },
  phaseDetailHeader: {
    marginBottom: 4,
  },
  phaseDetailTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  phaseDetailGuidance: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  suppliesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  suppliesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  supplyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  supplyText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  symptomCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.subtle,
  },
  symptomLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sentiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E7',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginVertical: Spacing.sm,
    ...Shadows.subtle,
  },
  sentiImage: {
    width: 48,
    height: 48,
  },
  sentiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
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
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bellIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.canvasWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: Colors.primary,
  },
  switchOff: {
    backgroundColor: Colors.cardAccentBorder,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FAF6EE',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  privacyHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  privacyText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
