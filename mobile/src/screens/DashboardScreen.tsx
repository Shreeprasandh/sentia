import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { SentiCompanion } from '../components/SentiCompanion';
import { SentiChatModal } from '../components/SentiChatModal';
import { OnboardingTour } from '../components/OnboardingTour';
import { getSmartWeather } from '../services/weather';
import { WeatherData, BagTelemetry } from '../types';

interface DashboardScreenProps {
  onNavigate: (route: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const insets = useSafeAreaInsets();
  const [isLocked, setIsLocked] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Dynamic status bar safe clearance: accommodates Dynamic Island, camera punch-hole, and status bar
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  // Bag telemetry state
  const [telemetry, setTelemetry] = useState<BagTelemetry>({
    id: 'demo-telem',
    bag_id: 'bag-01',
    battery_level: 86,
    is_charging: false,
    zipper_closed: true,
    bottle_inserted: true,
    weight_kg: 2.4,
    internal_temp_c: 23.5,
    humidity_pct: 54,
    ble_rssi: -58,
    tamper_detected: false,
    sos_triggered: false,
    recorded_at: new Date().toISOString(),
  });

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

  const toggleLock = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setIsLocked((prev) => !prev);
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

        {/* Compact Living Mascot (Idle sleep-and-fade, tap to open AI chat) */}
        <SentiCompanion
          initialMood="01_happy"
          size={46}
          onPress={() => setIsChatOpen(true)}
          idleTimeoutSeconds={15}
        />
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
        {/* Active Bag Showcase Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.bagName}>Executive Backpack 01</Text>
              <View style={styles.connectionPill}>
                <View style={styles.onlineDot} />
                <Text style={styles.connectionText}>Connected via BLE</Text>
              </View>
            </View>

            {/* Lock/Unlock Toggle */}
            <TouchableOpacity
              style={[
                styles.lockButton,
                isLocked ? styles.lockButtonArmed : styles.lockButtonDisarmed,
              ]}
              onPress={toggleLock}
              activeOpacity={0.8}
              focusable={false}
            >
              {isLocked ? (
                <Lock size={15} color="#FAF6EE" />
              ) : (
                <Unlock size={15} color={Colors.textPrimary} />
              )}
              <Text
                style={[
                  styles.lockButtonText,
                  isLocked ? styles.textInverse : styles.textDark,
                ]}
              >
                {isLocked ? 'Protected' : 'Unlocked'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bag Image with subtle perspective */}
          <View style={styles.bagVisualWrapper}>
            <Image
              source={require('../../assets/brand/image1.png')}
              style={styles.bagVisual}
              resizeMode="contain"
            />
          </View>

          {/* Quick Telemetry Grid */}
          <View style={styles.telemetryGrid}>
            {/* Battery */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                {telemetry.is_charging ? (
                  <BatteryCharging size={18} color={Colors.primary} />
                ) : (
                  <BatteryMedium size={18} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.telemetryValue}>{telemetry.battery_level}%</Text>
              <Text style={styles.telemetryLabel}>
                {telemetry.is_charging ? 'Charging' : 'Battery'}
              </Text>
            </View>

            {/* Zipper Sensor */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                <Shield size={18} color={telemetry.zipper_closed ? Colors.primary : Colors.statusWarning} />
              </View>
              <Text style={styles.telemetryValue}>
                {telemetry.zipper_closed ? 'Secure' : 'Unzipped'}
              </Text>
              <Text style={styles.telemetryLabel}>Zipper Sensor</Text>
            </View>

            {/* Smart Bottle */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                <Droplets size={18} color={telemetry.bottle_inserted ? Colors.primary : Colors.textTertiary} />
              </View>
              <Text style={styles.telemetryValue}>
                {telemetry.bottle_inserted ? 'Inserted' : 'Removed'}
              </Text>
              <Text style={styles.telemetryLabel}>Hydration</Text>
            </View>

            {/* Internal Temp */}
            <View style={styles.telemetryTile}>
              <View style={styles.iconCircle}>
                <Thermometer size={18} color={Colors.primary} />
              </View>
              <Text style={styles.telemetryValue}>{telemetry.internal_temp_c}°C</Text>
              <Text style={styles.telemetryLabel}>Internal Temp</Text>
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
            <Text style={styles.actionSubtitle}>Daily auto-reset checklist</Text>
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
            <Text style={styles.actionSubtitle}>Discreet 48h packing alerts</Text>
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
            <Text style={styles.actionTitle}>Security & Settings</Text>
            <Text style={styles.actionSubtitle}>Privacy, support & warranty</Text>
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
    borderWidth: 1.5,
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
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
    paddingTop: Spacing.md,
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
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  telemetryLabel: {
    fontSize: 11,
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
