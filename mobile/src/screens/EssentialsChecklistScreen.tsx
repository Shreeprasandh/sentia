import React, { useState, useEffect } from 'react';
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
  CloudRain,
  Sun,
  Wind,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { EssentialItem, ChecklistPreset } from '../types';
import { useCircle } from '../context/CircleContext';
import { SentiAvatars } from '../assets/mascotMap';
import {
  getSmartWeather,
  getWeatherPackingInsight,
  WeatherPackingInsight,
} from '../services/weather';

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

  // 3-Step Creation Wizard State (Name -> Items -> Schedule)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('briefcase');
  const [wizardItems, setWizardItems] = useState<EssentialItem[]>([]);
  const [wizardItemName, setWizardItemName] = useState('');
  const [wizardItemCat, setWizardItemCat] = useState<'electronics' | 'documents' | 'health' | 'hygiene' | 'other'>('electronics');
  const [wizardItemCrit, setWizardItemCrit] = useState(false);
  const [wizardScheduledDays, setWizardScheduledDays] = useState<number[]>([]);
  const [wizardAlertTime, setWizardAlertTime] = useState('08:00 AM');
  const [wizardSpecificDate, setWizardSpecificDate] = useState('');

  // New Item Form State (for adding directly to active list)
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'electronics' | 'documents' | 'health' | 'hygiene' | 'other'>('other');
  const [newItemCritical, setNewItemCritical] = useState(false);

  // Schedule Modal State (for active or explicitly selected preset)
  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];
  const [schedulingPresetId, setSchedulingPresetId] = useState<string | null>(null);
  const targetSchedulePreset = presets.find((p) => p.id === (schedulingPresetId || activePresetId)) || activePreset;
  const [scheduledDays, setScheduledDays] = useState<number[]>(targetSchedulePreset?.scheduledDays || []);
  const [alertTime, setAlertTime] = useState<string>(targetSchedulePreset?.alertTime || '08:00 AM');
  const [specificDate, setSpecificDate] = useState<string>(targetSchedulePreset?.specificDate || '');

  // Weather Autonomous Intelligence State
  const [weatherInsight, setWeatherInsight] = useState<WeatherPackingInsight | null>(null);

  useEffect(() => {
    getSmartWeather().then((w) => {
      setWeatherInsight(getWeatherPackingInsight(w));
    });
  }, []);

  const isWeatherItemAlreadyAdded = weatherInsight
    ? activeItems.some((i) =>
        i.item_name.toLowerCase().includes(weatherInsight.suggestedItem.toLowerCase())
      )
    : false;

  const handleAddWeatherItem = () => {
    if (!weatherInsight) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    addItemToActiveList(weatherInsight.suggestedItem, weatherInsight.category, true);
    Alert.alert(
      "Tomorrow's Manifest Synced",
      `${weatherInsight.suggestedItem} has been added to your smart bag manifest for tomorrow.`
    );
  };

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  const packedCount = activeItems.filter((i) => i.is_packed).length;
  const totalCount = activeItems.length;
  const allPacked = totalCount > 0 && packedCount === totalCount;

  const openScheduleForPreset = (presetId: string) => {
    const target = presets.find((p) => p.id === presetId) || activePreset;
    setSchedulingPresetId(target.id);
    setScheduledDays(target.scheduledDays || []);
    setAlertTime(target.alertTime || '08:00 AM');
    setSpecificDate(target.specificDate || '');
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    schedulePreset(targetSchedulePreset.id, scheduledDays, specificDate.trim() || undefined, alertTime.trim());
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

  const toggleWizardDaySelection = (dayIndex: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setWizardScheduledDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleAddWizardItem = () => {
    if (!wizardItemName.trim()) return;
    const newItem: EssentialItem = {
      id: `wiz-item-${Date.now()}`,
      user_id: 'user-01',
      bag_id: 'bag-01',
      item_name: wizardItemName.trim(),
      category: wizardItemCat,
      is_packed: false,
      is_critical: wizardItemCrit,
      auto_reset_daily: true,
      created_at: new Date().toISOString(),
    };
    setWizardItems((prev) => [...prev, newItem]);
    setWizardItemName('');
    setWizardItemCrit(false);
  };

  const handleLoadStandardKit = () => {
    const standardKit: EssentialItem[] = [
      {
        id: `wiz-item-${Date.now()}-1`,
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Laptop & Magnetic USB-C Charger',
        category: 'electronics',
        is_packed: false,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: `wiz-item-${Date.now()}-2`,
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Smart Hydration Flask',
        category: 'health',
        is_packed: false,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: `wiz-item-${Date.now()}-3`,
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Biometric Access Keycard',
        category: 'documents',
        is_packed: false,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
    ];
    setWizardItems((prev) => [...prev, ...standardKit]);
  };

  const handleRemoveWizardItem = (id: string) => {
    setWizardItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFinishWizard = () => {
    if (!newPresetName.trim()) {
      Alert.alert('Name Required', 'Please provide a name for your custom packing preset.');
      return;
    }
    const success = createPreset(
      newPresetName.trim(),
      newPresetIcon,
      wizardItems.length > 0 ? wizardItems : undefined,
      {
        days: wizardScheduledDays,
        alertTime: wizardAlertTime,
        specificDate: wizardSpecificDate.trim() || undefined,
      }
    );
    if (success) {
      setNewPresetName('');
      setWizardItems([]);
      setWizardStep(1);
      setWizardScheduledDays([]);
      setShowNewPresetModal(false);
    }
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
            <View style={styles.activeBannerInfo}>
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
              {!activePreset?.isDefault ? (
                <TouchableOpacity
                  style={styles.makeDefaultBtn}
                  onPress={() => setDefaultPreset(activePreset.id)}
                  activeOpacity={0.8}
                >
                  <Star size={11} color={Colors.cognacAmber} />
                  <Text style={styles.makeDefaultText}>Set Default</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.activeDefaultFixedPill}>
                  <Star size={11} color={Colors.cognacAmber} fill={Colors.cognacAmber} />
                  <Text style={styles.activeDefaultFixedText}>Active Default</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.schedulePresetBtn}
                onPress={() => openScheduleForPreset(activePreset.id)}
                activeOpacity={0.8}
              >
                <Clock size={13} color={Colors.cognacAmber} />
              </TouchableOpacity>

              {presets.length > 1 && !activePreset?.isDefault && (
                <TouchableOpacity
                  style={styles.deletePresetBtn}
                  onPress={() => {
                    Alert.alert(
                      'Delete Preset',
                      `Are you sure you want to delete "${activePreset.name}"?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deletePreset(activePreset.id) },
                      ]
                    );
                  }}
                  activeOpacity={0.8}
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
              <Text style={styles.sentiSuccessTitle}>Departure Ready • Manifest Complete</Text>
              <Text style={styles.sentiSuccessBody}>
                All {totalCount} essentials are packed. Your Sentia smart pack is armed and ready.
              </Text>
            </View>
          </View>
        )}

        {/* Autonomous Weather Packing Advisory */}
        {weatherInsight && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherCardTop}>
              <View style={styles.weatherCardBadge}>
                {weatherInsight.type === 'rain' ? (
                  <CloudRain size={12} color="#FAF6EE" style={{ marginRight: 4 }} />
                ) : weatherInsight.type === 'sun' ? (
                  <Sun size={12} color="#FAF6EE" style={{ marginRight: 4 }} />
                ) : weatherInsight.type === 'cold' ? (
                  <Wind size={12} color="#FAF6EE" style={{ marginRight: 4 }} />
                ) : (
                  <Sparkles size={12} color="#FAF6EE" style={{ marginRight: 4 }} />
                )}
                <Text style={styles.weatherCardBadgeText}>{weatherInsight.badgeLabel}</Text>
              </View>
              <Text style={styles.weatherMetaText}>Senti Weather Telemetry</Text>
            </View>

            <Text style={styles.weatherHeadline}>{weatherInsight.headline}</Text>
            <Text style={styles.weatherDesc}>{weatherInsight.description}</Text>

            <View style={styles.weatherActionRow}>
              <View style={styles.weatherItemTag}>
                <Text style={styles.weatherItemTagLabel}>RECOMMENDED ITEM</Text>
                <Text style={styles.weatherItemTagName}>{weatherInsight.suggestedItem}</Text>
              </View>

              {isWeatherItemAlreadyAdded ? (
                <View style={styles.weatherAddedPill}>
                  <CheckCircle2 size={13} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.weatherAddedText}>Added to Bag</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.weatherAddBtn}
                  onPress={handleAddWeatherItem}
                  activeOpacity={0.8}
                >
                  <Plus size={13} color="#FAF6EE" style={{ marginRight: 4 }} />
                  <Text style={styles.weatherAddBtnText}>Add to Tomorrow's Bag</Text>
                </TouchableOpacity>
              )}
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

      {/* Modal 1: 3-Step Wizard: Create Packing Preset (Name -> Items -> Schedule) */}
      <Modal visible={showNewPresetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <View style={styles.wizardStepBadge}>
                  <Text style={styles.wizardStepBadgeText}>
                    STEP {wizardStep} OF 3 • {wizardStep === 1 ? 'NAME & ICON' : wizardStep === 2 ? 'PACKING ITEMS' : 'DEPARTURE SCHEDULE'}
                  </Text>
                </View>
                <Text style={styles.modalTitle}>Create Packing Preset</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowNewPresetModal(false);
                  setWizardStep(1);
                }}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* STEP 1: Name & Icon */}
            {wizardStep === 1 && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.wizardBody}>
                <Text style={styles.modalSub}>
                  Give your custom preset a distinct identity (e.g. Boardroom Pitch, Studio Session, Weekend Getaway).
                </Text>

                <Text style={styles.fieldLabel}>Preset Name:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Boardroom Pitch"
                  placeholderTextColor={Colors.textTertiary}
                  value={newPresetName}
                  onChangeText={setNewPresetName}
                  maxLength={32}
                />

                <Text style={styles.fieldLabel}>Choose Icon Symbol:</Text>
                <View style={styles.iconSelectionRow}>
                  {[
                    { id: 'briefcase', label: 'Work', icon: Briefcase },
                    { id: 'luggage', label: 'Travel', icon: Luggage },
                    { id: 'dumbbell', label: 'Fitness', icon: Dumbbell },
                    { id: 'book', label: 'Study', icon: BookOpen },
                    { id: 'sparkles', label: 'Special', icon: Sparkles },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSelected = newPresetIcon === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.iconChip, isSelected && styles.iconChipSelected]}
                        onPress={() => setNewPresetIcon(item.id)}
                      >
                        <IconComp size={16} color={isSelected ? '#FAF6EE' : Colors.cognacAmber} />
                        <Text style={[styles.iconChipText, isSelected && styles.iconChipTextSelected]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => {
                    if (!newPresetName.trim()) {
                      Alert.alert('Name Required', 'Please enter a name for this preset before continuing.');
                      return;
                    }
                    setWizardStep(2);
                  }}
                >
                  <Text style={styles.modalConfirmBtnText}>Next: Add Gear Items (2 of 3)</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* STEP 2: Packing Items */}
            {wizardStep === 2 && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.wizardBody}>
                <Text style={styles.modalSub}>
                  Add the essential items that belong in this preset, or load standard kit.
                </Text>

                {/* Quick Helper Button */}
                <TouchableOpacity
                  style={styles.quickKitBtn}
                  onPress={handleLoadStandardKit}
                  activeOpacity={0.8}
                >
                  <Sparkles size={14} color={Colors.cognacAmber} />
                  <Text style={styles.quickKitBtnText}>Load Recommended Standard Kit (3 Items)</Text>
                </TouchableOpacity>

                {/* Inline Add Item Box */}
                <View style={styles.inlineAddBox}>
                  <Text style={styles.inlineAddTitle}>Add Item to Preset Manifest</Text>
                  <TextInput
                    style={styles.modalInputSmall}
                    placeholder="Item title (e.g. Noise Cancelling Headphones)"
                    placeholderTextColor={Colors.textTertiary}
                    value={wizardItemName}
                    onChangeText={setWizardItemName}
                  />

                  {/* Category Pills */}
                  <View style={styles.categoryPillRowSmall}>
                    {(['electronics', 'documents', 'health', 'hygiene', 'other'] as const).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.catPillSmall, wizardItemCat === cat && styles.catPillSmallActive]}
                        onPress={() => setWizardItemCat(cat)}
                      >
                        <Text style={[styles.catPillSmallText, wizardItemCat === cat && styles.catPillSmallTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.wizardItemActionsRow}>
                    <TouchableOpacity
                      style={styles.criticalToggleRowMini}
                      onPress={() => setWizardItemCrit(!wizardItemCrit)}
                    >
                      <View style={[styles.miniCheck, wizardItemCrit && styles.miniCheckActive]}>
                        {wizardItemCrit && <Check size={10} color="#FAF6EE" />}
                      </View>
                      <Text style={styles.criticalToggleTextMini}>Critical</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addMiniBtn}
                      onPress={handleAddWizardItem}
                      activeOpacity={0.8}
                    >
                      <Plus size={12} color="#FAF6EE" />
                      <Text style={styles.addMiniBtnText}>Add Item</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Items Manifest List */}
                <Text style={styles.fieldLabel}>Items in this Preset ({wizardItems.length}):</Text>
                {wizardItems.length === 0 ? (
                  <Text style={styles.emptyWizardItemsText}>
                    No items added yet. You can add items above or load the standard kit.
                  </Text>
                ) : (
                  wizardItems.map((item) => (
                    <View key={item.id} style={styles.wizardItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.wizardItemName}>{item.item_name}</Text>
                        <Text style={styles.wizardItemMeta}>
                          {item.category.toUpperCase()} {item.is_critical ? '• CRITICAL' : ''}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveWizardItem(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Trash2 size={14} color="#B91C1C" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                {/* Navigation Buttons */}
                <View style={styles.wizardNavRow}>
                  <TouchableOpacity
                    style={styles.wizardBackBtn}
                    onPress={() => setWizardStep(1)}
                  >
                    <Text style={styles.wizardBackBtnText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.wizardNextBtn}
                    onPress={() => setWizardStep(3)}
                  >
                    <Text style={styles.wizardNextBtnText}>Next: Schedule (3 of 3)</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* STEP 3: Schedule & Automation */}
            {wizardStep === 3 && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.wizardBody}>
                <Text style={styles.modalSub}>
                  Set departure reminder alerts and automated recurring days for {newPresetName}.
                </Text>

                <Text style={styles.fieldLabel}>Automate on Days of Week:</Text>
                <View style={styles.daysRow}>
                  {DAY_LABELS.map((label, idx) => {
                    const isSelected = wizardScheduledDays.includes(idx);
                    return (
                      <TouchableOpacity
                        key={label}
                        style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                        onPress={() => toggleWizardDaySelection(idx)}
                      >
                        <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>Departure Reminder Time:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 08:00 AM"
                  placeholderTextColor={Colors.textTertiary}
                  value={wizardAlertTime}
                  onChangeText={setWizardAlertTime}
                />

                <Text style={styles.fieldLabel}>Specific One-Off Date (Optional YYYY-MM-DD):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2026-10-24"
                  placeholderTextColor={Colors.textTertiary}
                  value={wizardSpecificDate}
                  onChangeText={setWizardSpecificDate}
                />

                {/* Navigation Buttons */}
                <View style={styles.wizardNavRow}>
                  <TouchableOpacity
                    style={styles.wizardBackBtn}
                    onPress={() => setWizardStep(2)}
                  >
                    <Text style={styles.wizardBackBtnText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.wizardFinishBtn}
                    onPress={handleFinishWizard}
                  >
                    <Check size={14} color="#FAF6EE" />
                    <Text style={styles.wizardFinishBtnText}>Create & Activate Preset</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal 2: Schedule Days & Alert Time with Selected Target Indicator */}
      <Modal visible={showScheduleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Preset Automation</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Selected Target Preset Indicator */}
            <View style={styles.scheduleTargetIndicator}>
              <View style={styles.scheduleIndicatorTop}>
                <View style={styles.scheduleBadgeRow}>
                  <View style={styles.scheduleTargetDot} />
                  <Text style={styles.scheduleTargetBadgeText}>CONFIGURING AUTOMATION</Text>
                </View>
                {targetSchedulePreset?.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </View>
              <Text style={styles.scheduleTargetName}>Editing: {targetSchedulePreset?.name}</Text>
              <Text style={styles.scheduleTargetSub}>
                Departure reminder and schedule days will apply directly to this preset.
              </Text>
            </View>

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
  activeBannerInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  activeBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDefaultFixedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 8,
    height: 28,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    gap: 4,
  },
  activeDefaultFixedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  makeDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 8,
    height: 28,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    gap: 4,
  },
  makeDefaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  schedulePresetBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF3E7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  deletePresetBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
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
  weatherCard: {
    backgroundColor: Colors.cardAccent,
    borderRadius: 18,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.subtle,
  },
  weatherCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weatherCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  weatherCardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FAF6EE',
    letterSpacing: 0.6,
  },
  weatherMetaText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  weatherHeadline: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  weatherDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  weatherActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 12,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  weatherItemTag: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  weatherItemTagLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  weatherItemTagName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  weatherAddedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasWarm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  weatherAddedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  weatherAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  weatherAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EE',
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
  wizardStepBadge: {
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  wizardStepBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.cognacAmber,
    letterSpacing: 0.8,
  },
  wizardBody: {
    paddingBottom: Spacing.xl,
  },
  iconSelectionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#FAF3E7',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  iconChipSelected: {
    backgroundColor: Colors.cognacAmber,
    borderColor: Colors.cognacAmber,
  },
  iconChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  iconChipTextSelected: {
    color: '#FAF6EE',
    fontWeight: '700',
  },
  quickKitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAF3E7',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginBottom: Spacing.md,
  },
  quickKitBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  inlineAddBox: {
    backgroundColor: '#FAF3E7',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginBottom: Spacing.md,
  },
  inlineAddTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalInputSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginBottom: 6,
  },
  categoryPillRowSmall: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  catPillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  catPillSmallActive: {
    backgroundColor: Colors.cognacAmber,
    borderColor: Colors.cognacAmber,
  },
  catPillSmallText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  catPillSmallTextActive: {
    color: '#FAF6EE',
  },
  wizardItemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  criticalToggleRowMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  criticalToggleTextMini: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.cognacAmber,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addMiniBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  emptyWizardItemsText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  wizardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EADC',
  },
  wizardItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  wizardItemMeta: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  wizardNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: Spacing.lg,
  },
  wizardBackBtn: {
    flex: 1,
    backgroundColor: '#FAF3E7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  wizardBackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  wizardNextBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  wizardNextBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  wizardFinishBtn: {
    flex: 2,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  wizardFinishBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  scheduleTargetIndicator: {
    backgroundColor: '#FAF3E7',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginBottom: Spacing.md,
  },
  scheduleIndicatorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleTargetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.cognacAmber,
  },
  scheduleTargetBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.cognacAmber,
    letterSpacing: 0.8,
  },
  scheduleTargetName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scheduleTargetSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
