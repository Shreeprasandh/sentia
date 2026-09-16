import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Heart,
  Briefcase,
  Luggage,
  Shield,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';
import { CalendarEvent } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WallCalendarModalProps {
  visible: boolean;
  onClose: () => void;
}

const MONTH_IMAGES: Record<number, any> = {
  0: require('../../assets/calendar/1.jpg'),
  1: require('../../assets/calendar/2.jpg'),
  2: require('../../assets/calendar/3.jpg'),
  3: require('../../assets/calendar/4.jpg'),
  4: require('../../assets/calendar/5.jpg'),
  5: require('../../assets/calendar/6.jpg'),
  6: require('../../assets/calendar/7.jpg'),
  7: require('../../assets/calendar/8.jpg'),
  8: require('../../assets/calendar/9.jpg'),
  9: require('../../assets/calendar/10.jpg'),
  10: require('../../assets/calendar/11.jpg'),
  11: require('../../assets/calendar/12.jpg'),
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const WallCalendarModal: React.FC<WallCalendarModalProps> = ({ visible, onClose }) => {
  const {
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    toggleCalendarEventComplete,
    cycleData,
    presets,
  } = useCircle();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newCategory, setNewCategory] = useState<'task' | 'meeting' | 'travel' | 'health' | 'reminder'>('task');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate 42-day calendar grid (Mon start)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Mon, ..., 6 = Sun
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const daysGrid: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Padding days from prev month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = totalDaysInPrevMonth - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  // Days of current month
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    daysGrid.push({ dayNumber: i, dateStr, isCurrentMonth: true });
  }

  // Padding days to fill 42 cells (6 rows x 7 cols)
  const remaining = 42 - daysGrid.length;
  for (let i = 1; i <= remaining; i++) {
    const m = currentMonth === 11 ? 1 : currentMonth + 2;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    daysGrid.push({ dayNumber: i, dateStr, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to determine cycle phase on any date
  const getCycleIndicator = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    const day = targetDate.getDate();

    // Cycle simulation based on 28-day cycle starting around day 1
    if (day >= 1 && day <= 5) {
      return { type: 'menstrual', color: '#BE185D', label: 'Period' };
    }
    if (day >= 12 && day <= 16) {
      return { type: 'fertile', color: '#D97706', label: 'Fertile' };
    }
    if (day >= 17 && day <= 28) {
      return { type: 'luteal', color: '#064E3B', label: 'Luteal' };
    }
    return null;
  };

  const selectedDateEvents = calendarEvents.filter((e) => e.date === selectedDateStr);
  const selectedDateCycle = getCycleIndicator(selectedDateStr);

  // Find if a bag preset is scheduled for selected date
  const selectedDateObj = new Date(selectedDateStr);
  const selectedDayOfWeek = selectedDateObj.getDay();
  const matchedPreset = presets.find(
    (p) => p.specificDate === selectedDateStr || p.scheduledDays.includes(selectedDayOfWeek)
  );

  const handleCreateEvent = () => {
    if (!newTitle.trim()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    addCalendarEvent({
      title: newTitle.trim(),
      date: selectedDateStr,
      time: newTime,
      category: newCategory,
      attachedPresetId: matchedPreset?.id,
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          {/* Metallic Binder Rings Bar */}
          <View style={styles.binderBar}>
            {[1, 2, 3, 4, 5, 6].map((ring) => (
              <View key={ring} style={styles.ringHole}>
                <View style={styles.ringMetallic} />
              </View>
            ))}
          </View>

          {/* Calendar Header Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <X size={18} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                <ChevronLeft size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.monthTitleWrapper}>
                <Text style={styles.monthTitle}>
                  {MONTH_NAMES[currentMonth].toUpperCase()}
                </Text>
                <Text style={styles.yearTitle}>{currentYear}</Text>
              </View>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                <ChevronRight size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={{ width: 36 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Top Month Hero Artwork */}
            <View style={styles.heroArtworkWrapper}>
              <Image
                source={MONTH_IMAGES[currentMonth]}
                style={styles.heroArtwork}
                resizeMode="cover"
              />
              <View style={styles.artworkOverlay}>
                <Text style={styles.artworkMonthLabel}>
                  {MONTH_NAMES[currentMonth]} Season
                </Text>
                <Text style={styles.artworkQuote}>
                  {currentMonth === 8
                    ? 'Autumn equinox • Prepare your journey with clear intentions'
                    : 'Curated living, mindful essentials & daily harmony'}
                </Text>
              </View>
            </View>

            {/* Weekdays Header */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((wd) => (
                <Text key={wd} style={styles.weekdayLabel}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* 42-Cell Monthly Physical Grid */}
            <View style={styles.gridContainer}>
              {daysGrid.map((item, idx) => {
                const isSelected = item.dateStr === selectedDateStr;
                const isToday = item.dateStr === todayStr;
                const hasEvents = calendarEvents.some((e) => e.date === item.dateStr);
                const cycle = getCycleIndicator(item.dateStr);

                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                      setSelectedDateStr(item.dateStr);
                    }}
                    style={[
                      styles.cell,
                      isSelected && styles.cellSelected,
                      !item.isCurrentMonth && styles.cellMuted,
                    ]}
                  >
                    <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          isSelected && styles.selectedDayText,
                          !item.isCurrentMonth && styles.mutedDayText,
                        ]}
                      >
                        {item.dayNumber}
                      </Text>
                    </View>

                    {/* Indicator Dots */}
                    <View style={styles.indicatorRow}>
                      {/* Cycle Care Phase Dot */}
                      {cycle && (
                        <View
                          style={[styles.indicatorDot, { backgroundColor: cycle.color }]}
                        />
                      )}
                      {/* Scheduled Event Dot */}
                      {hasEvents && (
                        <View
                          style={[styles.indicatorDot, { backgroundColor: Colors.cognacAmber }]}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Selected Day Agenda & Tasks Sheet */}
            <View style={styles.agendaCard}>
              <View style={styles.agendaHeader}>
                <View>
                  <Text style={styles.agendaDateTitle}>
                    {new Date(selectedDateStr).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  {selectedDateCycle && (
                    <View style={styles.cycleBadge}>
                      <Heart size={12} color={selectedDateCycle.color} />
                      <Text style={[styles.cycleBadgeText, { color: selectedDateCycle.color }]}>
                        {selectedDateCycle.label} Phase
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.addEventBtn}
                  onPress={() => setShowAddForm(!showAddForm)}
                >
                  <Plus size={16} color="#FAF6EE" />
                  <Text style={styles.addEventBtnText}>Add Task</Text>
                </TouchableOpacity>
              </View>

              {/* Linked Bag Preset Info */}
              {matchedPreset && (
                <View style={styles.presetLinkBanner}>
                  <Briefcase size={14} color={Colors.primary} />
                  <Text style={styles.presetLinkText}>
                    Active Bag Preset: <Text style={{ fontWeight: '700' }}>{matchedPreset.name}</Text>
                  </Text>
                </View>
              )}

              {/* Add Event Form Modal / Accordion */}
              {showAddForm && (
                <View style={styles.addFormWrapper}>
                  <TextInput
                    style={styles.inputTitle}
                    placeholder="Event or Task Title..."
                    placeholderTextColor={Colors.textTertiary}
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />

                  <View style={styles.formRow}>
                    <TextInput
                      style={styles.inputTime}
                      placeholder="e.g. 09:30 AM"
                      placeholderTextColor={Colors.textTertiary}
                      value={newTime}
                      onChangeText={setNewTime}
                    />

                    {/* Category Selector */}
                    <View style={styles.categoryPills}>
                      {(['task', 'meeting', 'travel', 'health'] as const).map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryPill,
                            newCategory === cat && styles.categoryPillActive,
                          ]}
                          onPress={() => setNewCategory(cat)}
                        >
                          <Text
                            style={[
                              styles.categoryPillText,
                              newCategory === cat && styles.categoryPillTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formActionRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setShowAddForm(false)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={handleCreateEvent}
                    >
                      <Text style={styles.confirmBtnText}>Save to Horizon</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Event / Task List */}
              <View style={styles.taskList}>
                {selectedDateEvents.length === 0 ? (
                  <Text style={styles.emptyAgendaText}>
                    No scheduled events for this date. Tap "+ Add Task" to set departures, meetings, or packing reminders.
                  </Text>
                ) : (
                  selectedDateEvents.map((event) => (
                    <View key={event.id} style={styles.taskItem}>
                      <TouchableOpacity
                        onPress={() => toggleCalendarEventComplete(event.id)}
                        style={styles.taskCheckbox}
                      >
                        {event.isCompleted ? (
                          <CheckCircle2 size={18} color={Colors.primary} />
                        ) : (
                          <Circle size={18} color={Colors.textTertiary} />
                        )}
                      </TouchableOpacity>

                      <View style={styles.taskDetails}>
                        <Text
                          style={[
                            styles.taskTitle,
                            event.isCompleted && styles.taskTitleCompleted,
                          ]}
                        >
                          {event.title}
                        </Text>
                        <View style={styles.taskMetaRow}>
                          <Clock size={11} color={Colors.textTertiary} />
                          <Text style={styles.taskTime}>{event.time || 'All Day'}</Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{event.category}</Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => deleteCalendarEvent(event.id)}
                        style={styles.deleteTaskBtn}
                      >
                        <Trash2 size={14} color="#B91C1C" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  calendarContainer: {
    width: SCREEN_WIDTH * 0.94,
    maxHeight: '92%',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EEDCC0',
    overflow: 'hidden',
    ...Shadows.card,
  },
  binderBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FAF3E7',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEDCC0',
  },
  ringHole: {
    width: 20,
    height: 12,
    backgroundColor: '#0F1F1A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMetallic: {
    width: 14,
    height: 6,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.canvasWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    padding: 6,
    borderRadius: 999,
  },
  monthTitleWrapper: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.textPrimary,
  },
  yearTitle: {
    fontSize: 11,
    color: Colors.cognacAmber,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  heroArtworkWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  heroArtwork: {
    width: '100%',
    height: '100%',
  },
  artworkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 31, 26, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  artworkMonthLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  artworkQuote: {
    fontSize: 10,
    color: '#E5D8C5',
    fontStyle: 'italic',
    marginTop: 2,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
    paddingVertical: 4,
  },
  weekdayLabel: {
    width: (SCREEN_WIDTH * 0.94 - 32) / 7,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textTertiary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 16,
    backgroundColor: Colors.canvasWarm,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  cell: {
    width: (SCREEN_WIDTH * 0.94 - 36) / 7,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    borderRadius: 8,
  },
  cellSelected: {
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  cellMuted: {
    opacity: 0.35,
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  todayText: {
    color: '#FAF6EE',
    fontWeight: '700',
  },
  selectedDayText: {
    color: Colors.cognacAmber,
    fontWeight: '800',
  },
  mutedDayText: {
    color: Colors.textTertiary,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  agendaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  agendaDateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  cycleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  addEventBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FAF6EE',
  },
  presetLinkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  presetLinkText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  addFormWrapper: {
    backgroundColor: Colors.canvasWarm,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  inputTitle: {
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputTime: {
    width: 100,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 11,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryPills: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  categoryPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryPillActive: {
    backgroundColor: Colors.cognacAmber,
    borderColor: Colors.cognacAmber,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FAF6EE',
  },
  formActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  confirmBtn: {
    backgroundColor: Colors.cognacAmber,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  confirmBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  taskList: {
    gap: 8,
  },
  emptyAgendaText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.canvasWarm,
    borderRadius: 10,
  },
  taskCheckbox: {
    marginRight: 10,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  taskTime: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  categoryBadge: {
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  deleteTaskBtn: {
    padding: 6,
  },
});
