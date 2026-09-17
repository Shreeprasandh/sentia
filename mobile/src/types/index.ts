/**
 * Sentia TypeScript Type Definitions
 * Complete domain models matching Supabase PostgreSQL schema parity.
 */

export type SentiMood =
  | '01_happy'
  | '02_sad'
  | '03_excited'
  | '04_wink'
  | '05_love'
  | '06_laughing'
  | '07_blushing'
  | '08_cool'
  | '09_curious'
  | '10_thinking'
  | '11_surprised'
  | '12_confused'
  | '13_sleepy'
  | '14_tired'
  | '15_angry'
  | '16_proud'
  | '17_shy'
  | '18_embarrassed'
  | '19_working'
  | '20_celebrating'
  | '21_relaxed'
  | '22_eating'
  | '23_idea'
  | '24_good_night';

export interface SentiChatMessage {
  id: string;
  sender: 'user' | 'senti';
  text: string;
  mood: SentiMood;
  timestamp: string;
  suggestedAction?: {
    label: string;
    route?: string;
    action?: string;
  };
}

export type BagModelType = 'executive_backpack' | 'school_bag' | 'crossbody_tote' | 'travel_duffel';

export interface BagDevice {
  id: string;
  user_id: string;
  name: string;
  model_type: BagModelType;
  color: string;
  ble_mac_address?: string;
  hardware_version?: string;
  firmware_version?: string;
  battery_level: number;
  is_charging: boolean;
  is_locked: boolean;
  is_connected: boolean;
  last_seen_lat: number;
  last_seen_lng: number;
  last_seen_at: string;
  settings: {
    radar_distance_threshold_meters?: number;
    tamper_alarm_enabled?: boolean;
    departure_alarm_enabled?: boolean;
    led_color?: string;
  };
  created_at: string;
}

export interface BagTelemetry {
  id: string;
  bag_id: string;
  battery_level: number;
  is_charging: boolean;
  zipper_closed: boolean;
  bottle_inserted: boolean;
  weight_kg: number;
  internal_temp_c: number;
  humidity_pct: number;
  ble_rssi: number;
  tamper_detected: boolean;
  sos_triggered: boolean;
  is_locked?: boolean;
  lumbar_heat_active?: boolean;
  is_pairing_mode?: boolean;
  recorded_at: string;
}

export interface EssentialItem {
  id: string;
  user_id: string;
  bag_id: string;
  item_name: string;
  category: 'electronics' | 'hygiene' | 'documents' | 'apparel' | 'health' | 'other';
  is_packed: boolean;
  is_critical: boolean;
  auto_reset_daily: boolean;
  created_at: string;
}

export interface MenstrualCycleRecord {
  id: string;
  user_id: string;
  cycle_start_date: string;
  cycle_length_days: number;
  period_length_days: number;
  prompt_packing_days_prior: number;
  notes?: string;
  created_at: string;
}

export interface WeatherData {
  city: string;
  tempC: number;
  condition: string;
  rainProbabilityPct: number;
  uvIndex: number;
  humidityPct: number;
  packingRecommendation: string;
  cachedAt: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  emergency_contacts: {
    name: string;
    phone: string;
    relation: string;
  }[];
  preferred_persona: 'professional' | 'student' | 'traveler' | 'parent';
  created_at: string;
}

export type DeviceRole = 'primary' | 'secondary' | 'tertiary';

export interface MultiDeviceBag {
  id: string;
  name: string;
  model: string;
  role: DeviceRole;
  battery: number;
  isCharging: boolean;
  isLocked: boolean;
  isConnected: boolean;
  zipperClosed: boolean;
  bottleInserted: boolean;
  weightKg: number;
  tempC: number;
  humidityPct: number;
  lastSeenText: string;
  image: any;
  colorName: string;
  bleRssi?: number;
  tamperDetected?: boolean;
  sosTriggered?: boolean;
  isPairingMode?: boolean;
}

export interface FriendContact {
  id: string;
  name: string;
  salutation: string;
  avatarMood: SentiMood;
  bagModel: string;
  battery: number;
  distanceText: string;
  isNearby: boolean;
  isOnline: boolean;
  safeStatusText: string;
  friendCode: string;
  inviteStatus?: 'joined' | 'pending';
  lastSeenLocation?: string;
  safeZoneStatus?: 'inside_safe_zone' | 'outside_boundary';
}

export interface GroupGearItem {
  id: string;
  title: string;
  assignedToName: string;
  isPacked: boolean;
  category: string;
}

export interface GroupSafeArrival {
  id: string;
  userName: string;
  locationName: string;
  timestamp: string;
}

export interface GroupTribe {
  id: string;
  name: string;
  accentColor: string;
  memberCount: number;
  maxMembers: number; // Enforced at 10
  members: FriendContact[];
  gearChecklist: GroupGearItem[];
  safeArrivals: GroupSafeArrival[];
  description: string;
  createdAt: string;
}

export interface BoutiqueProduct {
  id: string;
  name: string;
  tagline: string;
  priceUsd: number;
  priceInr: number;
  category: 'smart_pack' | 'hydration' | 'cycle_care' | 'radar_tag' | 'power_insert';
  image: any;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  badge?: string;
  description: string;
  specs: { label: string; value: string }[];
  howToUseSteps: string[];
  faq: { question: string; answer: string }[];
  reviews: {
    id: string;
    userName: string;
    rating: number;
    date: string;
    comment: string;
    verifiedPurchase: boolean;
  }[];
}

export interface CartItem {
  product: BoutiqueProduct;
  quantity: number;
}

export interface ExtendedProfile {
  fullName: string;
  name?: string;
  salutation: string;
  email: string;
  phone: string;
  userCode: string;
  handle: string;
  shippingAddress: string;
  birthday?: string;
  dateOfBirth?: string;
  avatarUri?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
}

export interface ChecklistPreset {
  id: string;
  name: string;
  iconName: string;
  isDefault: boolean;
  items: EssentialItem[];
  scheduledDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  specificDate?: string;   // 'YYYY-MM-DD'
  alertTime?: string;      // e.g. '08:15 AM'
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  time?: string; // '09:00 AM'
  category: 'task' | 'meeting' | 'travel' | 'cycle' | 'health' | 'reminder';
  notes?: string;
  attachedPresetId?: string;
  isCompleted?: boolean;
}

export interface CyclePhaseData {
  dayOfCycle: number;
  totalCycleDays: number;
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  phaseTitle: string;
  daysUntilNextCycle: number;
  description: string;
  recommendedSupplies: string[];
  lumbarHeatActive: boolean;
  lumbarHeatMinutesRemaining: number;
}

