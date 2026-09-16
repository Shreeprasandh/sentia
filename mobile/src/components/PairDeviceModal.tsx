import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import {
  X,
  Bluetooth,
  Wifi,
  Sparkles,
  Check,
  BatteryMedium,
  Radio,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PairDeviceModalProps {
  visible: boolean;
  onClose: () => void;
}

interface DiscoveredHardwareBag {
  id: string;
  name: string;
  model: string;
  colorName: string;
  rssi: number;
  battery: number;
  image: any;
}

const DISCOVERABLE_BAGS: DiscoveredHardwareBag[] = [
  {
    id: 'disc-1',
    name: 'Weekender Travel Duffel',
    model: 'Model WKD-02 • Ballistic Canvas',
    colorName: 'Porcelain Sand',
    rssi: -52,
    battery: 98,
    image: require('../../assets/brand/image2.png'),
  },
  {
    id: 'disc-2',
    name: 'Leather Crossbody Purse',
    model: 'Model CRB-03 • Saddle Tan',
    colorName: 'Cognac Saddle',
    rssi: -64,
    battery: 84,
    image: require('../../assets/brand/image3.png'),
  },
  {
    id: 'disc-3',
    name: 'Metropolitan Daypack',
    model: 'Model MET-04 • Matte Obsidian',
    colorName: 'Obsidian Black',
    rssi: -71,
    battery: 100,
    image: require('../../assets/brand/image1.png'),
  },
];

export const PairDeviceModal: React.FC<PairDeviceModalProps> = ({ visible, onClose }) => {
  const { pairNewBag, bags } = useCircle();
  const [isScanning, setIsScanning] = useState(true);
  const [pairingId, setPairingId] = useState<string | null>(null);
  const [pairedSuccessId, setPairedSuccessId] = useState<string | null>(null);

  const radarPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsScanning(true);
      setPairingId(null);
      setPairedSuccessId(null);

      const loop = Animated.loop(
        Animated.timing(radarPulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [visible]);

  const handlePairBag = (bag: DiscoveredHardwareBag) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setPairingId(bag.id);

    setTimeout(() => {
      const success = pairNewBag(bag.name, bag.model, bag.colorName, bag.image);
      if (success) {
        setPairedSuccessId(bag.id);
        setPairingId(null);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setPairingId(null);
      }
    }, 1800);
  };

  // Filter out bags already paired
  const availableBags = DISCOVERABLE_BAGS.filter(
    (db) => !bags.some((b) => b.name === db.name)
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdropPress} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Pair Sentia Hardware</Text>
              <Text style={styles.sheetSubtitle}>
                Scanning 2.4GHz BLE spectrum for nearby unbonded bags
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Radar Scanner Graphic */}
          <View style={styles.scannerWrapper}>
            <Animated.View
              style={[
                styles.radarWave,
                {
                  transform: [
                    {
                      scale: radarPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 2.2],
                      }),
                    },
                  ],
                  opacity: radarPulse.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0.8, 0.3, 0],
                  }),
                },
              ]}
            />
            <View style={styles.radarWaveStatic} />
            <View style={styles.centerBeacon}>
              <Bluetooth size={22} color="#FAF6EE" />
            </View>
          </View>

          <Text style={styles.radarStatus}>
            {pairingId
              ? 'Establishing cryptographic BLE bonding...'
              : `${availableBags.length} Sentia hardware devices advertising nearby`}
          </Text>

          {/* Device Discovery List */}
          <View style={styles.deviceList}>
            {availableBags.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  All nearby hardware devices are currently paired. Maximum 3 bags supported.
                </Text>
              </View>
            ) : (
              availableBags.map((bag) => {
                const isPairing = pairingId === bag.id;
                const isSuccess = pairedSuccessId === bag.id;

                return (
                  <View key={bag.id} style={styles.deviceCard}>
                    <Image source={bag.image} style={styles.deviceThumbnail} resizeMode="contain" />

                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>{bag.name}</Text>
                      <Text style={styles.deviceModel}>{bag.model}</Text>
                      <View style={styles.deviceMeta}>
                        <Radio size={12} color={Colors.statusSuccess} />
                        <Text style={styles.deviceRssi}>{bag.rssi} dBm (Strong)</Text>
                        <Text style={styles.bullet}>•</Text>
                        <BatteryMedium size={12} color={Colors.primary} />
                        <Text style={styles.deviceBattery}>{bag.battery}%</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.pairButton,
                        isSuccess && styles.pairButtonSuccess,
                      ]}
                      onPress={() => handlePairBag(bag)}
                      disabled={isPairing || isSuccess}
                    >
                      {isSuccess ? (
                        <>
                          <Check size={14} color="#FAF6EE" />
                          <Text style={styles.pairButtonText}>Paired</Text>
                        </>
                      ) : isPairing ? (
                        <Text style={styles.pairButtonText}>Pairing...</Text>
                      ) : (
                        <>
                          <Plus size={14} color="#FAF6EE" />
                          <Text style={styles.pairButtonText}>Pair</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.canvasElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    maxHeight: '85%',
    ...Shadows.card,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: Colors.canvasWarm,
  },
  scannerWrapper: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  radarWave: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  radarWaveStatic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.2)',
  },
  centerBeacon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  radarStatus: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
  },
  deviceList: {
    gap: 12,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  deviceThumbnail: {
    width: 50,
    height: 50,
  },
  deviceDetails: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deviceModel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deviceRssi: {
    fontSize: 10,
    color: Colors.statusSuccess,
    fontWeight: '600',
  },
  bullet: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  deviceBattery: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  pairButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  pairButtonSuccess: {
    backgroundColor: Colors.statusSuccess,
  },
  pairButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
