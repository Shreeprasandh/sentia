import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import {
  X,
  Shield,
  CheckCircle2,
  Clock,
  MapPin,
  BatteryMedium,
  Plus,
  Trash2,
  Luggage,
  Users,
  Check,
  Radio,
  UserPlus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { GroupTribe } from '../types';
import { SentiAvatars } from '../assets/mascotMap';
import { useCircle } from '../context/CircleContext';

interface TribeHubModalProps {
  visible: boolean;
  tribe: GroupTribe | null;
  onClose: () => void;
}

const CATEGORIES = ['Electronics', 'Hydration', 'First Aid', 'Apparel', 'Documents', 'Tools'];

export const TribeHubModal: React.FC<TribeHubModalProps> = ({
  visible,
  tribe,
  onClose,
}) => {
  const {
    toggleGroupGearPacked,
    addGroupGearItem,
    removeGroupGearItem,
    profile,
    friends,
    groups,
    addMembersToGroup,
  } = useCircle();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [assignedTo, setAssignedTo] = useState('You');

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  if (!tribe) return null;
  const activeTribe = groups.find((g) => g.id === tribe.id) || tribe;

  const packedCount = activeTribe.gearChecklist.filter((g) => g.isPacked).length;
  const totalGear = activeTribe.gearChecklist.length;
  const packedPct = totalGear > 0 ? Math.round((packedCount / totalGear) * 100) : 100;

  const handleTogglePacked = (itemId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    toggleGroupGearPacked(activeTribe.id, itemId);
  };

  const handleRemoveItem = (itemId: string, title: string) => {
    Alert.alert(
      'Remove Gear Item',
      `Are you sure you want to remove "${title}" from the expedition manifest?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeGroupGearItem(activeTribe.id, itemId);
          },
        },
      ]
    );
  };

  const handleCommitNewItem = () => {
    if (!newItemTitle.trim()) {
      Alert.alert('Title Required', 'Please enter an item title for the manifest.');
      return;
    }
    addGroupGearItem(activeTribe.id, newItemTitle.trim(), newCategory, assignedTo);
    setNewItemTitle('');
    setShowAddForm(false);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  const memberOptions = ['You', ...activeTribe.members.map((m) => m.name)];

  const existingMemberIds = new Set(activeTribe.members.map((m) => m.id));
  const availableFriends = friends.filter((f) => !existingMemberIds.has(f.id));
  const maxCanAdd = Math.max(0, 10 - (activeTribe.members.length + 1));

  const handleToggleFriend = (friendId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (selectedFriendIds.includes(friendId)) {
      setSelectedFriendIds(selectedFriendIds.filter((id) => id !== friendId));
    } else {
      if (selectedFriendIds.length >= maxCanAdd) {
        Alert.alert('Pod Limit Reached', 'This expedition pod can hold at most 10 companions total.');
        return;
      }
      setSelectedFriendIds([...selectedFriendIds, friendId]);
    }
  };

  const handleConfirmAddFriends = () => {
    if (selectedFriendIds.length === 0) return;
    addMembersToGroup(activeTribe.id, selectedFriendIds);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setShowAddMemberModal(false);
    setSelectedFriendIds([]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.badgeRow}>
                <View style={[styles.tribeColorPip, { backgroundColor: activeTribe.accentColor }]} />
                <Text style={styles.headerBadge}>EXPEDITION POD • 2-10 MEMBERS</Text>
              </View>
              <Text style={styles.headerTitle}>{activeTribe.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Overview / Manifest Progress Card */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <View>
                  <Text style={styles.overviewSub}>{tribe.description || 'Synchronized Expedition Tribe'}</Text>
                  <Text style={styles.rosterCountText}>
                    {tribe.memberCount} of {tribe.maxMembers} Companions Synchronized
                  </Text>
                </View>
                <View style={styles.progressPill}>
                  <Text style={styles.progressPctText}>{packedPct}% Stowed</Text>
                </View>
              </View>

              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${packedPct}%` }]} />
              </View>
              <View style={styles.progressMetaRow}>
                <Text style={styles.progressMetaText}>
                  {packedCount} of {totalGear} critical items verified packed
                </Text>
              </View>
            </View>

            {/* Collaborative Gear Manifest Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Luggage size={16} color={Colors.cognacAmber} />
                  <Text style={styles.sectionTitle}>Shared Pod Manifest</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{totalGear}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addGearBtn}
                  onPress={() => setShowAddForm(!showAddForm)}
                  activeOpacity={0.8}
                >
                  <Plus size={14} color={Colors.cognacAmber} />
                  <Text style={styles.addGearBtnText}>{showAddForm ? 'Cancel' : 'Assign Item'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionSubtitle}>
                Decentralized gear tracking. Mark items as packed once stowed inside your Sentia pack.
              </Text>

              {/* Inline Add Gear Form */}
              {showAddForm && (
                <View style={styles.addGearBox}>
                  <Text style={styles.addGearBoxTitle}>Add Item to Expedition Manifest</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Item name (e.g., Sat-Phone, High-Yield Power Bank)"
                    placeholderTextColor={Colors.textTertiary}
                    value={newItemTitle}
                    onChangeText={setNewItemTitle}
                  />

                  {/* Category Chips */}
                  <Text style={styles.miniLabel}>Category:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, newCategory === cat && styles.categoryChipActive]}
                        onPress={() => setNewCategory(cat)}
                      >
                        <Text
                          style={[styles.categoryChipText, newCategory === cat && styles.categoryChipTextActive]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Assignee Chips */}
                  <Text style={styles.miniLabel}>Assigned Expeditor:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                    {memberOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.assigneeChip, assignedTo === opt && styles.assigneeChipActive]}
                        onPress={() => setAssignedTo(opt)}
                      >
                        <Text
                          style={[styles.assigneeChipText, assignedTo === opt && styles.assigneeChipTextActive]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.commitBtn}
                    onPress={handleCommitNewItem}
                    activeOpacity={0.85}
                  >
                    <Check size={14} color="#FAF6EE" />
                    <Text style={styles.commitBtnText}>Commit to Pod Manifest</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Gear Items List */}
              {activeTribe.gearChecklist.length === 0 ? (
                <View style={styles.emptyGearContainer}>
                  <Text style={styles.emptyGearText}>No shared gear registered yet.</Text>
                  <Text style={styles.emptyGearSubText}>
                    Tap Assign Item to allocate expedition hardware across companion bags.
                  </Text>
                </View>
              ) : (
                activeTribe.gearChecklist.map((item) => (
                  <View key={item.id} style={styles.gearItemRow}>
                    <TouchableOpacity
                      style={[styles.checkboxCircle, item.isPacked && styles.checkboxCircleChecked]}
                      onPress={() => handleTogglePacked(item.id)}
                      activeOpacity={0.7}
                    >
                      {item.isPacked && <Check size={12} color="#FAF6EE" />}
                    </TouchableOpacity>

                    <View style={styles.gearDetails}>
                      <Text style={[styles.gearItemTitle, item.isPacked && styles.gearItemTitlePacked]}>
                        {item.title}
                      </Text>
                      <View style={styles.gearMetaRow}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{item.category || 'General'}</Text>
                        </View>
                        <Text style={styles.assignedToText}>Assigned: {item.assignedToName}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.trashBtn}
                      onPress={() => handleRemoveItem(item.id, item.title)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={15} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Expedition Pod Roster */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Users size={16} color={Colors.cognacAmber} />
                  <Text style={styles.sectionTitle}>Pod Roster ({activeTribe.members.length + 1} of 10)</Text>
                </View>
                {maxCanAdd > 0 && availableFriends.length > 0 && (
                  <TouchableOpacity
                    style={styles.addMemberBtn}
                    onPress={() => {
                      setSelectedFriendIds([]);
                      setShowAddMemberModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <UserPlus size={14} color={Colors.cognacAmber} />
                    <Text style={styles.addMemberBtnText}>Add Companion</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Self / Leader Entry */}
              <View style={styles.rosterCard}>
                <View style={styles.rosterAvatarWrapper}>
                  <Image source={SentiAvatars['01_happy']} style={styles.rosterAvatar} resizeMode="contain" />
                </View>
                <View style={styles.rosterInfo}>
                  <View style={styles.rosterNameRow}>
                    <Text style={styles.rosterName}>{profile.name || 'You'}</Text>
                    <View style={styles.leaderBadge}>
                      <Text style={styles.leaderBadgeText}>POD LEADER</Text>
                    </View>
                  </View>
                  <Text style={styles.rosterModel}>Primary Executive Pack • Master Sync</Text>
                  <View style={styles.rosterTelemetryRow}>
                    <View style={styles.statusDotActive} />
                    <Text style={styles.rosterTelemetryText}>Local Master Link Active</Text>
                  </View>
                </View>
              </View>

              {/* Companions Entries */}
              {activeTribe.members.map((member) => (
                <View key={member.id} style={styles.rosterCard}>
                  <View style={styles.rosterAvatarWrapper}>
                    <Image
                      source={SentiAvatars[member.avatarMood] || SentiAvatars['01_happy']}
                      style={styles.rosterAvatar}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.rosterInfo}>
                    <View style={styles.rosterNameRow}>
                      <Text style={styles.rosterName}>{member.name}</Text>
                      <View
                        style={[
                          styles.consentPill,
                          member.inviteStatus === 'pending'
                            ? styles.consentPillPending
                            : styles.consentPillJoined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.consentPillText,
                            member.inviteStatus === 'pending'
                              ? styles.consentPillTextPending
                              : styles.consentPillTextJoined,
                          ]}
                        >
                          {member.inviteStatus === 'pending' ? 'Consent Pending' : 'Encrypted Link'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.rosterModel}>{member.bagModel}</Text>
                    <View style={styles.rosterTelemetryRow}>
                      <BatteryMedium size={12} color={Colors.cognacAmber} />
                      <Text style={styles.rosterBatteryText}>{member.battery}%</Text>
                      <Text style={styles.rosterDivider}>•</Text>
                      <Text style={styles.rosterDistanceText}>{member.distanceText}</Text>
                      <Text style={styles.rosterDivider}>•</Text>
                      <Text style={styles.rosterSafeStatus}>{member.safeStatusText}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Safe Arrivals Log */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <MapPin size={16} color={Colors.cognacAmber} />
                  <Text style={styles.sectionTitle}>Waypoint & Arrival Logs</Text>
                </View>
              </View>

              {activeTribe.safeArrivals && activeTribe.safeArrivals.length > 0 ? (
                activeTribe.safeArrivals.map((log) => (
                  <View key={log.id} style={styles.arrivalRow}>
                    <CheckCircle2 size={16} color="#059669" />
                    <View style={styles.arrivalInfo}>
                      <Text style={styles.arrivalUser}>{log.userName}</Text>
                      <Text style={styles.arrivalLoc}>Safely arrived at {log.locationName}</Text>
                    </View>
                    <Text style={styles.arrivalTimestamp}>{log.timestamp}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyArrivalsBox}>
                  <Clock size={16} color={Colors.textTertiary} />
                  <Text style={styles.emptyArrivalsText}>
                    All expedition members currently in transit or synchronized within home base.
                  </Text>
                </View>
              )}
            </View>

            {/* Security Notice */}
            <View style={styles.securityBox}>
              <Shield size={16} color={Colors.cognacAmber} />
              <Text style={styles.securityText}>
                Sentia AES-256 Mesh Protocol. Group telemetry, battery levels, and waypoint check-ins are
                strictly isolated with Supabase Row Level Security.
              </Text>
            </View>
          </ScrollView>

          {/* Sub-Modal: Add Companions to Tribe */}
          <Modal
            visible={showAddMemberModal}
            animationType="fade"
            transparent
            onRequestClose={() => setShowAddMemberModal(false)}
          >
            <View style={styles.subModalOverlay}>
              <View style={styles.subModalCard}>
                <View style={styles.subModalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subModalTitle}>Add Companions</Text>
                    <Text style={styles.subModalSub}>
                      Expand {activeTribe.name} ({maxCanAdd} spot{maxCanAdd === 1 ? '' : 's'} open)
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowAddMemberModal(false)}
                    style={styles.subModalCloseBtn}
                  >
                    <X size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {availableFriends.length === 0 ? (
                  <View style={styles.emptyFriendsContainer}>
                    <Text style={styles.emptyFriendsTitle}>No Available Companions</Text>
                    <Text style={styles.emptyFriendsSub}>
                      All companions in your Social Circle have already joined this expedition pod or reached the 10-companion limit.
                    </Text>
                  </View>
                ) : (
                  <>
                    <ScrollView style={styles.friendListScroll} showsVerticalScrollIndicator={false}>
                      {availableFriends.map((friend) => {
                        const isSelected = selectedFriendIds.includes(friend.id);
                        return (
                          <TouchableOpacity
                            key={friend.id}
                            style={[styles.friendRow, isSelected && styles.friendRowSelected]}
                            onPress={() => handleToggleFriend(friend.id)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.miniCheckCircle, isSelected && styles.miniCheckCircleSelected]}>
                              {isSelected && <Check size={12} color="#FAF6EE" />}
                            </View>
                            <Image
                              source={SentiAvatars[friend.avatarMood] || SentiAvatars['01_happy']}
                              style={styles.friendAvatarSmall}
                              resizeMode="contain"
                            />
                            <View style={styles.friendRowDetails}>
                              <Text style={styles.friendRowName}>{friend.name}</Text>
                              <Text style={styles.friendRowModel}>{friend.bagModel}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    <TouchableOpacity
                      style={[
                        styles.confirmAddBtn,
                        selectedFriendIds.length === 0 && styles.confirmAddBtnDisabled,
                      ]}
                      disabled={selectedFriendIds.length === 0}
                      onPress={handleConfirmAddFriends}
                      activeOpacity={0.85}
                    >
                      <Check size={15} color="#FAF6EE" />
                      <Text style={styles.confirmAddBtnText}>
                        {selectedFriendIds.length > 0
                          ? `Add ${selectedFriendIds.length} Companion${selectedFriendIds.length === 1 ? '' : 's'} to Pod`
                          : 'Select Companions to Add'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FAF3E7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEDCC0',
  },
  headerTitleGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tribeColorPip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.cognacAmber,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.subtle,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  overviewSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rosterCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressPill: {
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  progressPctText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F1E5D1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.cognacAmber,
    borderRadius: 4,
  },
  progressMetaRow: {
    marginTop: 8,
  },
  progressMetaText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.subtle,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  addGearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  addGearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  addGearBox: {
    backgroundColor: '#FAF3E7',
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  addGearBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginBottom: 8,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    marginTop: 4,
  },
  chipsScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  categoryChipActive: {
    backgroundColor: Colors.cognacAmber,
    borderColor: Colors.cognacAmber,
  },
  categoryChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FAF6EE',
  },
  assigneeChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  assigneeChipActive: {
    backgroundColor: '#0F1F1A',
    borderColor: '#0F1F1A',
  },
  assigneeChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  assigneeChipTextActive: {
    color: '#FAF6EE',
  },
  commitBtn: {
    backgroundColor: Colors.cognacAmber,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  commitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  emptyGearContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyGearText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptyGearSubText: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  gearItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EADC',
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxCircleChecked: {
    backgroundColor: Colors.cognacAmber,
    borderColor: Colors.cognacAmber,
  },
  gearDetails: {
    flex: 1,
  },
  gearItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gearItemTitlePacked: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  gearMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  assignedToText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  trashBtn: {
    padding: 6,
  },
  rosterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EADC',
  },
  rosterAvatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF3E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  rosterAvatar: {
    width: 32,
    height: 32,
  },
  rosterInfo: {
    flex: 1,
  },
  rosterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rosterName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  leaderBadge: {
    backgroundColor: '#0F1F1A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leaderBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  consentPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  consentPillJoined: {
    backgroundColor: '#ECFDF5',
  },
  consentPillPending: {
    backgroundColor: '#FEF3C7',
  },
  consentPillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  consentPillTextJoined: {
    color: '#059669',
  },
  consentPillTextPending: {
    color: '#D97706',
  },
  rosterModel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  rosterTelemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  rosterTelemetryText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  rosterBatteryText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  rosterDivider: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  rosterDistanceText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  rosterSafeStatus: {
    fontSize: 10,
    color: '#059669',
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EADC',
    gap: 10,
  },
  arrivalInfo: {
    flex: 1,
  },
  arrivalUser: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  arrivalLoc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  arrivalTimestamp: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  emptyArrivalsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  emptyArrivalsText: {
    fontSize: 11,
    color: Colors.textTertiary,
    flex: 1,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  securityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 15,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF3E7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  addMemberBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cognacAmber,
  },
  subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  subModalCard: {
    backgroundColor: '#FAF3E7',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.subtle,
  },
  subModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  subModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subModalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  subModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  emptyFriendsContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyFriendsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyFriendsSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.md,
  },
  friendListScroll: {
    maxHeight: 280,
    marginBottom: Spacing.md,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEDCC0',
    marginBottom: 8,
  },
  friendRowSelected: {
    borderColor: Colors.cognacAmber,
    backgroundColor: '#FFF9F0',
  },
  miniCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1C2A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniCheckCircleSelected: {
    backgroundColor: Colors.cognacAmber,
    borderColor: Colors.cognacAmber,
  },
  friendAvatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5EADC',
    marginRight: 10,
  },
  friendRowDetails: {
    flex: 1,
  },
  friendRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  friendRowModel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  confirmAddBtn: {
    backgroundColor: Colors.cognacAmber,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    gap: 8,
  },
  confirmAddBtnDisabled: {
    backgroundColor: '#D1C2A5',
    opacity: 0.6,
  },
  confirmAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
});
