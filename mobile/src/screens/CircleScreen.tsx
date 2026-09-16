import React, { useState } from 'react';
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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Users,
  Shield,
  ShieldAlert,
  EyeOff,
  Eye,
  QrCode,
  UserPlus,
  Plus,
  Check,
  CheckCircle2,
  Radio,
  MapPin,
  BatteryMedium,
  Sparkles,
  X,
  Trash2,
  Luggage,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';
import { AddFriendModal } from '../components/AddFriendModal';
import { SentiAvatars } from '../assets/mascotMap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CircleScreenProps {
  onBack: () => void;
}

export const CircleScreen: React.FC<CircleScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const {
    mode,
    toggleMode,
    ghostMode,
    toggleGhostMode,
    friends,
    groups,
    incomingRequests,
    acceptFriendRequest,
    declineFriendRequest,
    blockUser,
    createGroup,
    toggleGroupGearPacked,
  } = useCircle();

  const [activeTab, setActiveTab] = useState<'friends' | 'tribes'>('friends');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateTribeModal, setShowCreateTribeModal] = useState(false);

  // New Tribe Form
  const [tribeName, setTribeName] = useState('');
  const [tribeColor, setTribeColor] = useState('#064E3B');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  const handleCreateTribe = () => {
    if (!tribeName.trim()) {
      Alert.alert('Name Required', 'Please provide a name for your journey tribe.');
      return;
    }
    if (selectedFriendIds.length < 1 || selectedFriendIds.length > 9) {
      Alert.alert('Member Boundary', 'A tribe must have between 2 and 10 members (including yourself). Please select 1 to 9 companions.');
      return;
    }

    const success = createGroup(tribeName.trim(), tribeColor, selectedFriendIds);
    if (success) {
      setTribeName('');
      setSelectedFriendIds([]);
      setShowCreateTribeModal(false);
    }
  };

  const toggleFriendSelection = (id: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF3E7" translucent={true} />

      {/* Warm Cognac Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.cognacAmber} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Sentia Circle</Text>
          <View style={styles.modeBadge}>
            <View style={[styles.modeDot, { backgroundColor: mode === 'friends' ? Colors.cognacAmber : Colors.primary }]} />
            <Text style={styles.modeText}>
              {mode === 'friends' ? 'Friends Duality Active' : 'Solo Mode'}
            </Text>
          </View>
        </View>

        {/* 1-Tap Mode Duality Switch */}
        <TouchableOpacity style={styles.modeToggleBtn} onPress={toggleMode}>
          <Text style={styles.modeToggleText}>
            {mode === 'friends' ? 'Switch Solo' : 'Switch Circle'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1-Tap Ghost Shield Banner */}
        <TouchableOpacity
          style={[styles.ghostCard, ghostMode ? styles.ghostCardActive : styles.ghostCardInactive]}
          onPress={toggleGhostMode}
          activeOpacity={0.85}
        >
          <View style={styles.ghostIconWrapper}>
            {ghostMode ? (
              <EyeOff size={20} color="#FAF6EE" />
            ) : (
              <Eye size={20} color={Colors.cognacAmber} />
            )}
          </View>
          <View style={styles.ghostTextContent}>
            <View style={styles.ghostTitleRow}>
              <Text style={[styles.ghostTitle, ghostMode && styles.textWhite]}>
                {ghostMode ? 'Ghost Shield Engaged' : 'Ghost Shield Disengaged'}
              </Text>
              <View style={[styles.ghostStatusBadge, ghostMode ? styles.ghostBadgeDark : styles.ghostBadgeLight]}>
                <Text style={[styles.ghostStatusText, ghostMode && styles.textWhite]}>
                  {ghostMode ? '● INVISIBLE' : '○ VISIBLE'}
                </Text>
              </View>
            </View>
            <Text style={[styles.ghostSub, ghostMode && styles.textMutedWhite]}>
              {ghostMode
                ? 'Your bag telemetry, GPS & status are RLS-shielded from all companions.'
                : 'Verified companions can view your bag battery and safe arrival alerts.'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Incoming Friend Requests Banner */}
        {incomingRequests.length > 0 && (
          <View style={styles.incomingBanner}>
            <Text style={styles.incomingTitle}>Incoming Connection Requests</Text>
            {incomingRequests.map((req) => (
              <View key={req.id} style={styles.incomingItem}>
                <Text style={styles.incomingName}>{req.name} ({req.friendCode})</Text>
                <View style={styles.incomingActions}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => acceptFriendRequest(req.id)}
                  >
                    <Check size={14} color="#FAF6EE" />
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => declineFriendRequest(req.id)}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => setShowAddFriendModal(true)}
          >
            <UserPlus size={16} color="#FAF6EE" />
            <Text style={styles.primaryActionBtnText}>Add Companion</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => setShowCreateTribeModal(true)}
          >
            <Plus size={16} color={Colors.cognacAmber} />
            <Text style={styles.secondaryActionBtnText}>New Tribe</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector: Companions vs Tribes */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'friends' && styles.tabBtnActive]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setActiveTab('friends');
            }}
          >
            <Users size={15} color={activeTab === 'friends' ? Colors.cognacAmber : Colors.textTertiary} />
            <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
              Companions ({friends.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'tribes' && styles.tabBtnActive]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setActiveTab('tribes');
            }}
          >
            <Luggage size={15} color={activeTab === 'tribes' ? Colors.cognacAmber : Colors.textTertiary} />
            <Text style={[styles.tabText, activeTab === 'tribes' && styles.tabTextActive]}>
              Group Tribes ({groups.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Companions Feed */}
        {activeTab === 'friends' && (
          <View style={styles.listSection}>
            {friends.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <Image
                  source={SentiAvatars[friend.avatarMood] || SentiAvatars['01_happy']}
                  style={styles.friendAvatar}
                  resizeMode="contain"
                />

                <View style={styles.friendInfo}>
                  <View style={styles.friendNameRow}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    {friend.isOnline && <View style={styles.onlineDot} />}
                  </View>
                  <Text style={styles.friendBag}>{friend.bagModel}</Text>
                  <Text style={styles.friendStatusText}>{friend.safeStatusText}</Text>
                </View>

                <View style={styles.friendRight}>
                  <View style={styles.batteryPill}>
                    <BatteryMedium size={12} color={Colors.cognacAmber} />
                    <Text style={styles.batteryPillText}>{friend.battery}%</Text>
                  </View>
                  <Text style={styles.distanceText}>{friend.distanceText}</Text>

                  <TouchableOpacity
                    style={styles.blockBtn}
                    onPress={() => {
                      Alert.alert(
                        'Block Companion',
                        `Are you sure you want to block ${friend.name}? They will no longer see your bag status.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Block', style: 'destructive', onPress: () => blockUser(friend.id) },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.blockBtnText}>Block</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 2: Group Tribes Feed (2 to 10 Members) */}
        {activeTab === 'tribes' && (
          <View style={styles.listSection}>
            {groups.length === 0 ? (
              <View style={styles.emptyTribeCard}>
                <Luggage size={32} color={Colors.cognacAmber} />
                <Text style={styles.emptyTribeTitle}>No Active Journey Tribes</Text>
                <Text style={styles.emptyTribeSub}>
                  Create a tribe with 2 to 10 friends to share packing checklists, battery levels, and safe arrivals.
                </Text>
                <TouchableOpacity
                  style={styles.emptyCreateBtn}
                  onPress={() => setShowCreateTribeModal(true)}
                >
                  <Plus size={14} color="#FAF6EE" />
                  <Text style={styles.emptyCreateBtnText}>Create 2-10 Member Tribe</Text>
                </TouchableOpacity>
              </View>
            ) : (
              groups.map((group) => (
                <View key={group.id} style={styles.tribeCard}>
                  <View style={styles.tribeHeader}>
                    <View style={styles.tribeTitleGroup}>
                      <View style={[styles.tribeColorStrip, { backgroundColor: group.accentColor }]} />
                      <View>
                        <Text style={styles.tribeName}>{group.name}</Text>
                        <Text style={styles.tribeMembersSub}>
                          {group.memberCount} of {group.maxMembers} Members • {group.description}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Members Avatars Row */}
                  <View style={styles.memberAvatarsRow}>
                    {group.members.map((m, idx) => (
                      <View key={m.id} style={[styles.avatarBubble, { zIndex: 10 - idx }]}>
                        <Text style={styles.avatarLetter}>{m.name[0]}</Text>
                      </View>
                    ))}
                    <View style={styles.avatarBubbleYou}>
                      <Text style={styles.avatarLetterYou}>You</Text>
                    </View>
                  </View>

                  {/* Collaborative Gear Packing Section */}
                  <View style={styles.tribeGearSection}>
                    <Text style={styles.gearSectionTitle}>Tribe Collaborative Gear</Text>
                    {group.gearChecklist.length === 0 ? (
                      <Text style={styles.emptyGearText}>
                        No shared gear assigned yet. All member bags connected.
                      </Text>
                    ) : (
                      group.gearChecklist.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.gearItemRow}
                          onPress={() => toggleGroupGearPacked(group.id, item.id)}
                        >
                          <View style={[styles.gearCheckbox, item.isPacked && styles.gearCheckboxPacked]}>
                            {item.isPacked && <Check size={12} color="#FAF6EE" />}
                          </View>
                          <Text style={[styles.gearTitle, item.isPacked && styles.gearTitlePacked]}>
                            {item.title} ({item.assignedToName})
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Tri-Option Add Friend Drawer */}
      <AddFriendModal
        visible={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
      />

      {/* Modal: Create Tribe (Strictly 2–10 Members) */}
      <Modal visible={showCreateTribeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Journey Tribe</Text>
              <TouchableOpacity onPress={() => setShowCreateTribeModal(false)}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Collaborative gear checklists & bag status for 2 to 10 companions.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Tribe Name (e.g. Kyoto Expedition, Family Weekend)"
              placeholderTextColor={Colors.textTertiary}
              value={tribeName}
              onChangeText={setTribeName}
            />

            <Text style={styles.fieldLabel}>
              Select Companions ({selectedFriendIds.length + 1} of 10):
            </Text>

            <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
              {friends.map((friend) => {
                const isSelected = selectedFriendIds.includes(friend.id);
                return (
                  <TouchableOpacity
                    key={friend.id}
                    style={[styles.friendSelectRow, isSelected && styles.friendSelectRowActive]}
                    onPress={() => toggleFriendSelection(friend.id)}
                  >
                    <View style={[styles.miniCheckbox, isSelected && styles.miniCheckboxActive]}>
                      {isSelected && <Check size={12} color="#FAF6EE" />}
                    </View>
                    <Text style={styles.selectFriendName}>{friend.name}</Text>
                    <Text style={styles.selectFriendModel}>{friend.bagModel}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateTribe}>
              <Text style={styles.modalSubmitBtnText}>Create Tribe</Text>
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
    backgroundColor: '#FAF3E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: '#FAF3E7',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeText: {
    fontSize: 11,
    color: Colors.cognacAmber,
    fontWeight: '600',
  },
  modeToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.subtle,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  ghostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    ...Shadows.card,
  },
  ghostCardActive: {
    backgroundColor: '#0F1F1A',
    borderColor: '#10B981',
  },
  ghostCardInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEDCC0',
  },
  ghostIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.cognacAmber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostTextContent: {
    flex: 1,
    marginLeft: 12,
  },
  ghostTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ghostTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ghostStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ghostBadgeDark: {
    backgroundColor: '#064E3B',
  },
  ghostBadgeLight: {
    backgroundColor: '#FAF3E7',
  },
  ghostStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.cognacAmber,
  },
  ghostSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  textWhite: {
    color: '#FAF6EE',
  },
  textMutedWhite: {
    color: '#A7B5AF',
  },
  incomingBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  incomingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  incomingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomingName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  incomingActions: {
    flexDirection: 'row',
    gap: 6,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  declineBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  declineBtnText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: Spacing.sm,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cognacAmber,
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    gap: 6,
    ...Shadows.subtle,
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.subtle,
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EEDCC0',
    borderRadius: BorderRadius.pill,
    padding: 3,
    marginVertical: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.cognacAmber,
  },
  listSection: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.card,
  },
  friendAvatar: {
    width: 44,
    height: 44,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.statusSuccess,
  },
  friendBag: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  friendStatusText: {
    fontSize: 11,
    color: Colors.cognacAmber,
    fontWeight: '500',
    marginTop: 2,
  },
  friendRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  batteryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  distanceText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  blockBtn: {
    marginTop: 2,
  },
  blockBtnText: {
    fontSize: 10,
    color: '#B91C1C',
    fontWeight: '600',
  },
  emptyTribeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  emptyTribeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptyTribeSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cognacAmber,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
    gap: 6,
    marginTop: Spacing.md,
  },
  emptyCreateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  tribeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.card,
  },
  tribeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tribeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tribeColorStrip: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  tribeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tribeMembersSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  memberAvatarsRow: {
    flexDirection: 'row',
    marginVertical: Spacing.md,
    paddingLeft: 4,
  },
  avatarBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  avatarBubbleYou: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cognacAmber,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 1,
  },
  avatarLetterYou: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FAF6EE',
  },
  tribeGearSection: {
    backgroundColor: '#FAF3E7',
    borderRadius: 12,
    padding: 10,
  },
  gearSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cognacAmber,
    marginBottom: 6,
  },
  emptyGearText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  gearItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  gearCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#EEDCC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  gearCheckboxPacked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  gearTitle: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  gearTitlePacked: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
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
    marginBottom: 4,
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
    backgroundColor: '#FAF3E7',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  friendSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#FAF3E7',
  },
  friendSelectRowActive: {
    backgroundColor: '#FEF3C7',
  },
  miniCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#EEDCC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniCheckboxActive: {
    backgroundColor: Colors.cognacAmber,
    borderColor: Colors.cognacAmber,
  },
  selectFriendName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  selectFriendModel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.cognacAmber,
    borderRadius: BorderRadius.pill,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
});
