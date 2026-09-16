import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  MultiDeviceBag,
  FriendContact,
  GroupTribe,
  CartItem,
  BoutiqueProduct,
  ExtendedProfile,
  ChecklistPreset,
  CalendarEvent,
  CyclePhaseData,
  EssentialItem,
} from '../types';
import { dispatchEmergencySOS, SOSDispatchResult } from '../services/sosService';
import { speakSenti } from '../services/voiceService';

interface CircleContextType {
  mode: 'solo' | 'friends';
  ghostMode: boolean;
  activeBagId: string;
  bags: MultiDeviceBag[];
  activeBag: MultiDeviceBag;
  friends: FriendContact[];
  groups: GroupTribe[];
  blockedUsers: FriendContact[];
  incomingRequests: FriendContact[];
  cart: CartItem[];
  cartCount: number;
  cartTotalUsd: number;
  profile: ExtendedProfile;
  toggleMode: () => void;
  toggleGhostMode: () => void;
  setPrimaryBag: (bagId: string) => void;
  pairNewBag: (name: string, model: string, colorName: string, image: any) => boolean;
  toggleBagConnection: (bagId: string) => void;
  removeBag: (bagId: string) => void;
  toggleBagLock: (bagId: string) => void;
  addFriendByCode: (code: string) => boolean;
  acceptFriendRequest: (id: string) => void;
  declineFriendRequest: (id: string) => void;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  createGroup: (name: string, accentColor: string, friendIds: string[]) => boolean;
  toggleGroupGearPacked: (groupId: string, itemId: string) => void;
  addToCart: (product: BoutiqueProduct, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateProfile: (updated: Partial<ExtendedProfile>) => void;
  triggerEmergencySOS: () => Promise<SOSDispatchResult>;
  // 10-Preset Custom Engine
  presets: ChecklistPreset[];
  activePresetId: string;
  defaultPresetId: string;
  activeItems: EssentialItem[];
  createPreset: (name: string, iconName?: string, initialItems?: EssentialItem[]) => boolean;
  updatePreset: (id: string, updates: Partial<ChecklistPreset>) => void;
  deletePreset: (id: string) => void;
  setDefaultPreset: (id: string) => void;
  activatePreset: (id: string) => void;
  schedulePreset: (id: string, days: number[], specificDate?: string, alertTime?: string) => void;
  toggleItemPacked: (itemId: string) => void;
  addItemToActiveList: (name: string, category: string, isCritical?: boolean) => void;
  removeItemFromActiveList: (itemId: string) => void;
  resetActiveItems: () => void;
  // Calendar & Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleCalendarEventComplete: (id: string) => void;
  // Deep Cycle Care Sync & Lumbar Warmth
  cycleData: CyclePhaseData;
  syncCycleToBag: () => void;
  toggleLumbarHeat: () => void;
  logCycleSymptom: (symptom: string) => void;
}

const INITIAL_BAGS: MultiDeviceBag[] = [
  {
    id: 'bag-01',
    name: 'Executive Smart Pack',
    model: 'Model EXP-01 • Carbon Weave',
    role: 'primary',
    battery: 86,
    isCharging: false,
    isLocked: true,
    isConnected: true,
    zipperClosed: true,
    bottleInserted: true,
    weightKg: 2.4,
    tempC: 23.5,
    humidityPct: 54,
    lastSeenText: 'With You • Bluetooth Active',
    image: require('../../assets/brand/image1.png'),
    colorName: 'Imperial Emerald',
  },
  {
    id: 'bag-02',
    name: 'Weekender Travel Duffel',
    model: 'Model WKD-02 • Ballistic Canvas',
    role: 'secondary',
    battery: 94,
    isCharging: false,
    isLocked: true,
    isConnected: true,
    zipperClosed: true,
    bottleInserted: false,
    weightKg: 4.8,
    tempC: 22.0,
    humidityPct: 50,
    lastSeenText: 'Home Suite • Synced 14m ago',
    image: require('../../assets/brand/image2.png'),
    colorName: 'Porcelain Sand',
  },
  {
    id: 'bag-03',
    name: 'Leather Crossbody Purse',
    model: 'Model CRB-03 • Saddle Tan',
    role: 'tertiary',
    battery: 72,
    isCharging: false,
    isLocked: false,
    isConnected: false,
    zipperClosed: true,
    bottleInserted: false,
    weightKg: 1.1,
    tempC: 21.8,
    humidityPct: 48,
    lastSeenText: 'Office Suite • BLE Standby',
    image: require('../../assets/brand/image3.png'),
    colorName: 'Cognac Saddle',
  },
];

const INITIAL_PROFILE: ExtendedProfile = {
  fullName: 'Shree Prasandh',
  name: 'Shree Prasandh',
  salutation: 'Sir',
  email: 'shree@sentialiving.com',
  phone: '+1 (555) 382-9011',
  userCode: 'SNT-782K',
  handle: '@shree.sentia',
  shippingAddress: '452 Belgravia Crescent, Suite 402, London SW1X 7PJ',
  avatarUri: undefined,
  guardianName: 'Aria Sterling',
  guardianPhone: '+1 (555) 902-3341',
  guardianEmail: 'guardian.sentia@gmail.com',
};

const INITIAL_FRIENDS: FriendContact[] = [
  {
    id: 'f-1',
    name: 'Julian Montgomery',
    salutation: 'Lord Montgomery',
    avatarMood: '01_happy',
    bagModel: 'Executive Smart Pack EXP-01',
    battery: 91,
    distanceText: '1.2 km away',
    isNearby: false,
    isOnline: true,
    safeStatusText: 'Safe at Mayfair Lounge',
    friendCode: 'SNT-339M',
  },
  {
    id: 'f-2',
    name: 'Camilla Dupont',
    salutation: 'Madame Dupont',
    avatarMood: '05_love',
    bagModel: 'Leather Crossbody Purse CRB-03',
    battery: 78,
    distanceText: '400 m away',
    isNearby: true,
    isOnline: true,
    safeStatusText: 'Walking on 5th Ave',
    friendCode: 'SNT-821D',
  },
  {
    id: 'f-3',
    name: 'Kenji Sato',
    salutation: 'Director Sato',
    avatarMood: '10_thinking',
    bagModel: 'Weekender Duffel WKD-02',
    battery: 64,
    distanceText: '6.4 km away',
    isNearby: false,
    isOnline: false,
    safeStatusText: 'Arrived at Shibuya Station',
    friendCode: 'SNT-104K',
  },
];

const INITIAL_PRESETS: ChecklistPreset[] = [
  {
    id: 'preset-1',
    name: 'Executive Daily',
    iconName: 'briefcase',
    isDefault: true,
    scheduledDays: [1, 2, 3, 4, 5], // Mon-Fri
    alertTime: '08:15 AM',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'MacBook Pro & 96W Charger',
        category: 'electronics',
        is_packed: true,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-2',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'House & Car Key Fob',
        category: 'other',
        is_packed: true,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-3',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Sentia Smart Hydration Bottle',
        category: 'health',
        is_packed: true,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-4',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'AirPods Pro & Charging Case',
        category: 'electronics',
        is_packed: false,
        is_critical: false,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-5',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Office Security Keycard',
        category: 'documents',
        is_packed: true,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'preset-2',
    name: 'Gym & Fitness',
    iconName: 'dumbbell',
    isDefault: false,
    scheduledDays: [3], // Wednesday
    alertTime: '06:45 AM',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'item-g1',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Shaker Bottle & Whey Protein',
        category: 'health',
        is_packed: true,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-g2',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Microfiber Gym Towel',
        category: 'hygiene',
        is_packed: true,
        is_critical: false,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-g3',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Training Sneakers & Socks',
        category: 'other',
        is_packed: false,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-g4',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Electrolyte Hydration Flask',
        category: 'health',
        is_packed: true,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'preset-3',
    name: 'Weekend Traveler',
    iconName: 'plane',
    isDefault: false,
    scheduledDays: [6, 0], // Sat-Sun
    alertTime: '09:00 AM',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'item-w1',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Passport & International Pass',
        category: 'documents',
        is_packed: true,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-w2',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Universal Power Adapter',
        category: 'electronics',
        is_packed: true,
        is_critical: true,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-w3',
        user_id: 'user-01',
        bag_id: 'bag-01',
        item_name: 'Aero Travel Toiletries Pouch',
        category: 'hygiene',
        is_packed: false,
        is_critical: false,
        auto_reset_daily: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Sentia Strategic Review',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    category: 'meeting',
    notes: 'Executive Boardroom • Ensure MacBook & Presentation Clicker packed',
    attachedPresetId: 'preset-1',
  },
  {
    id: 'ev-2',
    title: 'High-Intensity Strength Training',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '07:00 AM',
    category: 'health',
    notes: 'Equinox Mayfair • Shaker bottle & sneakers required',
    attachedPresetId: 'preset-2',
  },
  {
    id: 'ev-3',
    title: 'Weekend Flight to Zurich',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    time: '08:15 AM',
    category: 'travel',
    notes: 'Gate 4B Heathrow • Passport & Duffel bag attached',
    attachedPresetId: 'preset-3',
  },
];

const CircleContext = createContext<CircleContextType | undefined>(undefined);

export const CircleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'solo' | 'friends'>('solo');
  const [ghostMode, setGhostMode] = useState<boolean>(false);
  const [bags, setBags] = useState<MultiDeviceBag[]>(INITIAL_BAGS);
  const [activeBagId, setActiveBagId] = useState<string>('bag-01');
  const [friends, setFriends] = useState<FriendContact[]>(INITIAL_FRIENDS);
  const [groups, setGroups] = useState<GroupTribe[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<FriendContact[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendContact[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<ExtendedProfile>(INITIAL_PROFILE);

  // 10-Preset Engine
  const [presets, setPresets] = useState<ChecklistPreset[]>(INITIAL_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string>('preset-1');
  const [defaultPresetId, setDefaultPresetId] = useState<string>('preset-1');
  const [activeItems, setActiveItems] = useState<EssentialItem[]>(INITIAL_PRESETS[0].items);

  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

  // Cycle Care Sync & Lumbar Warmth
  const [cycleData, setCycleData] = useState<CyclePhaseData>({
    dayOfCycle: 22,
    totalCycleDays: 28,
    phase: 'luteal',
    phaseTitle: 'Day 22 • Luteal Phase',
    daysUntilNextCycle: 6,
    description: 'Body temperature slightly elevated. Keep hydration steady and rest well.',
    recommendedSupplies: [
      'Discreet Sanitary Care Pouch',
      'Magnesium Glycinate Packet',
      'Organic Chamomile Tea',
      'Hydration Flask (2.4L Target)',
    ],
    lumbarHeatActive: false,
    lumbarHeatMinutesRemaining: 15,
  });

  const activeBag = bags.find((b) => b.id === activeBagId) || bags[0];

  // Auto-switch checklist presets based on day-of-week or calendar date
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
    const dateStr = today.toISOString().split('T')[0];

    // Check if any preset has an explicit date match
    const dateMatchedPreset = presets.find((p) => p.specificDate === dateStr);
    if (dateMatchedPreset && dateMatchedPreset.id !== activePresetId) {
      setActivePresetId(dateMatchedPreset.id);
      setActiveItems(dateMatchedPreset.items);
      speakSenti(`Switched checklist to ${dateMatchedPreset.name} for today.`);
      return;
    }

    // Check if any preset is scheduled for today's day of week
    const dayMatchedPreset = presets.find((p) => p.scheduledDays.includes(dayOfWeek));
    if (dayMatchedPreset && dayMatchedPreset.id !== activePresetId) {
      setActivePresetId(dayMatchedPreset.id);
      setActiveItems(dayMatchedPreset.items);
    }
  }, [presets]);

  // Lumbar heat timer countdown
  useEffect(() => {
    let timer: any;
    if (cycleData.lumbarHeatActive && cycleData.lumbarHeatMinutesRemaining > 0) {
      timer = setInterval(() => {
        setCycleData((prev) => {
          if (prev.lumbarHeatMinutesRemaining <= 1) {
            clearInterval(timer);
            return { ...prev, lumbarHeatActive: false, lumbarHeatMinutesRemaining: 0 };
          }
          return { ...prev, lumbarHeatMinutesRemaining: prev.lumbarHeatMinutesRemaining - 1 };
        });
      }, 60000);
    }
    return () => clearInterval(timer);
  }, [cycleData.lumbarHeatActive]);

  const toggleMode = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    setMode((prev) => (prev === 'solo' ? 'friends' : 'solo'));
  };

  const toggleGhostMode = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    setGhostMode((prev) => {
      const next = !prev;
      Alert.alert(
        next ? 'Ghost Shield Engaged' : 'Ghost Shield Disengaged',
        next
          ? 'Your bag telemetry, GPS, and status are now 100% invisible to all companions in your Circle.'
          : 'Your bag is now visible to verified companions in your Circle.',
        [{ text: 'Acknowledged' }]
      );
      return next;
    });
  };

  const setPrimaryBag = (bagId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setActiveBagId(bagId);
    setBags((prev) =>
      prev.map((bag) => {
        if (bag.id === bagId) return { ...bag, role: 'primary' as const };
        if (bag.role === 'primary') return { ...bag, role: 'secondary' as const };
        return bag;
      })
    );
  };

  const pairNewBag = (name: string, model: string, colorName: string, image: any): boolean => {
    if (bags.length >= 3) {
      Alert.alert('Maximum Devices Reached', 'Sentia supports up to 3 paired bag devices (Primary, Secondary, Tertiary). Unpair an existing device to connect a new one.');
      return false;
    }

    const assignedRole = bags.length === 1 ? 'secondary' : 'tertiary';
    const newBag: MultiDeviceBag = {
      id: `bag-0${bags.length + 1}`,
      name: name.trim() || `Sentia Smart Pack 0${bags.length + 1}`,
      model: model || 'Model SNT-04 • Hybrid Ballistic',
      role: assignedRole,
      battery: 100,
      isCharging: false,
      isLocked: true,
      isConnected: true,
      zipperClosed: true,
      bottleInserted: false,
      weightKg: 2.1,
      tempC: 22.5,
      humidityPct: 48,
      lastSeenText: 'Just Paired • BLE Active',
      image: image || require('../../assets/brand/image1.png'),
      colorName: colorName || 'Imperial Emerald',
    };

    setBags((prev) => [...prev, newBag]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    speakSenti(`New device paired successfully. Welcome your ${newBag.name}.`);
    return true;
  };

  const toggleBagConnection = (bagId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setBags((prev) =>
      prev.map((bag) => {
        if (bag.id === bagId) {
          const nextState = !bag.isConnected;
          return {
            ...bag,
            isConnected: nextState,
            lastSeenText: nextState ? 'With You • Bluetooth Active' : 'Disconnected • BLE Standby',
          };
        }
        return bag;
      })
    );
  };

  const removeBag = (bagId: string) => {
    if (bags.length <= 1) {
      Alert.alert('Cannot Remove Device', 'Your Sentia ecosystem must retain at least one primary smart bag.');
      return;
    }
    Alert.alert(
      'Unpair Sentia Device',
      'Are you sure you want to unpair and forget this bag? BLE pairing credentials will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpair',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const remaining = bags.filter((b) => b.id !== bagId);
            if (activeBagId === bagId) {
              setActiveBagId(remaining[0].id);
              remaining[0].role = 'primary';
            }
            setBags(remaining);
          },
        },
      ]
    );
  };

  const toggleBagLock = (bagId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setBags((prev) =>
      prev.map((bag) => {
        if (bag.id === bagId) {
          return { ...bag, isLocked: !bag.isLocked };
        }
        return bag;
      })
    );
  };

  // 10-Preset Custom Management
  const createPreset = (name: string, iconName = 'briefcase', initialItems?: EssentialItem[]): boolean => {
    if (presets.length >= 10) {
      Alert.alert('Preset Limit Reached', 'You can create up to 10 customized packing presets. Please edit or delete an existing preset.');
      return false;
    }

    const newPreset: ChecklistPreset = {
      id: `preset-${Date.now()}`,
      name: name.trim() || `Preset ${presets.length + 1}`,
      iconName,
      isDefault: presets.length === 0,
      scheduledDays: [],
      alertTime: '08:00 AM',
      createdAt: new Date().toISOString(),
      items: initialItems || [
        {
          id: `item-${Date.now()}-1`,
          user_id: 'user-01',
          bag_id: activeBagId,
          item_name: 'Key Essentials',
          category: 'other',
          is_packed: false,
          is_critical: true,
          auto_reset_daily: true,
          created_at: new Date().toISOString(),
        },
      ],
    };

    setPresets((prev) => [...prev, newPreset]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  };

  const updatePreset = (id: string, updates: Partial<ChecklistPreset>) => {
    setPresets((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (p.id === activePresetId && updates.items) {
            setActiveItems(updates.items);
          }
          return updated;
        }
        return p;
      })
    );
  };

  const deletePreset = (id: string) => {
    if (presets.length <= 1) {
      Alert.alert('Cannot Delete', 'You must maintain at least one packing preset.');
      return;
    }

    const remaining = presets.filter((p) => p.id !== id);
    if (activePresetId === id) {
      setActivePresetId(remaining[0].id);
      setActiveItems(remaining[0].items);
    }
    if (defaultPresetId === id) {
      setDefaultPresetId(remaining[0].id);
      remaining[0].isDefault = true;
    }
    setPresets(remaining);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const setDefaultPreset = (id: string) => {
    setDefaultPresetId(id);
    setPresets((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const activatePreset = (id: string) => {
    const target = presets.find((p) => p.id === id);
    if (target) {
      setActivePresetId(id);
      setActiveItems(target.items);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const schedulePreset = (id: string, days: number[], specificDate?: string, alertTime?: string) => {
    setPresets((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            scheduledDays: days,
            specificDate,
            alertTime: alertTime || p.alertTime,
          };
        }
        return p;
      })
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleItemPacked = (itemId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const updated = activeItems.map((item) =>
      item.id === itemId ? { ...item, is_packed: !item.is_packed } : item
    );
    setActiveItems(updated);
    updatePreset(activePresetId, { items: updated });
  };

  const addItemToActiveList = (name: string, category: string, isCritical = false) => {
    if (!name.trim()) return;
    const newItem: EssentialItem = {
      id: `item-${Date.now()}`,
      user_id: 'user-01',
      bag_id: activeBagId,
      item_name: name.trim(),
      category: category as any,
      is_packed: false,
      is_critical: isCritical,
      auto_reset_daily: true,
      created_at: new Date().toISOString(),
    };
    const updated = [...activeItems, newItem];
    setActiveItems(updated);
    updatePreset(activePresetId, { items: updated });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const removeItemFromActiveList = (itemId: string) => {
    const updated = activeItems.filter((i) => i.id !== itemId);
    setActiveItems(updated);
    updatePreset(activePresetId, { items: updated });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetActiveItems = () => {
    const updated = activeItems.map((i) => ({ ...i, is_packed: false }));
    setActiveItems(updated);
    updatePreset(activePresetId, { items: updated });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Calendar Events CRUD
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `cal-${Date.now()}`,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleCalendarEventComplete = (id: string) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isCompleted: !e.isCompleted } : e))
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Deep Cycle Care Sync & Lumbar Warmth
  const syncCycleToBag = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newItems: EssentialItem[] = cycleData.recommendedSupplies.map((sup, idx) => ({
      id: `cycle-item-${Date.now()}-${idx}`,
      user_id: 'user-01',
      bag_id: activeBagId,
      item_name: sup,
      category: 'hygiene',
      is_packed: false,
      is_critical: true,
      auto_reset_daily: false,
      created_at: new Date().toISOString(),
    }));

    setActiveItems((prev) => [...prev, ...newItems]);
    updatePreset(activePresetId, { items: [...activeItems, ...newItems] });
    speakSenti('Cycle care essentials added to your active bag checklist.');
    Alert.alert('Bag Synced', '4 personal care items have been discreetly added to your active bag checklist.');
  };

  const toggleLumbarHeat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCycleData((prev) => {
      const nextActive = !prev.lumbarHeatActive;
      if (nextActive) {
        speakSenti('Lumbar thermal pouch activated at 40 degrees Celsius.');
        Alert.alert('Lumbar Warmth Activated', 'Your bag’s ergonomic lower back pouch is warming to 40°C (104°F) for 15 minutes to relieve discomfort.');
      } else {
        speakSenti('Lumbar thermal pouch turned off.');
      }
      return {
        ...prev,
        lumbarHeatActive: nextActive,
        lumbarHeatMinutesRemaining: nextActive ? 15 : 0,
      };
    });
  };

  const logCycleSymptom = (symptom: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Symptom Logged', `Recorded: ${symptom}. Senti has adjusted your hydration and rest recommendations.`);
  };

  // Friends & Social Methods
  const addFriendByCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode.startsWith('SNT-')) {
      Alert.alert('Invalid Passcode', 'Sentia invite codes must begin with SNT- followed by 4 characters.');
      return false;
    }
    const newFriend: FriendContact = {
      id: `f-${Date.now()}`,
      name: `Companion ${cleanCode}`,
      salutation: 'Honored Guest',
      avatarMood: '01_happy',
      bagModel: 'Executive Smart Pack EXP-01',
      battery: 88,
      distanceText: 'Connected nearby',
      isNearby: true,
      isOnline: true,
      safeStatusText: 'Active in Circle',
      friendCode: cleanCode,
    };
    setFriends((prev) => [...prev, newFriend]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Companion Added', `Successfully connected with ${cleanCode}.`);
    return true;
  };

  const acceptFriendRequest = (id: string) => {
    const req = incomingRequests.find((r) => r.id === id);
    if (req) {
      setFriends((prev) => [...prev, req]);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const declineFriendRequest = (id: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const blockUser = (id: string) => {
    const friend = friends.find((f) => f.id === id);
    if (friend) {
      setFriends((prev) => prev.filter((f) => f.id !== id));
      setBlockedUsers((prev) => [...prev, friend]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const unblockUser = (id: string) => {
    const blocked = blockedUsers.find((b) => b.id === id);
    if (blocked) {
      setBlockedUsers((prev) => prev.filter((b) => b.id !== id));
      setFriends((prev) => [...prev, blocked]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const createGroup = (name: string, accentColor: string, friendIds: string[]): boolean => {
    if (friendIds.length < 1 || friendIds.length > 9) {
      Alert.alert('Invalid Group Size', 'Group Tribes require between 2 and 10 members (including yourself).');
      return false;
    }
    const selectedMembers = friends.filter((f) => friendIds.includes(f.id));
    const newGroup: GroupTribe = {
      id: `group-${Date.now()}`,
      name: name.trim() || 'New Journey Tribe',
      accentColor: accentColor || '#064E3B',
      memberCount: selectedMembers.length + 1,
      maxMembers: 10,
      members: selectedMembers,
      gearChecklist: [],
      safeArrivals: [],
      description: 'Collaborative travel pack & safety circle',
      createdAt: new Date().toISOString(),
    };
    setGroups((prev) => [...prev, newGroup]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  };

  const toggleGroupGearPacked = (groupId: string, itemId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            gearChecklist: g.gearChecklist.map((item) =>
              item.id === itemId ? { ...item, isPacked: !item.isPacked } : item
            ),
          };
        }
        return g;
      })
    );
  };

  const addToCart = (product: BoutiqueProduct, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const updateProfile = (updated: Partial<ExtendedProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const triggerEmergencySOS = async (): Promise<SOSDispatchResult> => {
    return await dispatchEmergencySOS(
      profile.fullName || 'Sentia Executive',
      profile.guardianEmail,
      profile.guardianPhone,
      activeBag.id,
      activeBag.battery
    );
  };

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartTotalUsd = cart.reduce((acc, curr) => acc + curr.product.priceUsd * curr.quantity, 0);

  return (
    <CircleContext.Provider
      value={{
        mode,
        ghostMode,
        activeBagId,
        bags,
        activeBag,
        friends,
        groups,
        blockedUsers,
        incomingRequests,
        cart,
        cartCount,
        cartTotalUsd,
        profile,
        toggleMode,
        toggleGhostMode,
        setPrimaryBag,
        pairNewBag,
        toggleBagConnection,
        removeBag,
        toggleBagLock,
        addFriendByCode,
        acceptFriendRequest,
        declineFriendRequest,
        blockUser,
        unblockUser,
        createGroup,
        toggleGroupGearPacked,
        addToCart,
        removeFromCart,
        clearCart,
        updateProfile,
        triggerEmergencySOS,
        presets,
        activePresetId,
        defaultPresetId,
        activeItems,
        createPreset,
        updatePreset,
        deletePreset,
        setDefaultPreset,
        activatePreset,
        schedulePreset,
        toggleItemPacked,
        addItemToActiveList,
        removeItemFromActiveList,
        resetActiveItems,
        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarEventComplete,
        cycleData,
        syncCycleToBag,
        toggleLumbarHeat,
        logCycleSymptom,
      }}
    >
      {children}
    </CircleContext.Provider>
  );
};

export const useCircle = (): CircleContextType => {
  const context = useContext(CircleContext);
  if (!context) {
    throw new Error('useCircle must be used within a CircleProvider');
  }
  return context;
};
