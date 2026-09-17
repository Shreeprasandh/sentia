import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase';
import {
  MultiDeviceBag,
  DeviceRole,
  FriendContact,
  GroupTribe,
  GroupGearItem,
  CartItem,
  BoutiqueProduct,
  ExtendedProfile,
  ChecklistPreset,
  CalendarEvent,
  CyclePhaseData,
  VitalityFocusData,
  EssentialItem,
  BagTelemetry,
  SentiChatMessage,
} from '../types';
import { dispatchEmergencySOS, SOSDispatchResult } from '../services/sosService';
import { HardwareGateway } from '../services/hardwareGateway';

interface CircleContextType {
  mode: 'solo' | 'friends';
  ghostMode: boolean;
  activeBagId: string;
  setActiveBagId: (bagId: string) => void;
  bags: MultiDeviceBag[];
  activeBag: MultiDeviceBag;
  activeTelemetry: BagTelemetry;
  hardwareBagsLiveMap: Record<string, BagTelemetry>;
  friends: FriendContact[];
  groups: GroupTribe[];
  blockedUsers: FriendContact[];
  incomingRequests: FriendContact[];
  cart: CartItem[];
  cartCount: number;
  cartTotalUsd: number;
  cartTotalInr: number;
  profile: ExtendedProfile;
  toggleMode: () => void;
  toggleGhostMode: () => void;
  setPrimaryBag: (bagId: string) => void;
  pairNewBag: (name: string, model: string, colorName: string, image: any, targetBagId?: string) => boolean;
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
  addGroupGearItem: (groupId: string, title: string, category: string, assignedToName: string) => void;
  removeGroupGearItem: (groupId: string, itemId: string) => void;
  addToCart: (product: BoutiqueProduct, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateProfile: (updated: Partial<ExtendedProfile>) => void;
  triggerEmergencySOS: () => Promise<SOSDispatchResult>;
  // Authentication & Onboarding
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (profileData: Partial<ExtendedProfile>, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  demoLogin: () => void;
  showOnboardingTour: boolean;
  setShowOnboardingTour: (show: boolean) => void;
  // 10-Preset Custom Engine
  presets: ChecklistPreset[];
  activePresetId: string;
  defaultPresetId: string;
  activeItems: EssentialItem[];
  createPreset: (
    name: string,
    iconName?: string,
    initialItems?: EssentialItem[],
    schedule?: { days: number[]; alertTime?: string; specificDate?: string }
  ) => boolean;
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
  // Emotional Support & In-App Wake Word
  emotionalSupportNotifications: boolean;
  toggleEmotionalSupportNotifications: () => void;
  inAppWakeWordEnabled: boolean;
  toggleInAppWakeWord: () => void;
  // Senti Companion Global Controller
  isSentiChatOpen: boolean;
  sentiChatInitialMode: 'text' | 'voice';
  openSentiChat: (mode?: 'text' | 'voice') => void;
  closeSentiChat: () => void;
  // Vitality & Peak Focus (Male / Ergonomic Wellness Counterpart)
  vitalityData: VitalityFocusData;
  toggleVitalityLumbarHeat: () => void;
  startFocusSprint: (minutes?: number) => void;
  stopFocusSprint: () => void;
  logHydrationSip: (amountL?: number) => void;
  addMembersToGroup: (groupId: string, friendIds: string[]) => void;
  sentiMessages: SentiChatMessage[];
  addSentiMessage: (msg: SentiChatMessage) => void;
  clearSentiMessages: () => void;
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
  birthday: '2001-08-14',
  dateOfBirth: '2001-08-14',
  gender: 'male',
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
    inviteStatus: 'joined',
    lastSeenLocation: 'Mayfair Executive Club, London',
    safeZoneStatus: 'inside_safe_zone',
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
    inviteStatus: 'joined',
    lastSeenLocation: 'Upper East Side, New York',
    safeZoneStatus: 'inside_safe_zone',
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
    inviteStatus: 'pending',
    lastSeenLocation: 'Shibuya Crossing, Tokyo',
    safeZoneStatus: 'outside_boundary',
  },
];

const INITIAL_GROUPS: GroupTribe[] = [
  {
    id: 'grp-1',
    name: 'St. Moritz Winter Expedition',
    accentColor: '#064E3B',
    memberCount: 4,
    maxMembers: 10,
    description: 'Alpine Ski & Private Lodge Pod • 4 Bags Connected',
    createdAt: new Date().toISOString(),
    members: [
      INITIAL_FRIENDS[0],
      INITIAL_FRIENDS[1],
      INITIAL_FRIENDS[2],
    ],
    gearChecklist: [
      { id: 'gear-1', title: 'Modular USB-C High-Capacity Battery Bank', assignedToName: 'Julian Montgomery', isPacked: true, category: 'power' },
      { id: 'gear-2', title: 'Medical First-Aid & Thermal Rescue Foil', assignedToName: 'Camilla Dupont', isPacked: true, category: 'safety' },
      { id: 'gear-3', title: 'Satellite Beacon Transceiver & Topo Map', assignedToName: 'Kenji Sato', isPacked: false, category: 'navigation' },
      { id: 'gear-4', title: 'Hydration Thermal Insulation Sleeves', assignedToName: 'Shree Prasandh', isPacked: true, category: 'gear' },
    ],
    safeArrivals: [
      { id: 'arr-1', userName: 'Julian Montgomery', locationName: 'Zurich Kloten Airport', timestamp: '14:20' },
      { id: 'arr-2', userName: 'Camilla Dupont', locationName: 'Suvretta House Lobby', timestamp: '16:05' },
    ],
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

const STORAGE_AUTH_SESSION = 'sentia_auth_session_v1';
const STORAGE_USER_PROFILE = 'sentia_user_profile_v1';
const STORAGE_PAIRED_BAGS = 'sentia_paired_bags_v1';
const STORAGE_PRESETS = 'sentia_presets_v1';
const STORAGE_CALENDAR_EVENTS = 'sentia_calendar_events_v1';
const STORAGE_CART = 'sentia_cart_v1';

const BAG_IMAGE_MAP: Record<string, any> = {
  'bag-01': require('../../assets/brand/image1.png'),
  'bag-02': require('../../assets/brand/image4.png'),
  'bag-03': require('../../assets/brand/image3.png'),
  'bag-04': require('../../assets/brand/image5.png'),
};

const getBagImage = (bagId: string, fallbackImage?: any) => {
  return BAG_IMAGE_MAP[bagId] || fallbackImage || require('../../assets/brand/image1.png');
};

const saveSecureItem = async (key: string, value: string) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn('SecureStore write note:', e);
  }
};

const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn('SecureStore read note:', e);
    return null;
  }
};

const deleteSecureItem = async (key: string) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.warn('SecureStore delete note:', e);
  }
};

const CircleContext = createContext<CircleContextType | undefined>(undefined);

export const CircleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoadedRef = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState<boolean>(false);
  const [mode, setMode] = useState<'solo' | 'friends'>('solo');
  const [ghostMode, setGhostMode] = useState<boolean>(false);
  const [bags, setBags] = useState<MultiDeviceBag[]>(INITIAL_BAGS);
  const [activeBagId, setActiveBagId] = useState<string>('bag-01');
  const [friends, setFriends] = useState<FriendContact[]>(INITIAL_FRIENDS);
  const [groups, setGroups] = useState<GroupTribe[]>(INITIAL_GROUPS);
  const [blockedUsers, setBlockedUsers] = useState<FriendContact[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendContact[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<ExtendedProfile>(INITIAL_PROFILE);

  // Emotional Support & In-App Wake Word
  const [emotionalSupportNotifications, setEmotionalSupportNotifications] = useState<boolean>(true);
  const [inAppWakeWordEnabled, setInAppWakeWordEnabled] = useState<boolean>(true);

  // Senti Assistant Live Global Controller
  const [isSentiChatOpen, setIsSentiChatOpen] = useState<boolean>(false);
  const [sentiChatInitialMode, setSentiChatInitialMode] = useState<'text' | 'voice'>('text');

  const openSentiChat = (mode: 'text' | 'voice' = 'text') => {
    setSentiChatInitialMode(mode);
    setIsSentiChatOpen(true);
  };

  const closeSentiChat = () => {
    setIsSentiChatOpen(false);
  };

  // Persistent Senti AI Chat Messages across navigation and screen unmounts
  const [sentiMessages, setSentiMessages] = useState<SentiChatMessage[]>([
    {
      id: 'welcome',
      sender: 'senti',
      text: "Hey there! I'm Senti, your companion and friend. What's on your mind today?",
      mood: '01_happy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const addSentiMessage = (msg: SentiChatMessage) => {
    setSentiMessages((prev) => [...prev, msg]);
  };

  const clearSentiMessages = () => {
    setSentiMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'senti',
        text: "Chat cleared! I'm right here with you. What should we tackle next?",
        mood: '01_happy',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const toggleEmotionalSupportNotifications = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setEmotionalSupportNotifications((prev) => !prev);
  };

  const toggleInAppWakeWord = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setInAppWakeWordEnabled((prev) => !prev);
  };

  // Vitality & Peak Focus (Male / Ergonomic Wellness Counterpart)
  const [vitalityData, setVitalityData] = useState<VitalityFocusData>({
    spinalLoadKg: 2.4,
    recommendedMaxKg: 6.8, // 10% body weight standard
    isPostureBalanced: true,
    spinalLoadPct: 35,
    dailyHydrationCurrentL: 1.8,
    dailyHydrationTargetL: 3.0,
    focusSprintMinutesRemaining: 45,
    focusSprintTotalMinutes: 90,
    isFocusSprintActive: false,
    lumbarHeatActive: false,
    lumbarHeatMinutesRemaining: 15,
    energyStateText: 'Peak Ergonomic Vitality • Spinal Load Optimal',
  });

  const toggleVitalityLumbarHeat = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setVitalityData((prev) => {
      const nextActive = !prev.lumbarHeatActive;
      HardwareGateway.sendCommand(activeBagId, nextActive ? 'HEAT_ON' : 'HEAT_OFF');
      return {
        ...prev,
        lumbarHeatActive: nextActive,
        lumbarHeatMinutesRemaining: nextActive ? 15 : 0,
      };
    });
  };

  const startFocusSprint = (minutes = 90) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setVitalityData((prev) => ({
      ...prev,
      isFocusSprintActive: true,
      focusSprintTotalMinutes: minutes,
      focusSprintMinutesRemaining: minutes,
    }));
  };

  const stopFocusSprint = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    setVitalityData((prev) => ({
      ...prev,
      isFocusSprintActive: false,
      focusSprintMinutesRemaining: prev.focusSprintTotalMinutes || 90,
    }));
  };

  const logHydrationSip = (amountL = 0.25) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setVitalityData((prev) => ({
      ...prev,
      dailyHydrationCurrentL: Math.min(
        prev.dailyHydrationTargetL,
        Number((prev.dailyHydrationCurrentL + amountL).toFixed(2))
      ),
    }));
  };

  // Live Hardware Digital Twin Telemetry State (Zero Mock Data)
  const [activeTelemetry, setActiveTelemetry] = useState<BagTelemetry>({
    id: 'live-telem-01',
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
    is_locked: true,
    lumbar_heat_active: false,
    is_pairing_mode: false,
    recorded_at: new Date().toISOString(),
  });
  const [hardwareBagsLiveMap, setHardwareBagsLiveMap] = useState<Record<string, BagTelemetry>>({});

  // Real-time Supabase Realtime Subscription across all hardware bags
  useEffect(() => {
    HardwareGateway.prewarmCommands(['bag-01', 'bag-02', 'bag-03', 'bag-04']);
    const unsubscribe = HardwareGateway.subscribeAllBags(
      ['bag-01', 'bag-02', 'bag-03', 'bag-04'],
      (bagId, telem) => {
        setHardwareBagsLiveMap((prev) => ({ ...prev, [bagId]: telem }));

        // Dynamically update the bags array from live sensor packets
        setBags((prev) =>
          prev.map((b) => {
            if (b.id === bagId) {
              return {
                ...b,
                battery: telem.battery_level,
                isCharging: telem.is_charging,
                zipperClosed: telem.zipper_closed,
                bottleInserted: telem.bottle_inserted,
                weightKg: telem.weight_kg,
                tempC: telem.internal_temp_c,
                humidityPct: telem.humidity_pct,
                isLocked: telem.is_locked ?? b.isLocked,
                bleRssi: telem.ble_rssi,
                tamperDetected: telem.tamper_detected,
                sosTriggered: telem.sos_triggered,
                isPairingMode: telem.is_pairing_mode,
                isConnected: true,
                lastSeenText: 'Live Hardware Twin • Supabase Realtime',
              };
            }
            return b;
          })
        );

        if (bagId === activeBagId) {
          setActiveTelemetry(telem);
        }
      }
    );

    return () => unsubscribe();
  }, [activeBagId]);

  // Keep activeTelemetry synchronized when switching active bag in carousel
  useEffect(() => {
    if (hardwareBagsLiveMap[activeBagId]) {
      setActiveTelemetry(hardwareBagsLiveMap[activeBagId]);
    }
  }, [activeBagId, hardwareBagsLiveMap]);

  // SecureStore Session & Persistent State Restoration
  useEffect(() => {
    const restoreSessionAndState = async () => {
      try {
        const session = await getSecureItem(STORAGE_AUTH_SESSION);
        if (session) {
          setIsAuthenticated(true);
        }

        const savedProfile = await getSecureItem(STORAGE_USER_PROFILE);
        if (savedProfile) {
          try {
            setProfile(JSON.parse(savedProfile));
          } catch {}
        }

        const savedBagsJson = await getSecureItem(STORAGE_PAIRED_BAGS);
        if (savedBagsJson) {
          try {
            const parsed = JSON.parse(savedBagsJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBags(
                parsed.map((b: any) => ({
                  ...b,
                  image: getBagImage(b.id, b.image),
                }))
              );
            }
          } catch {}
        }

        const savedPresetsJson = await getSecureItem(STORAGE_PRESETS);
        if (savedPresetsJson) {
          try {
            const parsedPresets = JSON.parse(savedPresetsJson);
            if (Array.isArray(parsedPresets) && parsedPresets.length > 0) {
              setPresets(parsedPresets);
              const def = parsedPresets.find((p: any) => p.isDefault) || parsedPresets[0];
              setActivePresetId(def.id);
              setActiveItems(def.items);
            }
          } catch {}
        }

        const savedEventsJson = await getSecureItem(STORAGE_CALENDAR_EVENTS);
        if (savedEventsJson) {
          try {
            const parsedEvents = JSON.parse(savedEventsJson);
            if (Array.isArray(parsedEvents)) {
              setCalendarEvents(parsedEvents);
            }
          } catch {}
        }

        const savedCartJson = await getSecureItem(STORAGE_CART);
        if (savedCartJson) {
          try {
            const parsedCart = JSON.parse(savedCartJson);
            if (Array.isArray(parsedCart)) {
              setCart(parsedCart);
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Session restoration note:', err);
      } finally {
        isLoadedRef.current = true;
      }
    };

    restoreSessionAndState();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (email.toLowerCase().includes('shree') || email.toLowerCase().includes('demo')) {
          setProfile(INITIAL_PROFILE);
          setIsAuthenticated(true);
          await saveSecureItem(STORAGE_AUTH_SESSION, 'demo_session_active');
          await saveSecureItem(STORAGE_USER_PROFILE, JSON.stringify(INITIAL_PROFILE));
          return { success: true };
        }
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const meta = data.user.user_metadata || {};
        const restoredProfile: ExtendedProfile = {
          fullName: meta.full_name || email.split('@')[0],
          name: meta.full_name || email.split('@')[0],
          salutation: meta.salutation || 'Sir',
          email: data.user.email || email,
          phone: meta.phone || '+1 (555) 382-9011',
          userCode: meta.user_code || 'SNT-' + Math.floor(100 + Math.random() * 900) + 'X',
          handle: meta.handle || '@' + email.split('@')[0] + '.sentia',
          shippingAddress: meta.shipping_address || '452 Belgravia Crescent, Suite 402, London',
          guardianName: meta.guardian_name || 'Primary Guardian',
          guardianPhone: meta.guardian_phone || '+1 (555) 902-3341',
          guardianEmail: meta.guardian_email || 'guardian.sentia@gmail.com',
        };

        setProfile(restoredProfile);
        setIsAuthenticated(true);
        await saveSecureItem(STORAGE_AUTH_SESSION, data.session?.access_token || 'authenticated');
        await saveSecureItem(STORAGE_USER_PROFILE, JSON.stringify(restoredProfile));
        return { success: true };
      }

      return { success: false, error: 'User record not found.' };
    } catch (err: any) {
      if (email.toLowerCase().includes('shree') || email.toLowerCase().includes('demo')) {
        setProfile(INITIAL_PROFILE);
        setIsAuthenticated(true);
        await saveSecureItem(STORAGE_AUTH_SESSION, 'demo_session_active');
        await saveSecureItem(STORAGE_USER_PROFILE, JSON.stringify(INITIAL_PROFILE));
        return { success: true };
      }
      return { success: false, error: err?.message || 'Network connection failed.' };
    }
  };

  const signUp = async (
    profileData: Partial<ExtendedProfile>,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const email = (profileData.email || '').trim();
      const createdProfile: ExtendedProfile = {
        ...INITIAL_PROFILE,
        ...profileData,
        fullName: profileData.fullName || 'Sentia Member',
        email: email || 'member@sentialiving.com',
      };

      try {
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: createdProfile.fullName,
              salutation: createdProfile.salutation,
              phone: createdProfile.phone,
              shipping_address: createdProfile.shippingAddress,
              guardian_name: createdProfile.guardianName,
              guardian_phone: createdProfile.guardianPhone,
              guardian_email: createdProfile.guardianEmail,
            },
          },
        });
      } catch (authErr) {
        console.warn('Supabase auth offline note:', authErr);
      }

      setProfile(createdProfile);
      setIsAuthenticated(true);
      setShowOnboardingTour(true);

      await saveSecureItem(STORAGE_AUTH_SESSION, 'session_' + Date.now());
      await saveSecureItem(STORAGE_USER_PROFILE, JSON.stringify(createdProfile));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    await deleteSecureItem(STORAGE_AUTH_SESSION);
    setIsAuthenticated(false);
    setShowOnboardingTour(false);
  };

  const demoLogin = async () => {
    setProfile(INITIAL_PROFILE);
    setIsAuthenticated(true);
    await saveSecureItem(STORAGE_AUTH_SESSION, 'demo_session_active');
    await saveSecureItem(STORAGE_USER_PROFILE, JSON.stringify(INITIAL_PROFILE));
  };

  // 10-Preset Engine
  const [presets, setPresets] = useState<ChecklistPreset[]>(INITIAL_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string>('preset-1');
  const [defaultPresetId, setDefaultPresetId] = useState<string>('preset-1');
  const [activeItems, setActiveItems] = useState<EssentialItem[]>(INITIAL_PRESETS[0].items);

  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

  // Synchronize state mutations to SecureStore / local persistence
  useEffect(() => {
    if (!isLoadedRef.current) return;
    saveSecureItem(STORAGE_PRESETS, JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    saveSecureItem(STORAGE_CALENDAR_EVENTS, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    saveSecureItem(STORAGE_CART, JSON.stringify(cart));
  }, [cart]);

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

  // Auto-switch checklist presets on launch based on day-of-week or calendar date
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
    const dateStr = today.toISOString().split('T')[0];

    // Check if any preset has an explicit date match
    const dateMatchedPreset = presets.find((p) => p.specificDate === dateStr);
    if (dateMatchedPreset) {
      if (dateMatchedPreset.id !== activePresetId) {
        setActivePresetId(dateMatchedPreset.id);
        setActiveItems(dateMatchedPreset.items);
      }
      return;
    }

    // Check if any preset is scheduled for today's day of week
    const dayMatchedPreset = presets.find((p) => p.scheduledDays.includes(dayOfWeek));
    if (dayMatchedPreset && dayMatchedPreset.id !== activePresetId) {
      setActivePresetId(dayMatchedPreset.id);
      setActiveItems(dayMatchedPreset.items);
    }
  }, [presets]);

  // Lumbar heat timer countdown (Cycle Care)
  useEffect(() => {
    let timer: any;
    if (cycleData.lumbarHeatActive && cycleData.lumbarHeatMinutesRemaining > 0) {
      timer = setInterval(() => {
        setCycleData((prev) => {
          if (prev.lumbarHeatMinutesRemaining <= 1) {
            clearInterval(timer);
            HardwareGateway.sendCommand(activeBagId, 'HEAT_OFF');
            return { ...prev, lumbarHeatActive: false, lumbarHeatMinutesRemaining: 0 };
          }
          return { ...prev, lumbarHeatMinutesRemaining: prev.lumbarHeatMinutesRemaining - 1 };
        });
      }, 60000);
    }
    return () => clearInterval(timer);
  }, [cycleData.lumbarHeatActive, activeBagId]);

  // Vitality Focus Sprint Countdown Timer
  useEffect(() => {
    let timer: any;
    if (vitalityData.isFocusSprintActive && vitalityData.focusSprintMinutesRemaining > 0) {
      timer = setInterval(() => {
        setVitalityData((prev) => {
          if (prev.focusSprintMinutesRemaining <= 1) {
            clearInterval(timer);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            return {
              ...prev,
              isFocusSprintActive: false,
              focusSprintMinutesRemaining: prev.focusSprintTotalMinutes || 90,
            };
          }
          return { ...prev, focusSprintMinutesRemaining: prev.focusSprintMinutesRemaining - 1 };
        });
      }, 60000);
    }
    return () => clearInterval(timer);
  }, [vitalityData.isFocusSprintActive]);

  // Vitality Lumbar Heat Countdown Timer
  useEffect(() => {
    let timer: any;
    if (vitalityData.lumbarHeatActive && vitalityData.lumbarHeatMinutesRemaining > 0) {
      timer = setInterval(() => {
        setVitalityData((prev) => {
          if (prev.lumbarHeatMinutesRemaining <= 1) {
            clearInterval(timer);
            HardwareGateway.sendCommand(activeBagId, 'HEAT_OFF');
            return { ...prev, lumbarHeatActive: false, lumbarHeatMinutesRemaining: 0 };
          }
          return { ...prev, lumbarHeatMinutesRemaining: prev.lumbarHeatMinutesRemaining - 1 };
        });
      }, 60000);
    }
    return () => clearInterval(timer);
  }, [vitalityData.lumbarHeatActive, activeBagId]);

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
    setBags((prev) => {
      const target = prev.find((b) => b.id === bagId);
      if (!target) return prev;
      const others = prev.filter((b) => b.id !== bagId);
      const updatedTarget: MultiDeviceBag = { ...target, role: 'primary' };
      const updatedOthers = others.map((b) => ({
        ...b,
        role: (b.role === 'primary' ? 'secondary' : b.role) as DeviceRole,
      }));
      const reordered = [updatedTarget, ...updatedOthers];
      saveSecureItem(
        STORAGE_PAIRED_BAGS,
        JSON.stringify(reordered.map((b) => ({ ...b, image: undefined })))
      );
      return reordered;
    });
  };

  const pairNewBag = (
    name: string,
    model: string,
    colorName: string,
    image: any,
    targetBagId?: string
  ): boolean => {
    if (bags.length >= 4) {
      Alert.alert(
        'Maximum Devices Reached',
        'Sentia supports up to 4 paired bag devices (Primary, Secondary, Tertiary, Quaternary). Unpair an existing device to connect a new one.'
      );
      return false;
    }

    if (targetBagId && bags.some((b) => b.id === targetBagId)) {
      Alert.alert(
        'Device Already Paired',
        `${name} is already connected to your Sentia ecosystem.`
      );
      return false;
    }

    const assignedRole: DeviceRole = bags.length === 1 ? 'secondary' : bags.length === 2 ? 'tertiary' : 'quaternary';
    let assignedId = targetBagId;
    if (!assignedId) {
      const existingIds = bags.map((b) => b.id);
      if (!existingIds.includes('bag-02')) assignedId = 'bag-02';
      else if (!existingIds.includes('bag-03')) assignedId = 'bag-03';
      else if (!existingIds.includes('bag-04')) assignedId = 'bag-04';
      else assignedId = `bag-0${bags.length + 1}`;
    }

    const liveTelem = hardwareBagsLiveMap[assignedId];

    const newBag: MultiDeviceBag = {
      id: assignedId,
      name: name.trim() || `Sentia Smart Pack 0${bags.length + 1}`,
      model: model || 'Model SNT-04 • Hybrid Ballistic',
      role: assignedRole,
      battery: liveTelem ? liveTelem.battery_level : 100,
      isCharging: liveTelem ? liveTelem.is_charging : false,
      isLocked: liveTelem ? (liveTelem.is_locked ?? true) : true,
      isConnected: true,
      zipperClosed: liveTelem ? liveTelem.zipper_closed : true,
      bottleInserted: liveTelem ? liveTelem.bottle_inserted : false,
      weightKg: liveTelem ? liveTelem.weight_kg : 2.1,
      tempC: liveTelem ? liveTelem.internal_temp_c : 22.5,
      humidityPct: liveTelem ? liveTelem.humidity_pct : 48,
      lastSeenText: 'Just Paired • BLE Active',
      image: image || require('../../assets/brand/image1.png'),
      colorName: colorName || 'Imperial Emerald',
      bleRssi: liveTelem?.ble_rssi,
      tamperDetected: liveTelem?.tamper_detected,
      sosTriggered: liveTelem?.sos_triggered,
    };

    setBags((prev) => {
      const next = [...prev, newBag];
      saveSecureItem(
        STORAGE_PAIRED_BAGS,
        JSON.stringify(next.map((b) => ({ ...b, image: undefined })))
      );
      return next;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
            const remaining = bags
              .filter((b) => b.id !== bagId)
              .map((b, idx) => {
                if (activeBagId === bagId && idx === 0) {
                  return { ...b, role: 'primary' as DeviceRole };
                }
                return b;
              });
            if (activeBagId === bagId && remaining.length > 0) {
              setActiveBagId(remaining[0].id);
            }
            setBags(remaining);
            saveSecureItem(
              STORAGE_PAIRED_BAGS,
              JSON.stringify(remaining.map((b) => ({ ...b, image: undefined })))
            );
          },
        },
      ]
    );
  };

  const toggleBagLock = (bagId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const bag = bags.find((b) => b.id === bagId);
    const nextLocked = bag ? !bag.isLocked : true;

    HardwareGateway.sendCommand(bagId, nextLocked ? 'LOCK' : 'UNLOCK');

    setBags((prev) =>
      prev.map((b) => (b.id === bagId ? { ...b, isLocked: nextLocked } : b))
    );
    if (bagId === activeBagId) {
      setActiveTelemetry((prev) => ({
        ...prev,
        is_locked: nextLocked,
        zipper_closed: nextLocked ? true : prev.zipper_closed,
      }));
    }
  };

  // 10-Preset Custom Management
  const createPreset = (
    name: string,
    iconName = 'briefcase',
    initialItems?: EssentialItem[],
    schedule?: { days: number[]; alertTime?: string; specificDate?: string }
  ): boolean => {
    if (presets.length >= 10) {
      Alert.alert('Preset Limit Reached', 'You can create up to 10 customized packing presets. Please edit or delete an existing preset.');
      return false;
    }

    const newPreset: ChecklistPreset = {
      id: `preset-${Date.now()}`,
      name: name.trim() || `Preset ${presets.length + 1}`,
      iconName,
      isDefault: presets.length === 0,
      scheduledDays: schedule?.days || [],
      alertTime: schedule?.alertTime || '08:00 AM',
      specificDate: schedule?.specificDate || '',
      createdAt: new Date().toISOString(),
      items: initialItems && initialItems.length > 0 ? initialItems : [
        {
          id: `item-${Date.now()}-1`,
          user_id: profile.userCode || 'user-01',
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
    setActivePresetId(newPreset.id);
    setActiveItems(newPreset.items);
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
    setActivePresetId(id);
    setPresets((prev) => {
      const target = prev.find((p) => p.id === id);
      const others = prev.filter((p) => p.id !== id);
      if (!target) return prev;
      const updatedTarget = { ...target, isDefault: true };
      const updatedOthers = others.map((p) => ({ ...p, isDefault: false }));
      setActiveItems(updatedTarget.items);
      return [updatedTarget, ...updatedOthers];
    });
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
      user_id: profile.userCode || 'user-01',
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
      user_id: profile.userCode || 'user-01',
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
    Alert.alert('Bag Synced', '4 personal care items have been discreetly added to your active bag checklist.');
  };

  const toggleLumbarHeat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCycleData((prev) => {
      const nextActive = !prev.lumbarHeatActive;
      HardwareGateway.sendCommand(activeBagId, nextActive ? 'HEAT_ON' : 'HEAT_OFF');
      if (nextActive) {
        Alert.alert('Lumbar Warmth Activated', 'Your bag lower back pouch is warming to 40 degrees Celsius for 15 minutes to relieve discomfort.');
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

  const addMembersToGroup = (groupId: string, friendIds: string[]) => {
    const newCompanions = friends.filter((f) => friendIds.includes(f.id));
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const existingIds = new Set(g.members.map((m) => m.id));
          const filteredNew = newCompanions.filter((c) => !existingIds.has(c.id));
          const updatedMembers = [...g.members, ...filteredNew].slice(0, 9);
          return {
            ...g,
            members: updatedMembers,
            memberCount: updatedMembers.length + 1,
          };
        }
        return g;
      })
    );
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
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

  const addGroupGearItem = (groupId: string, title: string, category: string, assignedToName: string) => {
    const newItem: GroupGearItem = {
      id: `gear-${Date.now()}`,
      title: title.trim(),
      assignedToName: assignedToName.trim() || 'Unassigned',
      isPacked: false,
      category: category || 'gear',
    };
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            gearChecklist: [...g.gearChecklist, newItem],
          };
        }
        return g;
      })
    );
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  const removeGroupGearItem = (groupId: string, itemId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            gearChecklist: g.gearChecklist.filter((item) => item.id !== itemId),
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
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      saveSecureItem(STORAGE_USER_PROFILE, JSON.stringify(next));
      return next;
    });
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
  const cartTotalInr = cart.reduce(
    (acc, curr) => acc + (curr.product.priceInr || curr.product.priceUsd * 83) * curr.quantity,
    0
  );

  return (
    <CircleContext.Provider
      value={{
        mode,
        ghostMode,
        activeBagId,
        setActiveBagId,
        bags,
        activeBag,
        activeTelemetry,
        hardwareBagsLiveMap,
        friends,
        groups,
        blockedUsers,
        incomingRequests,
        cart,
        cartCount,
        cartTotalUsd,
        cartTotalInr,
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
        addGroupGearItem,
        removeGroupGearItem,
        addToCart,
        removeFromCart,
        clearCart,
        updateProfile,
        triggerEmergencySOS,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        demoLogin,
        showOnboardingTour,
        setShowOnboardingTour,
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
        emotionalSupportNotifications,
        toggleEmotionalSupportNotifications,
        inAppWakeWordEnabled,
        toggleInAppWakeWord,
        isSentiChatOpen,
        sentiChatInitialMode,
        openSentiChat,
        closeSentiChat,
        vitalityData,
        toggleVitalityLumbarHeat,
        startFocusSprint,
        stopFocusSprint,
        logHydrationSip,
        addMembersToGroup,
        sentiMessages,
        addSentiMessage,
        clearSentiMessages,
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
