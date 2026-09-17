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
  ScrollView,
} from 'react-native';
import {
  X,
  Bluetooth,
  Check,
  BatteryMedium,
  Radio,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';

interface PairDeviceModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BagCatalogModel {
  id: string;
  name: string;
  model: string;
  colorName: string;
  image: any;
  description: string;
}

const CATALOG_MODELS: BagCatalogModel[] = [
  {
    id: 'bag-01',
    name: 'Executive Smart Pack',
    model: 'Model EXP-01 • Carbon Weave',
    colorName: 'Imperial Emerald',
    image: require('../../assets/brand/image1.png'),
    description: 'Flagship daily workhorse with biometric zipper lock & hydration dock',
  },
  {
    id: 'bag-02',
    name: 'Weekender Travel Duffel',
    model: 'Model WKD-02 • Ballistic Canvas',
    colorName: 'Porcelain Sand',
    image: require('../../assets/brand/image4.png'),
    description: 'High-capacity travel companion with dual-zone smart organization',
  },
  {
    id: 'bag-03',
    name: 'Leather Crossbody Purse',
    model: 'Model CRB-03 • Saddle Tan',
    colorName: 'Cognac Saddle',
    image: require('../../assets/brand/image3.png'),
    description: 'Compact evening luxury silhouette with discreet anti-theft gyro',
  },
];

type PairingStep = 'select_model' | 'scanning' | 'found' | 'bonding' | 'success';

export const PairDeviceModal: React.FC<PairDeviceModalProps> = ({ visible, onClose }) => {
  const { pairNewBag, bags, hardwareBagsLiveMap } = useCircle();
  const [step, setStep] = useState<PairingStep>('select_model');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const radarPulse = useRef(new Animated.Value(0)).current;

  // Selected Model definition
  const selectedModel = CATALOG_MODELS.find((m) => m.id === selectedModelId);
  const liveTelem = selectedModelId ? hardwareBagsLiveMap[selectedModelId] : null;

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setStep('select_model');
      setSelectedModelId(null);
    }
  }, [visible]);

  // Radar wave animation loop
  useEffect(() => {
    if (step === 'scanning') {
      const loop = Animated.loop(
        Animated.timing(radarPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [step]);

  // Check if target bag is in pairing mode on the twin simulator
  useEffect(() => {
    if (step === 'scanning' && selectedModelId) {
      const telem = hardwareBagsLiveMap[selectedModelId];
      if (telem && (telem.is_pairing_mode || telem.battery_level > 0)) {
        // Automatically discover bag advertising on BLE
        const timer = setTimeout(() => {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          setStep('found');
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [step, selectedModelId, hardwareBagsLiveMap]);

  const handleSelectModel = (modelId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedModelId(modelId);
  };

  const handleStartSearch = () => {
    if (!selectedModelId) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setStep('scanning');
  };

  const handleConnectAndBond = () => {
    if (!selectedModel) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    setStep('bonding');

    setTimeout(() => {
      const success = pairNewBag(
        selectedModel.name,
        selectedModel.model,
        selectedModel.colorName,
        selectedModel.image,
        selectedModel.id
      );

      if (success) {
        setStep('success');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setTimeout(() => {
          onClose();
        }, 1400);
      } else {
        setStep('select_model');
      }
    }, 1600);
  };

  const handleForceConnect = () => {
    setStep('found');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdropPress} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {step === 'select_model' && 'Select Bag Model'}
                {step === 'scanning' && 'Scanning 2.4GHz BLE'}
                {step === 'found' && 'Device Discovered'}
                {step === 'bonding' && 'Securing Connection'}
                {step === 'success' && 'Hardware Bonded'}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {step === 'select_model' && 'Choose your Sentia smart silhouette to initiate pairing'}
                {step === 'scanning' && `Searching for advertising ${selectedModel?.name || 'device'} beacon`}
                {step === 'found' && 'Verified cryptographic hardware advertisement detected'}
                {step === 'bonding' && 'Establishing authenticated BLE security key'}
                {step === 'success' && 'Ready for live telemetry synchronization'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* STEP 1: Model Selection Catalog */}
          {step === 'select_model' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modelList}>
              {CATALOG_MODELS.map((model) => {
                const isAlreadyPaired = bags.some((b) => b.id === model.id);
                const isSelected = selectedModelId === model.id;

                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelCard,
                      isSelected && styles.modelCardSelected,
                      isAlreadyPaired && styles.modelCardDisabled,
                    ]}
                    onPress={() => !isAlreadyPaired && handleSelectModel(model.id)}
                    activeOpacity={isAlreadyPaired ? 1 : 0.8}
                    disabled={isAlreadyPaired}
                  >
                    <Image source={model.image} style={styles.modelThumbnail} resizeMode="contain" />

                    <View style={styles.modelDetails}>
                      <View style={styles.modelTitleRow}>
                        <Text style={[styles.modelName, isAlreadyPaired && styles.textDisabled]}>
                          {model.name}
                        </Text>
                        {isAlreadyPaired && (
                          <View style={styles.pairedBadge}>
                            <Check size={11} color={Colors.primary} />
                            <Text style={styles.pairedBadgeText}>Paired</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.modelSubtext}>{model.model}</Text>
                      <Text style={styles.modelDesc} numberOfLines={2}>
                        {model.description}
                      </Text>
                    </View>

                    {!isAlreadyPaired && (
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  !selectedModelId && styles.primaryActionButtonDisabled,
                ]}
                onPress={handleStartSearch}
                disabled={!selectedModelId}
              >
                <Text style={styles.primaryActionText}>Search and Connect</Text>
                <ChevronRight size={16} color="#FAF6EE" />
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* STEP 2: Radar Scanning for Selected Model */}
          {step === 'scanning' && (
            <View style={styles.centerContainer}>
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

              <Text style={styles.scanningStatusTitle}>Searching for {selectedModel?.name}</Text>
              <Text style={styles.scanningGuidance}>
                Make sure your bag is in Pairing Mode. Click "Start BLE Pairing" on your digital twin simulator or press the bag hardware button.
              </Text>

              <View style={styles.scanningActionRow}>
                <TouchableOpacity
                  style={styles.cancelSearchBtn}
                  onPress={() => setStep('select_model')}
                >
                  <Text style={styles.cancelSearchText}>Change Model</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.manualConnectBtn}
                  onPress={handleForceConnect}
                >
                  <RefreshCw size={12} color={Colors.cognacAmber} />
                  <Text style={styles.manualConnectText}>Simulate Found</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: Discovered Device Confirmation */}
          {step === 'found' && selectedModel && (
            <View style={styles.centerContainer}>
              <View style={styles.foundCard}>
                <Image source={selectedModel.image} style={styles.foundImage} resizeMode="contain" />
                <Text style={styles.foundName}>{selectedModel.name}</Text>
                <Text style={styles.foundModel}>{selectedModel.model}</Text>

                <View style={styles.metaBadgeRow}>
                  <View style={styles.metaBadge}>
                    <Radio size={12} color={Colors.statusSuccess} />
                    <Text style={styles.metaBadgeText}>
                      {liveTelem ? `${liveTelem.ble_rssi} dBm (Strong)` : '-52 dBm (Strong)'}
                    </Text>
                  </View>

                  <View style={styles.metaBadge}>
                    <BatteryMedium size={12} color={Colors.primary} />
                    <Text style={styles.metaBadgeText}>
                      {liveTelem ? `${liveTelem.battery_level}% Battery` : '96% Battery'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleConnectAndBond}
              >
                <ShieldCheck size={16} color="#FAF6EE" />
                <Text style={styles.primaryActionText}>Connect and Bond Hardware</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: Cryptographic Bonding in Progress */}
          {step === 'bonding' && (
            <View style={styles.centerContainer}>
              <View style={styles.scannerWrapper}>
                <View style={styles.centerBeacon}>
                  <Bluetooth size={22} color="#FAF6EE" />
                </View>
              </View>
              <Text style={styles.scanningStatusTitle}>Cryptographic Bonding</Text>
              <Text style={styles.scanningGuidance}>
                Exchanging secure keys with Sentia hardware module...
              </Text>
            </View>
          )}

          {/* STEP 5: Success Checkmark */}
          {step === 'success' && (
            <View style={styles.centerContainer}>
              <View style={styles.successCircle}>
                <Check size={32} color="#FAF6EE" />
              </View>
              <Text style={styles.successTitle}>Successfully Connected</Text>
              <Text style={styles.scanningGuidance}>
                {selectedModel?.name} is now bonded to your Sentia ecosystem. Live telemetry streaming active.
              </Text>
            </View>
          )}
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
    maxHeight: '88%',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    ...Shadows.card,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: Colors.canvasWarm,
  },
  modelList: {
    gap: 10,
    paddingVertical: 4,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  modelCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF6EE',
  },
  modelCardDisabled: {
    opacity: 0.5,
  },
  modelThumbnail: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  modelDetails: {
    flex: 1,
  },
  modelTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modelSubtext: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  modelDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 14,
  },
  textDisabled: {
    color: Colors.textTertiary,
  },
  pairedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.canvasWarm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pairedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  primaryActionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.pill,
    gap: 8,
    marginTop: Spacing.md,
    ...Shadows.subtle,
  },
  primaryActionButtonDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FAF6EE',
    textAlign: 'center',
    includeFontPadding: false,
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
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
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
  },
  centerBeacon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  scanningStatusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  scanningGuidance: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: 6,
    lineHeight: 16,
  },
  scanningActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.lg,
  },
  cancelSearchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.canvasWarm,
  },
  cancelSearchText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  manualConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#FAF3E7',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  manualConnectText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  foundCard: {
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: 20,
    padding: Spacing.lg,
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  foundImage: {
    width: 110,
    height: 110,
    marginBottom: Spacing.sm,
  },
  foundName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  foundModel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF6EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
