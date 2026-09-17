import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {
  X,
  Shield,
  ShieldAlert,
  BatteryMedium,
  MapPin,
  Radio,
  Volume2,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { FriendContact } from '../types';
import { SentiAvatars } from '../assets/mascotMap';
import { useCircle } from '../context/CircleContext';

interface CompanionDetailModalProps {
  visible: boolean;
  companion: FriendContact | null;
  onClose: () => void;
}

export const CompanionDetailModal: React.FC<CompanionDetailModalProps> = ({
  visible,
  companion,
  onClose,
}) => {
  const { blockUser } = useCircle();

  if (!companion) return null;

  const handlePingBeacon = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Alert.alert(
      'Acoustic Beacon Ping Sent',
      `An encrypted proximity chime request was dispatched to ${companion.name}'s ${companion.bagModel}.`
    );
  };

  const handleRemoveCompanion = () => {
    Alert.alert(
      'Remove Companion',
      `Are you sure you want to disconnect ${companion.name}? You will no longer share live hardware telemetry or arrival logs.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            blockUser(companion.id);
            onClose();
          },
        },
      ]
    );
  };

  const isJoined = companion.inviteStatus !== 'pending';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerBadge}>VERIFIED COMPANION</Text>
              <Text style={styles.headerTitle}>{companion.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Identity Card */}
            <View style={styles.identityCard}>
              <Image
                source={SentiAvatars[companion.avatarMood] || SentiAvatars['01_happy']}
                style={styles.avatarImage}
                resizeMode="contain"
              />
              <View style={styles.identityTextGroup}>
                <Text style={styles.salutation}>{companion.salutation || 'Executive Member'}</Text>
                <Text style={styles.name}>{companion.name}</Text>
                <View style={styles.codeRow}>
                  <Text style={styles.codeLabel}>Circle Code: </Text>
                  <Text style={styles.codeValue}>{companion.friendCode}</Text>
                </View>
              </View>
              <View style={[styles.statusPill, isJoined ? styles.statusPillActive : styles.statusPillPending]}>
                <Text style={[styles.statusPillText, isJoined ? styles.statusPillTextActive : styles.statusPillTextPending]}>
                  {isJoined ? 'JOINED' : 'INVITED'}
                </Text>
              </View>
            </View>

            {/* Hardware & Live Telemetry Section */}
            <Text style={styles.sectionHeading}>Device Telemetry & Safe Zone</Text>
            <View style={styles.telemetryCard}>
              <View style={styles.telemetryRow}>
                <View style={styles.telemetryCol}>
                  <Text style={styles.metaLabel}>Hardware Model</Text>
                  <Text style={styles.metaValue}>{companion.bagModel}</Text>
                </View>
                <View style={styles.batteryBadge}>
                  <BatteryMedium size={14} color={Colors.primary} />
                  <Text style={styles.batteryText}>{companion.battery}% Battery</Text>
                </View>
              </View>

              <View style={styles.telemetryDivider} />

              <View style={styles.telemetryRow}>
                <View style={styles.locationGroup}>
                  <MapPin size={14} color={Colors.cognacAmber} style={{ marginRight: 6 }} />
                  <Text style={styles.locationText}>
                    {companion.lastSeenLocation || companion.safeStatusText}
                  </Text>
                </View>
                <View style={styles.proximityBadge}>
                  <Radio size={12} color={companion.isNearby ? Colors.statusSuccess : Colors.primary} />
                  <Text style={styles.proximityText}>{companion.distanceText}</Text>
                </View>
              </View>

              <View style={styles.telemetryDivider} />

              <View style={styles.safeZoneRow}>
                <Shield size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.safeZoneText}>
                  Safe Zone: {companion.safeZoneStatus === 'outside_boundary' ? 'Outside Custom Boundary' : 'Inside Designated Perimeter'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <Text style={styles.sectionHeading}>Companion Interactions</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.pingActionButton}
                onPress={handlePingBeacon}
                activeOpacity={0.85}
              >
                <Volume2 size={16} color="#FAF6EE" />
                <Text style={styles.pingActionText}>Send Proximity Acoustic Chime</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeActionButton}
                onPress={handleRemoveCompanion}
                activeOpacity={0.85}
              >
                <Trash2 size={16} color="#B91C1C" />
                <Text style={styles.removeActionText}>Revoke Circle Pairing</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 31, 26, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.cognacAmber,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingVertical: Spacing.md,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasElevated,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 50,
    height: 50,
  },
  identityTextGroup: {
    flex: 1,
    marginLeft: 12,
  },
  salutation: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  codeLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  codeValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillActive: {
    backgroundColor: '#E6F4EA',
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPillTextActive: {
    color: Colors.primary,
  },
  statusPillTextPending: {
    color: '#D97706',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  telemetryCard: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginBottom: Spacing.md,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  telemetryCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  batteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF6EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  batteryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  telemetryDivider: {
    height: 1,
    backgroundColor: Colors.cardAccentBorder,
    marginVertical: 10,
  },
  locationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  proximityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proximityText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  safeZoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safeZoneText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 10,
    marginTop: Spacing.xs,
  },
  pingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: BorderRadius.pill,
    ...Shadows.subtle,
  },
  pingActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  removeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
  },
  removeActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
});
