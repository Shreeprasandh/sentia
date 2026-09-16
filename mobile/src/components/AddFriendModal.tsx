import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
  Animated,
  Easing,
  Share,
  Clipboard,
  Alert,
  Dimensions,
} from 'react-native';
import {
  X,
  QrCode,
  ScanLine,
  Radio,
  UserPlus,
  Copy,
  Check,
  Share2,
  Sparkles,
  Shield,
  RotateCw,
  Search,
  Wifi,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'scan' | 'my_qr' | 'proximity';

interface NearbyDevice {
  id: string;
  name: string;
  distanceMeters: number;
  bagModel: string;
  batteryPct: number;
  code: string;
  avatarBg: string;
}

const NEARBY_DISCOVERED: NearbyDevice[] = [
  {
    id: 'nb-1',
    name: 'Elena Rostova',
    distanceMeters: 2.3,
    bagModel: 'Executive Smart Pack',
    batteryPct: 88,
    code: 'SNT-449X',
    avatarBg: '#064E3B',
  },
  {
    id: 'nb-2',
    name: 'Marcus Vance',
    distanceMeters: 4.1,
    bagModel: 'Weekender Duffel 02',
    batteryPct: 92,
    code: 'SNT-912V',
    avatarBg: '#92400E',
  },
  {
    id: 'nb-3',
    name: 'Aria Sterling',
    distanceMeters: 5.7,
    bagModel: 'Leather Crossbody Purse',
    batteryPct: 76,
    code: 'SNT-620A',
    avatarBg: '#4A0E4E',
  },
];

export const AddFriendModal: React.FC<AddFriendModalProps> = ({ visible, onClose }) => {
  const { addFriendByCode, profile } = useCircle();
  const [activeTab, setActiveTab] = useState<TabType>('my_qr');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  // Radar Pulse Animation
  const radarPulse = useRef(new Animated.Value(0)).current;
  // Laser Sweep Animation for Scanner
  const laserSweep = useRef(new Animated.Value(0)).current;
  // 3D Flip Card Animation
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && activeTab === 'proximity') {
      const pulseLoop = Animated.loop(
        Animated.timing(radarPulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [visible, activeTab]);

  useEffect(() => {
    if (visible && activeTab === 'scan') {
      const laserLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(laserSweep, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(laserSweep, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      laserLoop.start();
      return () => laserLoop.stop();
    }
  }, [visible, activeTab]);

  const handleFlipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const targetValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue: targetValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const handleAddManualCode = () => {
    if (!inputCode.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = addFriendByCode(inputCode.trim());
    if (success) {
      setInputCode('');
      onClose();
    }
  };

  const handleCopyCode = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Connect with my Sentia smart ecosystem! My Sentia Circle invite code is: ${profile.userCode}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleProximityConnect = (device: NearbyDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnectingId(device.id);

    setTimeout(() => {
      addFriendByCode(device.code);
      setConnectedIds((prev) => [...prev, device.id]);
      setConnectingId(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdropPress} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Expand Your Circle</Text>
              <Text style={styles.sheetSubtitle}>
                Add companions to share bag telemetry & group journeys
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tri-Option Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'my_qr' && styles.tabButtonActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('my_qr');
              }}
            >
              <QrCode
                size={16}
                color={activeTab === 'my_qr' ? Colors.cognacAmber : Colors.textTertiary}
              />
              <Text
                style={[styles.tabText, activeTab === 'my_qr' && styles.tabTextActive]}
              >
                Your QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'scan' && styles.tabButtonActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('scan');
              }}
            >
              <ScanLine
                size={16}
                color={activeTab === 'scan' ? Colors.cognacAmber : Colors.textTertiary}
              />
              <Text
                style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}
              >
                Scan QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'proximity' && styles.tabButtonActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('proximity');
              }}
            >
              <Radio
                size={16}
                color={activeTab === 'proximity' ? Colors.cognacAmber : Colors.textTertiary}
              />
              <Text
                style={[styles.tabText, activeTab === 'proximity' && styles.tabTextActive]}
              >
                Vicinity
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: YOUR QR (3D Flip Card) */}
          {activeTab === 'my_qr' && (
            <View style={styles.tabContent}>
              <Text style={styles.flipInstruction}>
                Tap the card to {isFlipped ? 'view crest' : 'reveal rounded SVG QR code'}
              </Text>

              {/* 3D Flip Card Container */}
              <Pressable onPress={handleFlipCard} style={styles.cardContainer}>
                {/* Front: Luxury Sentia Crest */}
                <Animated.View
                  style={[
                    styles.flipCard,
                    styles.flipCardFront,
                    frontAnimatedStyle,
                    { backfaceVisibility: 'hidden' },
                  ]}
                >
                  <View style={styles.crestBadge}>
                    <Sparkles size={28} color="#D97706" />
                  </View>
                  <Text style={styles.crestTitle}>SENTIA LIVING</Text>
                  <Text style={styles.crestOwner}>{profile.name}</Text>
                  <Text style={styles.crestHandle}>{profile.handle}</Text>

                  <View style={styles.crestFooter}>
                    <RotateCw size={14} color={Colors.cognacAmber} />
                    <Text style={styles.crestFooterText}>Tap to Flip to QR Code</Text>
                  </View>
                </Animated.View>

                {/* Back: Rounded Vector SVG QR Code */}
                <Animated.View
                  style={[
                    styles.flipCard,
                    styles.flipCardBack,
                    backAnimatedStyle,
                    { backfaceVisibility: 'hidden' },
                  ]}
                >
                  <View style={styles.qrFrame}>
                    <QRCode
                      value={`sentia://invite/${profile.userCode}`}
                      size={170}
                      color="#0F1F1A"
                      backgroundColor="#FFFFFF"
                      quietZone={10}
                    />
                  </View>
                  <Text style={styles.passcodeLabel}>SENTIA PASSCODE</Text>
                  <Text style={styles.passcodeValue}>{profile.userCode}</Text>
                </Animated.View>
              </Pressable>

              {/* Share & Copy Action Buttons */}
              <View style={styles.shareRow}>
                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={handleCopyCode}
                >
                  {copied ? (
                    <Check size={16} color={Colors.primary} />
                  ) : (
                    <Copy size={16} color={Colors.textPrimary} />
                  )}
                  <Text style={styles.actionBtnSecondaryText}>
                    {copied ? 'Code Copied' : 'Copy Code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleShare}>
                  <Share2 size={16} color="#FAF6EE" />
                  <Text style={styles.actionBtnPrimaryText}>Share Invite</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tab 2: SCAN QR (Camera Viewfinder + Manual Code) */}
          {activeTab === 'scan' && (
            <View style={styles.tabContent}>
              {/* Viewfinder Reticle */}
              <View style={styles.viewfinderWrapper}>
                <View style={styles.viewfinder}>
                  {/* Four Corner Accents */}
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />

                  {/* Animated Laser Scanning Line */}
                  <Animated.View
                    style={[
                      styles.laserLine,
                      {
                        transform: [
                          {
                            translateY: laserSweep.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 180],
                            }),
                          },
                        ],
                      },
                    ]}
                  />

                  <View style={styles.viewfinderCenter}>
                    <ScanLine size={36} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.viewfinderHelp}>Align QR code inside frame</Text>
                  </View>
                </View>
              </View>

              {/* Manual Code Input Fallback */}
              <View style={styles.manualInputWrapper}>
                <Text style={styles.inputLabel}>Or enter companion passcode manually:</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. SNT-449X"
                    placeholderTextColor={Colors.textTertiary}
                    value={inputCode}
                    onChangeText={setInputCode}
                    autoCapitalize="characters"
                    maxLength={10}
                  />
                  <TouchableOpacity
                    style={[
                      styles.submitCodeBtn,
                      !inputCode.trim() && styles.submitCodeBtnDisabled,
                    ]}
                    onPress={handleAddManualCode}
                    disabled={!inputCode.trim()}
                  >
                    <UserPlus size={16} color="#FAF6EE" />
                    <Text style={styles.submitCodeBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Tab 3: VICINITY RADAR (120s Ephemeral Proximity Scan) */}
          {activeTab === 'proximity' && (
            <View style={styles.tabContent}>
              {/* Radar Graphic */}
              <View style={styles.radarContainer}>
                {/* Concentric Pulse Rings */}
                <Animated.View
                  style={[
                    styles.radarRing,
                    {
                      transform: [
                        {
                          scale: radarPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 2.0],
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
                <View style={[styles.radarRing, styles.radarRingStatic1]} />
                <View style={[styles.radarRing, styles.radarRingStatic2]} />

                {/* Center Node */}
                <View style={styles.radarCenterNode}>
                  <Wifi size={18} color="#FAF6EE" />
                </View>
              </View>

              <Text style={styles.radarStatus}>
                Scanning 10-meter vicinity for Sentia active devices...
              </Text>

              {/* Nearby Devices List */}
              <View style={styles.deviceList}>
                {NEARBY_DISCOVERED.map((device) => {
                  const isConnected = connectedIds.includes(device.id);
                  const isConnecting = connectingId === device.id;

                  return (
                    <View key={device.id} style={styles.deviceItem}>
                      <View
                        style={[styles.deviceAvatar, { backgroundColor: device.avatarBg }]}
                      >
                        <Text style={styles.avatarLetter}>{device.name[0]}</Text>
                      </View>

                      <View style={styles.deviceInfo}>
                        <View style={styles.deviceNameRow}>
                          <Text style={styles.deviceName}>{device.name}</Text>
                          <Text style={styles.deviceDistance}>
                            {device.distanceMeters}m away
                          </Text>
                        </View>
                        <Text style={styles.deviceModel}>
                          {device.bagModel} • {device.batteryPct}% batt
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.connectBtn,
                          isConnected && styles.connectBtnConnected,
                        ]}
                        onPress={() => handleProximityConnect(device)}
                        disabled={isConnected || isConnecting}
                      >
                        {isConnected ? (
                          <>
                            <Check size={14} color={Colors.primary} />
                            <Text style={styles.connectBtnTextConnected}>Added</Text>
                          </>
                        ) : isConnecting ? (
                          <Text style={styles.connectBtnText}>Adding...</Text>
                        ) : (
                          <>
                            <UserPlus size={14} color="#FAF6EE" />
                            <Text style={styles.connectBtnText}>Connect</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.canvasWarm,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.cognacAmber,
  },
  tabContent: {
    alignItems: 'center',
  },
  flipInstruction: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  cardContainer: {
    width: 250,
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  flipCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#EEDCC0',
    ...Shadows.card,
  },
  flipCardFront: {
    backgroundColor: '#FAF6EE',
  },
  flipCardBack: {
    backgroundColor: '#FFFFFF',
  },
  crestBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF3E7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginBottom: Spacing.md,
  },
  crestTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.cognacAmber,
    marginBottom: 6,
  },
  crestOwner: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  crestHandle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  crestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
    gap: 6,
  },
  crestFooterText: {
    fontSize: 11,
    color: Colors.cognacAmber,
    fontWeight: '600',
  },
  qrFrame: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  passcodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginTop: 12,
  },
  passcodeValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.primary,
    marginTop: 2,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.canvasWarm,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FAF6EE',
  },
  viewfinderWrapper: {
    width: 220,
    height: 220,
    backgroundColor: '#0F1F1A',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  viewfinder: {
    width: 180,
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#10B981',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  viewfinderCenter: {
    alignItems: 'center',
    gap: 8,
  },
  viewfinderHelp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  manualInputWrapper: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 46,
    backgroundColor: Colors.canvasWarm,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  submitCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
    gap: 6,
  },
  submitCodeBtnDisabled: {
    opacity: 0.5,
  },
  submitCodeBtnText: {
    color: '#FAF6EE',
    fontWeight: '600',
    fontSize: 13,
  },
  radarContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  radarRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.cognacAmber,
  },
  radarRingStatic1: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: 'rgba(146, 64, 14, 0.25)',
    borderWidth: 1,
  },
  radarRingStatic2: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderColor: 'rgba(146, 64, 14, 0.15)',
    borderWidth: 1,
  },
  radarCenterNode: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cognacAmber,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  radarStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  deviceList: {
    width: '100%',
    gap: 10,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  deviceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deviceDistance: {
    fontSize: 10,
    color: Colors.cognacAmber,
    fontWeight: '600',
  },
  deviceModel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    gap: 4,
  },
  connectBtnConnected: {
    backgroundColor: Colors.primarySoft,
  },
  connectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  connectBtnTextConnected: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});
