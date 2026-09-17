import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  X,
  Sparkles,
  Smartphone,
  Layers,
  Palette,
  Smile,
  Check,
  ExternalLink,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';
import {
  SentiaWidget2x2,
  SentiaWidget4x4,
  WidgetTheme,
} from '../widgets/SentiaWidgetSuite';
import { SentiMood } from '../types';

interface WidgetStudioModalProps {
  visible: boolean;
  onClose: () => void;
  onLaunchVoice?: () => void;
}

const PREVIEW_MOODS: { key: SentiMood; label: string }[] = [
  { key: '01_happy', label: 'Happy' },
  { key: '03_excited', label: 'Excited' },
  { key: '08_cool', label: 'Guarded' },
  { key: '09_curious', label: 'Curious' },
  { key: '13_sleepy', label: 'Sleepy' },
  { key: '19_working', label: 'Focus' },
  { key: '21_relaxed', label: 'Relaxed' },
];

export const WidgetStudioModal: React.FC<WidgetStudioModalProps> = ({
  visible,
  onClose,
  onLaunchVoice,
}) => {
  const { bags, activeBagId, activeBag, activeTelemetry, openSentiChat, toggleBagLock } = useCircle();
  const currentBag = activeBag || bags[0];
  const isLocked = activeTelemetry?.is_locked ?? true;
  const toggleLock = () => toggleBagLock(activeBagId);
  const batteryLevel = activeTelemetry?.battery_level ?? currentBag?.battery ?? 84;
  const weightKg = activeTelemetry?.weight_kg ?? 3.4;

  const [widgetSize, setWidgetSize] = useState<'2x2' | '4x4'>('2x2');
  const [theme, setTheme] = useState<WidgetTheme>('cream');
  const [selectedMood, setSelectedMood] = useState<SentiMood>('01_happy');

  const handleSelectSize = (size: '2x2' | '4x4') => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setWidgetSize(size);
  };

  const handleSelectTheme = (t: WidgetTheme) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setTheme(t);
  };

  const handleSelectMood = (m: SentiMood) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedMood(m);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />

        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Android Home Screen Widget</Text>
            <Text style={styles.subtitle}>Living Senti companion & telemetry glance</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <X size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Widget Size Segmented Control */}
          <View style={styles.segmentedWrapper}>
            <TouchableOpacity
              style={[
                styles.segmentTab,
                widgetSize === '2x2' && styles.segmentTabActive,
              ]}
              onPress={() => handleSelectSize('2x2')}
              activeOpacity={0.85}
            >
              <Smartphone size={15} color={widgetSize === '2x2' ? Colors.primary : Colors.textSecondary} />
              <Text
                style={[
                  styles.segmentTabText,
                  widgetSize === '2x2' && styles.segmentTabTextActive,
                ]}
              >
                2x2 Living Aura
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentTab,
                widgetSize === '4x4' && styles.segmentTabActive,
              ]}
              onPress={() => handleSelectSize('4x4')}
              activeOpacity={0.85}
            >
              <Layers size={15} color={widgetSize === '4x4' ? Colors.primary : Colors.textSecondary} />
              <Text
                style={[
                  styles.segmentTabText,
                  widgetSize === '4x4' && styles.segmentTabTextActive,
                ]}
              >
                4x4 Command Pod
              </Text>
            </TouchableOpacity>
          </View>

          {/* Live Launcher Simulation Canvas */}
          <View style={styles.previewCanvas}>
            <View style={styles.canvasWallpaperGrid}>
              {widgetSize === '2x2' ? (
                <SentiaWidget2x2
                  mood={selectedMood}
                  batteryLevel={batteryLevel}
                  isLocked={isLocked}
                  theme={theme}
                  statusMessage={
                    selectedMood === '13_sleepy'
                      ? 'Quiet Hours Rest'
                      : selectedMood === '19_working'
                      ? 'Peak Focus Sprint'
                      : 'Guarded & Serene'
                  }
                  onPress={() => {
                    onClose();
                    openSentiChat('text');
                  }}
                />
              ) : (
                <SentiaWidget4x4
                  mood={selectedMood}
                  batteryLevel={batteryLevel}
                  isLocked={isLocked}
                  weightKg={weightKg}
                  theme={theme}
                  statusMessage="Pacing is steady, Sir."
                  onPress={() => {
                    onClose();
                    openSentiChat('text');
                  }}
                  onVoicePress={() => {
                    onClose();
                    if (onLaunchVoice) {
                      onLaunchVoice();
                    } else {
                      openSentiChat('voice');
                    }
                  }}
                  onLockToggle={toggleLock}
                />
              )}
            </View>
            <Text style={styles.previewCaption}>
              Live interactive preview • Tap widget to test launcher response
            </Text>
          </View>

          {/* Luxury Color Palette Switcher */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Palette size={16} color={Colors.primary} />
              <Text style={styles.sectionHeading}>Boutique Palette</Text>
            </View>
            <View style={styles.paletteRow}>
              {(
                [
                  { key: 'cream', label: 'Classic Canvas', hex: '#FAF6EE', border: '#DCD4C7' },
                  { key: 'emerald', label: 'British Emerald', hex: '#0B2317', border: '#1E4530' },
                  { key: 'obsidian', label: 'Matte Charcoal', hex: '#121417', border: '#262930' },
                ] as const
              ).map((pal) => {
                const isSelected = theme === pal.key;
                return (
                  <TouchableOpacity
                    key={pal.key}
                    style={[
                      styles.paletteCard,
                      isSelected && styles.paletteCardSelected,
                    ]}
                    onPress={() => handleSelectTheme(pal.key)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: pal.hex, borderColor: pal.border },
                      ]}
                    >
                      {isSelected && <Check size={12} color={pal.key === 'cream' ? '#064E3B' : '#FFFFFF'} />}
                    </View>
                    <Text style={[styles.paletteLabel, isSelected && styles.paletteLabelSelected]}>
                      {pal.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Mascot Emotion Selector */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Smile size={16} color={Colors.primary} />
              <Text style={styles.sectionHeading}>Companion Emotion</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodScroll}
            >
              {PREVIEW_MOODS.map((m) => {
                const isSelected = selectedMood === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.moodChip, isSelected && styles.moodChipSelected]}
                    onPress={() => handleSelectMood(m.key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.moodChipText, isSelected && styles.moodChipTextSelected]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Android Launcher Installation Guide */}
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>How to Place on Android Launcher</Text>
            <Text style={styles.guideStep}>
              1. Long-press any empty space on your Android Home Screen.
            </Text>
            <Text style={styles.guideStep}>
              2. Tap the <Text style={{ fontWeight: '700' }}>Widgets</Text> icon from the popup menu.
            </Text>
            <Text style={styles.guideStep}>
              3. Scroll down or search for <Text style={{ fontWeight: '700' }}>Sentia</Text>.
            </Text>
            <Text style={styles.guideStep}>
              4. Touch and hold the <Text style={{ fontWeight: '700' }}>{widgetSize === '2x2' ? 'Sentia Living Aura (2x2)' : 'Sentia Vanguard Pod (4x4)'}</Text> and drag it into position.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.cardAccent,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  segmentedWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.cardAccent,
    borderRadius: BorderRadius.pill,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
  },
  segmentTabActive: {
    backgroundColor: '#FAF6EE',
    ...Shadows.subtle,
  },
  segmentTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  previewCanvas: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#EAE5D9',
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#D8D0C0',
  },
  canvasWallpaperGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  previewCaption: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paletteCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  paletteCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.cardAccent,
  },
  colorSwatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  paletteLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  paletteLabelSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  moodScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  moodChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  moodChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  moodChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  moodChipTextSelected: {
    color: '#FAF6EE',
    fontWeight: '700',
  },
  guideCard: {
    backgroundColor: Colors.cardAccent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginBottom: Spacing.xl,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  guideStep: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});
