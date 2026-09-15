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
  Check,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { EssentialItem } from '../types';
import { SentiAvatars } from '../assets/mascotMap';

interface EssentialsChecklistScreenProps {
  onBack: () => void;
}

const INITIAL_ITEMS: EssentialItem[] = [
  {
    id: 'item-1',
    user_id: 'user-01',
    bag_id: 'bag-01',
    item_name: 'MacBook Pro & Charger',
    category: 'electronics',
    is_packed: true,
    is_critical: true,
    auto_reset_daily: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    user_id: 'user-01',
    bag_id: 'bag-01',
    item_name: 'House & Car Keys',
    category: 'other',
    is_packed: true,
    is_critical: true,
    auto_reset_daily: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-3',
    user_id: 'user-01',
    bag_id: 'bag-01',
    item_name: 'Sentia Smart Hydration Bottle',
    category: 'health',
    is_packed: true,
    is_critical: true,
    auto_reset_daily: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-4',
    user_id: 'user-01',
    bag_id: 'bag-01',
    item_name: 'Compact Travel Umbrella',
    category: 'other',
    is_packed: false,
    is_critical: false,
    auto_reset_daily: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-5',
    user_id: 'user-01',
    bag_id: 'bag-01',
    item_name: 'Passport & Office Keycard',
    category: 'documents',
    is_packed: true,
    is_critical: true,
    auto_reset_daily: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-6',
    user_id: 'user-01',
    bag_id: 'bag-01',
    item_name: 'Sanitary Care Pouch (48h Sync)',
    category: 'hygiene',
    is_packed: true,
    is_critical: false,
    auto_reset_daily: false,
    created_at: new Date().toISOString(),
  },
];

export const EssentialsChecklistScreen: React.FC<EssentialsChecklistScreenProps> = ({ onBack }) => {
  const [items, setItems] = useState<EssentialItem[]>(INITIAL_ITEMS);

  const togglePacked = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_packed: !item.is_packed } : item
      )
    );
  };

  const packedCount = items.filter((i) => i.is_packed).length;
  const progressPct = Math.round((packedCount / items.length) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Essentials</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {}
            setItems((prev) => prev.map((i) => ({ ...i, is_packed: false })));
          }}
        >
          <RotateCcw size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Senti Mascot Banner */}
        <View style={styles.sentiBanner}>
          <Image
            source={SentiAvatars[packedCount === items.length ? '20_celebrating' : '23_idea']}
            style={styles.sentiAvatar}
            resizeMode="contain"
          />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.sentiBannerTitle}>
              {packedCount === items.length
                ? 'All Set for Departure!'
                : `${items.length - packedCount} items remaining`}
            </Text>
            <Text style={styles.sentiBannerSubtitle}>
              {packedCount === items.length
                ? "Your bag is completely packed. Have a wonderful day!"
                : 'Smart daily reset active. Don’t forget your umbrella today.'}
            </Text>
          </View>
        </View>

        {/* Progress Bar Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Packing Readiness</Text>
            <Text style={styles.progressValue}>
              {packedCount} / {items.length} ({progressPct}%)
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPct}%` },
              ]}
            />
          </View>
        </View>

        {/* Items List */}
        <Text style={styles.sectionHeader}>Checklist</Text>

        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.itemRow,
              item.is_packed && styles.itemRowPacked,
            ]}
            onPress={() => togglePacked(item.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                item.is_packed ? styles.checkboxChecked : styles.checkboxUnchecked,
              ]}
            >
              {item.is_packed && <Check size={14} color="#FAF6EE" strokeWidth={3} />}
            </View>

            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text
                style={[
                  styles.itemName,
                  item.is_packed && styles.itemNamePacked,
                ]}
              >
                {item.item_name}
              </Text>
              <Text style={styles.itemCategory}>
                {item.category.toUpperCase()} • {item.is_critical ? 'Critical' : 'Optional'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Sparkles size={16} color={Colors.primary} />
          <Text style={styles.infoNoteText}>
            Essentials reset automatically every morning at 06:00 AM.
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
  sentiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.subtle,
    marginBottom: Spacing.md,
  },
  sentiAvatar: {
    width: 54,
    height: 54,
  },
  sentiBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sentiBannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  progressCard: {
    backgroundColor: Colors.canvasWarm,
    borderRadius: 18,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EEDCC0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.subtle,
  },
  itemRowPacked: {
    backgroundColor: '#F7F4EC',
    opacity: 0.85,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkboxUnchecked: {
    borderWidth: 1.5,
    borderColor: '#C2B092',
    backgroundColor: '#FAF6EE',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemNamePacked: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  itemCategory: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  infoNoteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
});
