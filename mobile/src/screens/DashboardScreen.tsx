import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Image,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Shield,
  ShieldAlert,
  BatteryCharging,
  BatteryMedium,
  Droplets,
  Thermometer,
  MapPin,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  CloudSun,
  Calendar,
  Users,
  ShoppingBag,
  Scale,
  Wind,
  AlertTriangle,
  Flame,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { SentiCompanion } from '../components/SentiCompanion';
import { SentiChatModal } from '../components/SentiChatModal';
import { OnboardingTour } from '../components/OnboardingTour';
import { DeviceCarousel } from '../components/DeviceCarousel';
import { WallCalendarModal } from '../components/WallCalendarModal';
import { useCircle } from '../context/CircleContext';
import { getSmartWeather } from '../services/weather';
import { WeatherData, BagTelemetry } from '../types';

interface DashboardScreenProps {
  onNavigate: (route: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const insets = useSafeAreaInsets();
  const { calendarEvents, activeTelemetry, activeBag } = useCircle();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Dynamic Senti emotion and anomaly awareness reacting to live hardware state
  const { sentiMood, sentiSpeech } = useMemo(() => {
    if (activeTelemetry.sos_triggered) {
      return { sentiMood: '11_surprised' as const, sentiSpeech: 'Emergency SOS Active!' };
    }
    if (activeTelemetry.tamper_detected) {
      return { sentiMood: '15_angry' as const, sentiSpeech: 'Movement detected!' };
    }
    if (activeTelemetry.is_locked && !activeTelemetry.zipper_closed) {
      return { sentiMood: '12_confused' as const, sentiSpeech: 'Zipper breach! Bag is locked.' };
    }
    if (activeTelemetry.internal_temp_c >= 40.0) {
      return { sentiMood: '14_tired' as const, sentiSpeech: 'High internal heat detected.' };
    }
    if (activeTelemetry.battery_level <= 15 && !activeTelemetry.is_charging) {
      return { sentiMood: '14_tired' as const, sentiSpeech: 'Battery critical, please charge.' };
    }
    if (activeTelemetry.weight_kg >= 7.0) {
      return { sentiMood: '14_tired' as const, sentiSpeech: 'Bag weight exceeds 7kg limit.' };
    }
    return { sentiMood: '01_happy' as const, sentiSpeech: null };
  }, [activeTelemetry]);

  // Dynamic status bar safe clearance: accommodates Dynamic Island, camera punch-hole, and status bar
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  // Load weather on mount with 45-minute cache defense
  useEffect(() => {
    getSmartWeather().then(setWeather);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const updatedWeather = await getSmartWeather(13.0827, 80.2707, true);
    setWeather(updatedWeather);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} translucent={true} />

      {/* Top Header with Dynamic Safe Area Clearance */}
      <View style={[styles.headerBar, { paddingTop: topInset }]}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/brand/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>SENTIA</Text>
            <Text style={styles.brandSubtitle}>Executive Smart Companion</Text>
          </View>
        </View>

        {/* Right Controls: 3D Wall Calendar Icon near Senti & Compact Living Mascot */}
        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.calendarIconBtn}
            onPress={() => setIsCalendarOpen(true)}
            activeOpacity={0.8}
          >
            <Calendar size={18} color={Colors.primary} />
            {calendarEvents.length > 0 && (
              <View style={styles.calendarDotBadge} />
            )}
          </TouchableOpacity>

          <SentiCompanion
            initialMood={sentiMood}
            speechBubbleText={sentiSpeech}
            size={46}
            onPress={() => setIsChatOpen(true)}
            idleTimeoutSeconds={15}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Multi-Bag Carousel (Primary, Secondary, Tertiary with BLE Controls) */}
        <DeviceCarousel />

        {/* Real-Time Hardware Security Alerts from Digital Twin */}
        {activeTelemetry.sos_triggered && (
          <View style={styles.emergencySosBanner}>
            <AlertTriangle size={20} color="#FAF6EE" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.emergencySosTitle}>EMERGENCY SOS BROADCAST ACTIVE</Text>
              <Text style={styles.emergencySosSubtitle}>
                Hardware SOS triggered on {activeBag.name}. High-priority alert dispatched.
              </Text>
            </View>
          </View>
        )}

        {activeTelemetry.tamper_detected && (
          <View style={styles.tamperAlertBanner}>
            <ShieldAlert size={20} color="#92400E" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.tamperAlertTitle}>Security Alert: Movement Detected</Text>
              <Text style={styles.tamperAlertSubtitle}>
                Unauthorized displacement recorded by gyroscope on {activeBag.name}.
              </Text>
            </View>
          </View>
        )}

        {/* Zipper Intrusion Breach while Locked */}
        {activeTelemetry.is_locked && !activeTelemetry.zipper_closed && (
          <View style={styles.breachAlertBanner}>
            <ShieldAlert size={20} color="#FAF6EE" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.breachAlertTitle}>SECURITY ALERT: ZIPPER COMPROMISED</Text>
              <Text style={styles.breachAlertSubtitle}>
                Pocket unzipped while {activeBag.name} is in Protected lock mode.
              </Text>
            </View>
          </View>
        )}

        {/* Thermal Hazard Alert (>40°C) */}
        {activeTelemetry.internal_temp_c >= 40.0 && (
          <View style={styles.thermalAlertBanner}>
            <Thermometer size={20} color="#9A3412" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.thermalAlertTitle}>
                Thermal Alert: High Heat ({activeTelemetry.internal_temp_c}°C)
              </Text>
              <Text style={styles.thermalAlertSubtitle}>
                Internal temperature exceeds 40°C safe operating threshold.
              </Text>
            </View>
          </View>
        )}

        {/* Overweight Luggage Anomaly (>7kg) */}
        {activeTelemetry.weight_kg >= 7.0 && (
          <View style={styles.weightAlertBanner}>
            <Scale size={20} color="#92400E" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.weightAlertTitle}>
                Luggage Allowance Warning: {activeTelemetry.weight_kg} kg
              </Text>
              <Text style={styles.weightAlertSubtitle}>
                Exceeds standard 7.0 kg international airline cabin carry-on allowance.
              </Text>
            </View>
          </View>
        )}

        {/* Critical Low Battery Alert (<15%) */}
        {activeTelemetry.battery_level <= 15 && !activeTelemetry.is_charging && (
          <View style={styles.batteryAlertBanner}>
            <AlertTriangle size={20} color="#991B1B" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.batteryAlertTitle}>
                Critical Battery: {activeTelemetry.battery_level}% Remaining
              </Text>
              <Text style={styles.batteryAlertSubtitle}>
                Recharge {activeBag.name} via USB-C to ensure uninterrupted tracking.
              </Text>
            </View>
          </View>
        )}

        {activeTelemetry.lumbar_heat_active && (
          <View style={styles.lumbarHeatBanner}>
            <Flame size={18} color="#92400E" />
            <Text style={styles.lumbarHeatBannerText}>
              40C Lumbar Thermal Pouch Active on {activeBag.name}
            </Text>
          </View>
        )}

        {/* 6-Sensor Live Hardware Telemetry Grid (100% Real Supabase Realtime) */}
        <View style={styles.telemetryCard}>
          {/* Row 1: Battery, Zipper, Hydration */}
          <View style={styles.telemetryRow}>
            {/* Battery */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                {activeTelemetry.is_charging ? (
                  <BatteryCharging size={18} color={Colors.primary} />
                ) : (
                  <BatteryMedium size={18} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.telemetryValue}>{activeTelemetry.battery_level}%</Text>
              <Text style={styles.telemetryLabel}>
                {activeTelemetry.is_charging ? 'Charging' : 'Battery'}
              </Text>
            </View>

            {/* Zipper Sensor */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                <Shield
                  size={18}
                  color={activeTelemetry.zipper_closed ? Colors.primary : Colors.statusWarning}
                />
              </View>
              <Text style={styles.telemetryValue}>
                {activeTelemetry.zipper_closed ? 'Secure' : 'Unzipped'}
              </Text>
              <Text style={styles.telemetryLabel}>Zipper Sensor</Text>
            </View>

            {/* Smart Bottle */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                <Droplets
                  size={18}
                  color={activeTelemetry.bottle_inserted ? Colors.primary : Colors.textTertiary}
                />
              </View>
              <Text style={styles.telemetryValue}>
                {activeTelemetry.bottle_inserted ? 'Docked' : 'Empty'}
              </Text>
              <Text style={styles.telemetryLabel}>Hydration</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.telemetryDivider} />

          {/* Row 2: Load Cell Weight, Internal Temp, Ambient Humidity */}
          <View style={styles.telemetryRow}>
            {/* Load Cell Weight */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                <Scale
                  size={18}
                  color={activeTelemetry.weight_kg > 5.0 ? Colors.statusWarning : Colors.primary}
                />
              </View>
              <Text style={styles.telemetryValue}>{activeTelemetry.weight_kg} kg</Text>
              <Text style={styles.telemetryLabel}>
                {activeTelemetry.weight_kg > 5.0 ? 'Heavy Load' : 'Load Cell'}
              </Text>
            </View>

            {/* Internal Temp */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                <Thermometer size={18} color={Colors.primary} />
              </View>
              <Text style={styles.telemetryValue}>{activeTelemetry.internal_temp_c}°C</Text>
              <Text style={styles.telemetryLabel}>Internal Temp</Text>
            </View>

            {/* Ambient Humidity */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                <Wind size={18} color={Colors.primary} />
              </View>
              <Text style={styles.telemetryValue}>{activeTelemetry.humidity_pct}%</Text>
              <Text style={styles.telemetryLabel}>Humidity</Text>
            </View>
          </View>
        </View>

        {/* Smart Weather Packing Advice Card */}
        {weather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <View style={styles.weatherLeft}>
                <CloudSun size={20} color={Colors.primary} />
                <Text style={styles.weatherCity}>{weather.city} • {weather.tempC}°C</Text>
              </View>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
            </View>
            <Text style={styles.weatherAdvice}>{weather.packingRecommendation}</Text>
          </View>
        )}

        {/* Main Feature Quick Links */}
        <Text style={styles.sectionHeader}>Daily Modules</Text>

        <View style={styles.actionsGrid}>
          {/* Radar */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('radar')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#E6F4EA' }]}>
              <MapPin size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Bag Radar & GPS</Text>
            <Text style={styles.actionSubtitle}>Proximity beacon & location</Text>
          </TouchableOpacity>

          {/* Essentials */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('essentials')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#F8E7C9' }]}>
              <CheckCircle2 size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Smart Essentials</Text>
            <Text style={styles.actionSubtitle}>10 Custom packing presets</Text>
          </TouchableOpacity>

          {/* Cycle Care */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('cycle')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#FCE7F3' }]}>
              <Sparkles size={22} color="#9D174D" />
            </View>
            <Text style={styles.actionTitle}>Cycle Care Sync</Text>
            <Text style={styles.actionSubtitle}>40°C Lumbar warmth & rhythm</Text>
          </TouchableOpacity>

          {/* Sentia Circle */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('circle')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#FAF3E7' }]}>
              <Users size={22} color={Colors.cognacAmber} />
            </View>
            <Text style={styles.actionTitle}>Sentia Circle</Text>
            <Text style={styles.actionSubtitle}>Friends mode, radar & tribes</Text>
          </TouchableOpacity>

          {/* Boutique */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('shop')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <ShoppingBag size={22} color="#D97706" />
            </View>
            <Text style={styles.actionTitle}>Sentia Boutique</Text>
            <Text style={styles.actionSubtitle}>Luxury hardware & inserts</Text>
          </TouchableOpacity>

          {/* Settings & Support */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('settings')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#E0E7FF' }]}>
              <ShieldAlert size={22} color="#3730A3" />
            </View>
            <Text style={styles.actionTitle}>Security & SOS</Text>
            <Text style={styles.actionSubtitle}>Guardian panic & privacy</Text>
          </TouchableOpacity>
        </View>

        {/* Tutorial Tour Trigger Button */}
        <TouchableOpacity
          style={styles.tourPromptButton}
          onPress={() => setShowTour(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.tourPromptText}>
            First time? Take a 30-second tour with Senti →
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Senti AI Chat Sheet Modal */}
      <SentiChatModal
        visible={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNavigateAction={(route) => onNavigate(route)}
      />

      {/* 3D Wall Calendar Modal with Cycle Care Horizon */}
      <WallCalendarModal
        visible={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Onboarding Tour Modal */}
      <OnboardingTour
        visible={showTour}
        onComplete={() => setShowTour(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.canvas,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 38,
    height: 38,
    marginRight: Spacing.sm,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.canvasElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    position: 'relative',
    ...Shadows.subtle,
  },
  calendarDotBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.cognacAmber,
  },
  telemetryCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 20,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  heroCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 24,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bagName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.statusSuccess,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  lockButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  lockButtonArmed: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  lockButtonDisarmed: {
    backgroundColor: Colors.cardAccent,
    borderColor: Colors.cardAccentBorder,
  },
  lockButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  textInverse: {
    color: Colors.textInverse,
  },
  textDark: {
    color: Colors.textPrimary,
  },
  bagVisualWrapper: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  bagVisual: {
    width: '100%',
    height: 180,
  },
  emergencySosBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderRadius: 16,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    ...Shadows.card,
  },
  emergencySosTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FAF6EE',
    letterSpacing: 0.5,
  },
  emergencySosSubtitle: {
    fontSize: 10,
    color: '#FEE2E2',
    marginTop: 2,
  },
  tamperAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FCD34D',
    ...Shadows.subtle,
  },
  tamperAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  tamperAlertSubtitle: {
    fontSize: 10,
    color: '#78350F',
    marginTop: 2,
  },
  breachAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D',
    borderRadius: 16,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#991B1B',
    ...Shadows.subtle,
  },
  breachAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FAF6EE',
  },
  breachAlertSubtitle: {
    fontSize: 10,
    color: '#FECACA',
    marginTop: 2,
  },
  thermalAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FDBA74',
    ...Shadows.subtle,
  },
  thermalAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
  },
  thermalAlertSubtitle: {
    fontSize: 10,
    color: '#C2410C',
    marginTop: 2,
  },
  weightAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FCD34D',
    ...Shadows.subtle,
  },
  weightAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  weightAlertSubtitle: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 2,
  },
  batteryAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    ...Shadows.subtle,
  },
  batteryAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
  },
  batteryAlertSubtitle: {
    fontSize: 10,
    color: '#B91C1C',
    marginTop: 2,
  },
  lumbarHeatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E7',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: Spacing.xs,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  lumbarHeatBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  telemetryDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  telemetryTile: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  telemetryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  telemetryLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  weatherCard: {
    backgroundColor: Colors.canvasWarm,
    borderRadius: 16,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherCity: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  weatherCondition: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  weatherAdvice: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48.5%',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 18,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.subtle,
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 15,
  },
  tourPromptButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  tourPromptText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});
