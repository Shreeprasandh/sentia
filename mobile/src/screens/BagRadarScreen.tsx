import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Volume2,
  ShieldCheck,
  Compass,
  Radio,
  Clock,
  MapPin,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { HardwareGateway } from '../services/hardwareGateway';
import { useCircle } from '../context/CircleContext';

interface BagRadarScreenProps {
  onBack: () => void;
}

export const BagRadarScreen: React.FC<BagRadarScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { activeBag, activeTelemetry } = useCircle();
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [geofenceArmed, setGeofenceArmed] = useState(true);

  const rssi = activeTelemetry.ble_rssi || -58;
  const estimatedDistanceMeters = Math.max(
    0.4,
    Math.round(Math.pow(10, (-45 - rssi) / 20) * 10) / 10
  );

  // Dynamic status bar safe clearance: accommodates Dynamic Island, camera punch-hole, and status bar
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  const handleTriggerBeacon = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    setIsBeaconActive(true);
    await HardwareGateway.sendCommand(activeBag.id, 'SOUND_ALARM');

    setTimeout(() => {
      setIsBeaconActive(false);
    }, 4000);
  };

  const toggleGeofence = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setGeofenceArmed((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} translucent={true} />

      {/* Header with Dynamic Safe Area Clearance */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proximity Radar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Radar Graphic Card */}
        <View style={styles.radarCard}>
          <View style={styles.concentricOuterRing}>
            <View style={styles.concentricMiddleRing}>
              <View style={styles.concentricInnerRing}>
                {/* Center Bag Beacon Icon */}
                <View style={styles.centerBagBeacon}>
                  <Radio size={24} color="#FAF6EE" />
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.radarDistance}>{estimatedDistanceMeters} m</Text>
          <Text style={styles.radarSubtext}>
            {rssi > -62
              ? `${activeBag.name} is in immediate Bluetooth range`
              : rssi > -75
              ? `${activeBag.name} is nearby within room perimeter`
              : `${activeBag.name} is at the perimeter of BLE range`}
          </Text>

          {/* Signal Pill */}
          <View style={styles.signalPill}>
            <View
              style={[
                styles.greenDot,
                { backgroundColor: rssi > -70 ? Colors.statusSuccess : Colors.statusWarning },
              ]}
            />
            <Text style={styles.signalText}>
              RSSI: {rssi} dBm • {rssi > -65 ? 'Strong Signal' : rssi > -78 ? 'Moderate Signal' : 'Weak Signal'}
            </Text>
          </View>
        </View>

        {/* Location Snapshot */}
        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={styles.locIconWrap}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>{activeBag.name}</Text>
              <Text style={styles.locationAddress}>{activeBag.model} • {activeBag.lastSeenText}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color={Colors.textTertiary} />
              <Text style={styles.metaText}>Updated 2 mins ago</Text>
            </View>
            <View style={styles.metaItem}>
              <Compass size={14} color={Colors.textTertiary} />
              <Text style={styles.metaText}>13.0827° N, 80.2707° E</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[
            styles.beaconButton,
            isBeaconActive && styles.beaconButtonActive,
          ]}
          onPress={handleTriggerBeacon}
          disabled={isBeaconActive}
          activeOpacity={0.85}
        >
          <Volume2 size={20} color={isBeaconActive ? '#FAF6EE' : Colors.textPrimary} />
          <Text
            style={[
              styles.beaconButtonText,
              isBeaconActive && { color: '#FAF6EE' },
            ]}
          >
            {isBeaconActive ? 'Sounding Bag Chime...' : 'Play Audible Bag Chime'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleCard}
          onPress={toggleGeofence}
          activeOpacity={0.85}
        >
          <View style={styles.toggleLeft}>
            <ShieldCheck size={20} color={geofenceArmed ? Colors.primary : Colors.textTertiary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.toggleTitle}>Separation Alert</Text>
              <Text style={styles.toggleSubtitle}>
                Vibrate if bag is separated by &gt; 30 meters
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.toggleSwitch,
              geofenceArmed ? styles.toggleSwitchOn : styles.toggleSwitchOff,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                geofenceArmed ? styles.toggleThumbOn : styles.toggleThumbOff,
              ]}
            />
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
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
  radarCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 24,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  concentricOuterRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: '#D4C4A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  concentricMiddleRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: '#C2B092',
    alignItems: 'center',
    justifyContent: 'center',
  },
  concentricInnerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBagBeacon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  radarDistance: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  radarSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAccent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    marginTop: Spacing.md,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.statusSuccess,
    marginRight: 6,
  },
  signalText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  locationCard: {
    backgroundColor: Colors.canvasWarm,
    borderRadius: 18,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginBottom: Spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginLeft: 5,
  },
  beaconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardAccent,
    borderWidth: 1.5,
    borderColor: Colors.cardAccentBorder,
    paddingVertical: 14,
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  beaconButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  beaconButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.canvasElevated,
    padding: Spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.subtle,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: Colors.primary,
  },
  toggleSwitchOff: {
    backgroundColor: '#D1D5DB',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FAF6EE',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
});
