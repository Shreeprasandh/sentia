import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Calendar,
  Clock,
  Trash2,
  Settings2,
  Briefcase,
  X,
  Luggage,
  Dumbbell,
  BookOpen,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { EssentialItem, ChecklistPreset } from '../types';
import { useCircle } from '../context/CircleContext';
import { SentiAvatars } from '../assets/mascotMap';

interface EssentialsChecklistScreenProps {
  onBack: () => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const EssentialsChecklistScreen: React.FC<EssentialsChecklistScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const {
    presets,
    activePresetId,
    defaultPresetId,
    activeItems,
    createPreset,
    updatePreset,
    deletePreset,
    setDefaultPreset,
    activatePreset,
    schedulePreset,
    toggleItemPacked,
    addItemToActiveList,
    removeItemFromActiveList,
    resetActiveItems,
  } = useCircle();

  const [showNewPresetModal, setShowNewPresetModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // New Preset Form State
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('briefcase');

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'electronics' | 'documents' | 'health' | 'hygiene' | 'other'>('other');
  const [newItemCritical, setNewItemCritical] = useState(false);

  // Schedule Modal State (for active preset)
  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];
  const [scheduledDays, setScheduledDays] = useState<number[]>(activePreset?.scheduledDays || []);
  const [alertTime, setAlertTime] = useState<string>(activePreset?.alertTime || '08:00 AM');
  const [specificDate, setSpecificDate] = useState<string>(activePreset?.specificDate || '');

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  const packedCount = activeItems.filter((i) => i.is_packed).length;
  const totalCount = activeItems.length;
  const allPacked = totalCount > 0 && packedCount === totalCount;

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) {
      Alert.alert('Name Required', 'Please provide a name for your custom packing preset.');
      return;
    }
    const success = createPreset(newPresetName.trim(), newPresetIcon);
    if (success) {
      setNewPresetName('');
      setShowNewPresetModal(false);
    }
  };

  const handleSaveSchedule = () => {
    schedulePreset(activePreset.id, scheduledDays, specificDate.trim() || undefined, alertTime.trim());
    setShowScheduleModal(false);
  };

  const toggleDaySelection = (dayIndex: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setScheduledDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim()) return;
    addItemToActiveList(newItemName.trim(), newItemCategory, newItemCritical);
    setNewItemName('');
    setShowAddItemModal(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} translucent={true} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Packing Presets & Gear</Text>
          <Text style={styles.headerSubtitle}>
            {presets.length} of 10 presets configured
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowScheduleModal(true)}
          style={styles.settingsButton}
        >
          <Settings2 size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preset Pill Carousel (Max 10 Custom User Presets) */}
        <View style={styles.presetsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsPillRow}
          >
            {presets.map((preset) => {
              const isActive = preset.id === activePresetId;
              const isDefault = preset.id === defaultPresetId;

              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetPill,
                    isActive && styles.presetPillActive,
                  ]}
                  onPress={() => activatePreset(preset.id)}
                >
                  <View style={styles.presetPillTop}>
                    {isDefault && (
                      <Star size={11} color={isActive ? '#FAF6EE' : Colors.cognacAmber} fill={isActive ? '#FAF6EE' : Colors.cognacAmber} style={{ marginRight: 4 }} />
                    )}
                    <Text
                      style={[
                        styles.presetPillText,
                        isActive && styles.presetPillTextActive,
                      ]}
                    >
                      {preset.name}
                    </Text>
                  </View>

                  {preset.scheduledDays.length > 0 && (
                    <Text
                      style={[
                        styles.presetPillSub,
                        isActive && styles.presetPillSubActive,
                      ]}
                    >
                      {preset.scheduledDays.map((d) => DAY_LABELS[d]).join(', ')}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Create New Preset Button (up to 10) */}
            {presets.length < 10 && (
              <TouchableOpacity
                style={styles.addPresetPill}
                onPress={() => setShowNewPresetModal(true)}
              >
                <Plus size={14} color={Colors.primary} />
                <Text style={styles.addPresetPillText}>New Preset</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Active Preset Status Banner */}
        <View style={styles.activeBannerCard}>
          <View style={styles.activeBannerTop}>
            <View>
              <View style={styles.activeTitleRow}>
                <Text style={styles.activePresetTitle}>{activePreset?.name}</Text>
                {activePreset?.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </View>
              <Text style={styles.activePresetAlert}>
                Departure Reminder: {activePreset?.alertTime || '08:00 AM'}
                {activePreset?.scheduledDays.length ? ` • Scheduled: ${activePreset.scheduledDays.map((d) => DAY_LABELS[d]).join(', ')}` : ''}
              </Text>
            </View>

            <View style={styles.activeBannerActions}>
              {!activePreset?.isDefault && (
                <TouchableOpacity
                  style={styles.makeDefaultBtn}
                  onPress={() => setDefaultPreset(activePreset.id)}
                >
                  <Star size={12} color={Colors.cognacAmber} />
                  <Text style={styles.makeDefaultText}>Set Default</Text>
                </TouchableOpacity>
              )}
              {presets.length > 1 && (
                <TouchableOpacity
                  style={styles.deletePresetBtn}
                  onPress={() => deletePreset(activePreset.id)}
                >
                  <Trash2 size={13} color="#B91C1C" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Packing Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Bag Packing Progress</Text>
              <Text style={styles.progressSubtitle}>
                {packedCount} of {totalCount} essentials verified inside bag
              </Text>
            </View>
            <TouchableOpacity onPress={resetActiveItems} style={styles.resetButton}>
              <RotateCcw size={14} color={Colors.textSecondary} />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: totalCount > 0 ? `${(packedCount / totalCount) * 100}%` : '0%' },
                allPacked && { backgroundColor: Colors.statusSuccess },
              ]}
            />
          </View>
        </View>

        {/* Mascot Feedback Card */}
        {allPacked && (
          <View style={styles.sentiSuccessCard}>
            <Image
              source={SentiAvatars['01_happy']}
              style={styles.sentiImage}
              resizeMode="contain"
            />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.sentiSuccessTitle}>Departure Ready ✨</Text>
              <Text style={styles.sentiSuccessBody}>
                All {totalCount} essentials are packed. Your Sentia smart pack is armed and ready.
              </Text>
            </View>
          </View>
        )}

        {/* Items List Section Header */}
        <View style={styles.itemsSectionHeader}>
          <Text style={styles.itemsSectionTitle}>Checklist Items ({totalCount})</Text>
          <TouchableOpacity
            style={styles.addItemBtn}
            onPress={() => setShowAddItemModal(true)}
          >
            <Plus size={14} color="#FAF6EE" />
            <Text style={styles.addItemBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <View style={styles.itemsList}>
          {activeItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <TouchableOpacity
                onPress={() => toggleItemPacked(item.id)}
                style={styles.itemCheckboxWrapper}
              >
                <View style={[styles.checkbox, item.is_packed && styles.checkboxChecked]}>
                  {item.is_packed && <Check size={14} color="#FAF6EE" strokeWidth={3} />}
                </View>
                <View style={styles.itemTextContainer}>
                  <Text
                    style={[
                      styles.itemName,
                      item.is_packed && styles.itemNamePacked,
                    ]}
                  >
                    {item.item_name}
                  </Text>
                  <View style={styles.itemBadgeRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {item.category.toUpperCase()}
                      </Text>
                    </View>
                    {item.is_critical && (
                      <View style={styles.criticalBadge}>
                        <Text style={styles.criticalBadgeText}>CRITICAL</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeItemFromActiveList(item.id)}
                style={styles.deleteItemBtn}
              >
                <Trash2 size={14} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal 1: Create New Preset (Max 10) */}
      <Modal visible={showNewPresetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Packing Preset</Text>
              <TouchableOpacity onPress={() => setShowNewPresetModal(false)}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Build a customized gear preset for specific routines, trips, or days.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Boardroom Pitch, Studio Session, Weekend Hike"
              placeholderTextColor={Colors.textTertiary}
              value={newPresetName}
              onChangeText={setNewPresetName}
              maxLength={32}
            />

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCreatePreset}>
              <Text style={styles.modalConfirmBtnText}>Save Preset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Schedule Days & Alert Time */}
      <Modal visible={showScheduleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Preset Automation</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Assign {activePreset?.name} to specific days of the week or calendar dates.
            </Text>

            {/* Day of Week Selector */}
            <Text style={styles.fieldLabel}>Automate on Days of Week:</Text>
            <View style={styles.daysRow}>
              {DAY_LABELS.map((label, idx) => {
                const isSelected = scheduledDays.includes(idx);
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                    onPress={() => toggleDaySelection(idx)}
                  >
                    <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Alert Time Input */}
            <Text style={styles.fieldLabel}>Departure Reminder Time:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 08:15 AM"
              placeholderTextColor={Colors.textTertiary}
              value={alertTime}
              onChangeText={setAlertTime}
            />

            {/* Specific Date Input */}
            <Text style={styles.fieldLabel}>Specific One-Off Date (Optional YYYY-MM-DD):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 2026-10-24"
              placeholderTextColor={Colors.textTertiary}
              value={specificDate}
              onChangeText={setSpecificDate}
            />

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSaveSchedule}>
              <Text style={styles.modalConfirmBtnText}>Apply Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Add Item */}
      <Modal visible={showAddItemModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Essential Item</Text>
              <TouchableOpacity onPress={() => setShowAddItemModal(false)}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Item name (e.g. Wireless Mouse, Passport)"
              placeholderTextColor={Colors.textTertiary}
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <Text style={styles.fieldLabel}>Category:</Text>
            <View style={styles.categoryPillRow}>
              {(['electronics', 'documents', 'health', 'hygiene', 'other'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPill,
                    newItemCategory === cat && styles.catPillActive,
                  ]}
                  onPress={() => setNewItemCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      newItemCategory === cat && styles.catPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.criticalToggleRow}
              onPress={() => setNewItemCritical(!newItemCritical)}
            >
              <View style={[styles.miniCheck, newItemCritical && styles.miniCheckActive]}>
                {newItemCritical && <Check size={12} color="#FAF6EE" />}
              </View>
              <Text style={styles.criticalToggleText}>Mark as Critical Essential</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAddNewItem}>
              <Text style={styles.modalConfirmBtnText}>Add to Preset</Text>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvasElevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  headerTitleContainer: {
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
  presetsSection: {
    marginVertical: Spacing.sm,
  },
  presetsPillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  presetPill: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.subtle,
  },
  presetPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetPillTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  presetPillTextActive: {
    color: '#FAF6EE',
  },
  presetPillSub: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  presetPillSubActive: {
    color: '#E6F4EA',
  },
  addPresetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasWarm,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    gap: 4,
  },
  addPresetPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  activeBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginVertical: Spacing.sm,
    ...Shadows.card,
  },
  activeBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activePresetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.cognacAmber,
    letterSpacing: 0.5,
  },
  activePresetAlert: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  activeBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  makeDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  makeDefaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  deletePresetBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.canvasWarm,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  resetButtonText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.canvasWarm,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  sentiSuccessCard: {
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
  sentiSuccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  sentiSuccessBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  addItemBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  itemsList: {
    gap: Spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.subtle,
  },
  itemCheckboxWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemNamePacked: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  itemBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: Colors.canvasWarm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  criticalBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  criticalBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B91C1C',
  },
  deleteItemBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.canvasElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  modalInput: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  modalConfirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FAF6EE',
    fontWeight: '700',
    fontSize: 13,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvasWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dayButtonTextSelected: {
    color: '#FAF6EE',
    fontWeight: '700',
  },
  categoryPillRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.canvasWarm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  catPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#FAF6EE',
  },
  criticalToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  miniCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCheckActive: {
    backgroundColor: '#B91C1C',
    borderColor: '#B91C1C',
  },
  criticalToggleText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
});
