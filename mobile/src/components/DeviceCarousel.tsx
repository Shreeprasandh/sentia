import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native';
import {
  Lock,
  Unlock,
  BatteryCharging,
  BatteryMedium,
  CheckCircle,
  Sparkles,
  Power,
  Plus,
  Trash2,
  Box,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';
import { MultiDeviceBag } from '../types';
import { PairDeviceModal } from './PairDeviceModal';
import { Sentia3DViewer } from './Sentia3DViewer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

export const DeviceCarousel: React.FC = () => {
  const { bags, activeBagId, setActiveBagId, setPrimaryBag, toggleBagConnection, removeBag, toggleBagLock } = useCircle();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPairModal, setShowPairModal] = useState(false);
  const [viewModeMap, setViewModeMap] = useState<Record<string, '2d' | '3d'>>({});

  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < bags.length) {
      setActiveIndex(index);
      const targetBag = bags[index];
      if (targetBag) {
        setActiveBagId(targetBag.id);
      }
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  };

  const handleSetPrimaryWithConfirmation = (bag: MultiDeviceBag) => {
    Alert.alert(
      'Set as Primary Device?',
      `Make "${bag.name}" your primary smart device? Quick actions, hardware alerts, and dashboard widgets will prioritize this bag.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setPrimaryBag(bag.id);
            setActiveIndex(0);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          },
        },
      ]
    );
  };

  const handleUnpairWithConfirmation = (bag: MultiDeviceBag) => {
    Alert.alert(
      'Unpair Device',
      `Are you sure you want to disconnect and unpair "${bag.name}"? It can be re-bonded anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpair',
          style: 'destructive',
          onPress: () => removeBag(bag.id),
        },
      ]
    );
  };

  const handleToggleConnectionWithConfirmation = (bag: MultiDeviceBag) => {
    if (bag.isConnected) {
      Alert.alert(
        'Disconnect Device?',
        `Disconnect Bluetooth connection with "${bag.name}"? Live load cell telemetry, tamper sensing, and proximity alerts will be suspended.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => toggleBagConnection(bag.id),
          },
        ]
      );
    } else {
      toggleBagConnection(bag.id);
    }
  };

  const renderBagCard = ({ item }: { item: MultiDeviceBag }) => {
    const isPrimary = item.role === 'primary';
    const isLocked = item.isLocked;

    return (
      <View style={[styles.card, isPrimary ? styles.cardPrimary : styles.cardSecondary]}>
        {/* Card Header: Device Name, Role Badge, and Symmetrical Lock Toggle */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.bagName}>{item.name}</Text>
              <View
                style={[
                  styles.roleBadge,
                  isPrimary ? styles.roleBadgePrimary : styles.roleBadgeSecondary,
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    isPrimary ? styles.roleBadgeTextPrimary : styles.roleBadgeTextSecondary,
                  ]}
                >
                  {item.role.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.bagModel}>{item.model}</Text>
          </View>

          {/* Symmetrical Lock Button without Rectangular Artifacts */}
          <Pressable
            style={({ pressed }) => [
              styles.lockButton,
              isLocked ? styles.lockButtonArmed : styles.lockButtonDisarmed,
              pressed && styles.lockButtonPressed,
            ]}
            onPress={() => toggleBagLock(item.id)}
            android_ripple={null}
            focusable={false}
          >
            {isLocked ? (
              <Lock size={14} color="#FAF6EE" />
            ) : (
              <Unlock size={14} color={Colors.textPrimary} />
            )}
            <Text
              style={[
                styles.lockButtonText,
                isLocked ? styles.textInverse : styles.textDark,
              ]}
            >
              {isLocked ? 'Protected' : 'Unlocked'}
            </Text>
          </Pressable>
        </View>

        {/* Bag Visual & Floating 2D/3D Mode Badge */}
        <View style={styles.visualWrapper}>
          <TouchableOpacity
            style={styles.floating3DBadge}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setViewModeMap((prev) => ({
                ...prev,
                [item.id]: (prev[item.id] || '2d') === '2d' ? '3d' : '2d',
              }));
            }}
            activeOpacity={0.8}
            accessibilityLabel={
              (viewModeMap[item.id] || '2d') === '3d'
                ? 'Switch to 2D studio photo'
                : 'Switch to 3D interactive model'
            }
          >
            {(viewModeMap[item.id] || '2d') === '3d' ? (
              <>
                <ImageIcon size={11} color={Colors.primary} style={{ marginRight: 3 }} />
                <Text style={styles.floatingBadgeText}>2D</Text>
              </>
            ) : (
              <>
                <Box size={11} color={Colors.primary} style={{ marginRight: 3 }} />
                <Text style={styles.floatingBadgeText}>3D</Text>
              </>
            )}
          </TouchableOpacity>

          {viewModeMap[item.id] === '3d' ? (
            <Sentia3DViewer bagId={item.id} height={180} autoRotate={true} />
          ) : (
            <Image source={item.image} style={styles.bagImage} resizeMode="contain" />
          )}
        </View>

        {/* Telemetry Row */}
        <View style={styles.telemetryRow}>
          <View style={styles.telemPill}>
            {item.isCharging ? (
              <BatteryCharging size={14} color={Colors.batteryGreen} />
            ) : (
              <BatteryMedium
                size={14}
                color={item.battery > 20 ? Colors.primary : Colors.statusWarning}
              />
            )}
            <Text style={styles.telemText}>{item.battery}% Battery</Text>
          </View>

          <View style={styles.telemPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isConnected ? Colors.statusSuccess : Colors.textTertiary },
              ]}
            />
            <Text style={styles.telemText}>{item.lastSeenText}</Text>
          </View>
        </View>

        {/* Device Controls: 1-Tap Connect/Disconnect & Primary Promotion */}
        <View style={styles.deviceControlsRow}>
          <TouchableOpacity
            style={[
              styles.connectionToggleBtn,
              item.isConnected ? styles.connBtnConnected : styles.connBtnDisconnected,
            ]}
            onPress={() => handleToggleConnectionWithConfirmation(item)}
          >
            <Power size={13} color={item.isConnected ? Colors.primary : Colors.textTertiary} />
            <Text
              style={[
                styles.connBtnText,
                { color: item.isConnected ? Colors.primary : Colors.textTertiary },
              ]}
            >
              {item.isConnected ? 'Disconnect' : 'Connect BLE'}
            </Text>
          </TouchableOpacity>

          {!isPrimary ? (
            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.setPrimaryButton}
                onPress={() => handleSetPrimaryWithConfirmation(item)}
                activeOpacity={0.8}
              >
                <Sparkles size={13} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.setPrimaryText}>Set Primary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.unpairBtn}
                onPress={() => handleUnpairWithConfirmation(item)}
              >
                <Trash2 size={13} color="#B91C1C" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.primaryActiveBadge}>
              <CheckCircle size={13} color={Colors.primary} />
              <Text style={styles.primaryActiveText}>Active Primary</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={bags}
        keyExtractor={(item) => item.id}
        renderItem={renderBagCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
      />

      {/* Pagination Row with + Pair Bag Trigger */}
      <View style={styles.footerRow}>
        <View style={styles.paginationRow}>
          {bags.map((bag, idx) => (
            <View
              key={bag.id}
              style={[
                styles.dot,
                idx === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {bags.length < 3 && (
          <TouchableOpacity
            style={styles.pairNewTrigger}
            onPress={() => setShowPairModal(true)}
          >
            <Plus size={13} color={Colors.primary} />
            <Text style={styles.pairNewTriggerText}>Pair Bag</Text>
          </TouchableOpacity>
        )}
      </View>

      <PairDeviceModal
        visible={showPairModal}
        onClose={() => setShowPairModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.canvasElevated,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  cardPrimary: {
    borderColor: '#064E3B',
  },
  cardSecondary: {
    borderColor: Colors.cardAccentBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bagName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  roleBadgePrimary: {
    backgroundColor: Colors.primarySoft,
  },
  roleBadgeSecondary: {
    backgroundColor: Colors.cardAccent,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  roleBadgeTextPrimary: {
    color: Colors.primary,
  },
  roleBadgeTextSecondary: {
    color: Colors.textSecondary,
  },
  bagModel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
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
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },
  textInverse: {
    color: Colors.textInverse,
  },
  textDark: {
    color: Colors.textPrimary,
  },
  visualWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
    width: '100%',
    minHeight: 175,
  },
  floating3DBadge: {
    position: 'absolute',
    top: 4,
    right: 6,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 246, 238, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  bagImage: {
    width: '100%',
    height: 170,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
    paddingTop: Spacing.md,
  },
  telemPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  telemText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  setPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardAccent,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  setPrimaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  primaryCard: {
    borderColor: '#064E3B',
    borderWidth: 1.5,
  },
  secondaryCard: {
    borderColor: Colors.cardAccentBorder,
  },
  deviceControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 8,
  },
  connectionToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.pill,
    gap: 6,
    borderWidth: 1,
  },
  connBtnConnected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  connBtnDisconnected: {
    backgroundColor: Colors.canvasWarm,
    borderColor: Colors.borderLight,
  },
  connBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unpairBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  primaryActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairNewTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasWarm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  pairNewTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.cardAccentBorder,
  },
});
