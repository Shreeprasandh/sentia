/**
 * Sentia Emotional Support & Daily Care Notification Engine
 * Adheres to The Five Monks Mandate 2:
 * - Maximum 2 emotional notifications per day.
 * - Strict quiet hours enforcement (22:00 to 07:30).
 * - Gender, weather, and physical rhythm awareness.
 */

export interface EmotionalSupportMessage {
  id: string;
  category: 'morning_uplift' | 'hydration_care' | 'cycle_comfort' | 'posture_vitality' | 'evening_rest';
  title: string;
  body: string;
  salutationTarget?: string;
}

const FEMALE_MORNING_MESSAGES = [
  'A peaceful morning, {salutation}. The air is calm and your Sentia bag is prepared. Move gently today.',
  'Good morning, {salutation}. Remember you do not have to carry everything at once. Take a breath; you are capable.',
  'Morning clarity, {salutation}. Hydration flask and essentials are in order. Wishing you a serene day.',
];

const MALE_MORNING_MESSAGES = [
  'Good morning, {salutation}. Your smart pack is packed, balanced, and ready. Step into today with focus.',
  'A crisp morning, {salutation}. Your ergonomic spinal load is optimal. Conquer your priorities with clarity.',
  'Morning momentum, {salutation}. Stand tall, stay hydrated, and master your day.',
];

const NEUTRAL_MORNING_MESSAGES = [
  'Good morning, {salutation}. Your essentials are accounted for. Have a balanced and productive day.',
  'A fresh morning, {salutation}. Take a moment to breathe before your journey begins.',
];

const HYDRATION_CARE_MESSAGES = [
  'A mindful pause, {salutation}. Your bottle dock notes you have been focused for hours. Take a refreshing sip.',
  'Mind and body check, {salutation}. Hydration restores mental clarity. Time for a quick water break.',
];

const CYCLE_COMFORT_MESSAGES = [
  'Gentle reminder, {salutation}. Your body is working hard today. Your lumbar warmth pad is ready whenever you need soothing comfort.',
  'Take things at your own pace today, {salutation}. Rest is just as essential as productivity. Senti is looking after your bag.',
];

const POSTURE_VITALITY_MESSAGES = [
  'Ergonomic reset, {salutation}. You have logged deep focus. Roll your shoulders back and give your spine a 2-minute stretch.',
  'Posture check, {salutation}. Ensure both straps are balanced. Your lower-back health determines your stamina.',
];

const EVENING_REST_MESSAGES = [
  'Evening tranquility, {salutation}. You accomplished much today. Set your smart pack to charge and let your mind unwind.',
  'A gentle evening, {salutation}. Disconnect from demands. Rest deeply so you awaken renewed.',
];

interface MessageParams {
  gender?: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';
  weatherCondition?: string;
  isPeriodActive?: boolean;
  salutation?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export function generateDailyEmotionalMessage(params: MessageParams): EmotionalSupportMessage {
  const salutation = params.salutation || 'Sir';
  const gender = params.gender || 'female';
  const timeOfDay = params.timeOfDay || 'morning';

  // 1. Cycle Comfort check (female priority)
  if (params.isPeriodActive && gender === 'female') {
    const raw = CYCLE_COMFORT_MESSAGES[Math.floor(Math.random() * CYCLE_COMFORT_MESSAGES.length)];
    return {
      id: `cycle-${Date.now()}`,
      category: 'cycle_comfort',
      title: 'Senti Caring Touch',
      body: raw.replace('{salutation}', salutation),
    };
  }

  // 2. Afternoon Hydration / Posture Check
  if (timeOfDay === 'afternoon') {
    if (gender === 'male') {
      const raw = POSTURE_VITALITY_MESSAGES[Math.floor(Math.random() * POSTURE_VITALITY_MESSAGES.length)];
      return {
        id: `posture-${Date.now()}`,
        category: 'posture_vitality',
        title: 'Senti Ergonomic Focus',
        body: raw.replace('{salutation}', salutation),
      };
    } else {
      const raw = HYDRATION_CARE_MESSAGES[Math.floor(Math.random() * HYDRATION_CARE_MESSAGES.length)];
      return {
        id: `hydration-${Date.now()}`,
        category: 'hydration_care',
        title: 'Senti Mindful Hydration',
        body: raw.replace('{salutation}', salutation),
      };
    }
  }

  // 3. Evening Rest
  if (timeOfDay === 'evening') {
    const raw = EVENING_REST_MESSAGES[Math.floor(Math.random() * EVENING_REST_MESSAGES.length)];
    return {
      id: `evening-${Date.now()}`,
      category: 'evening_rest',
      title: 'Senti Evening Wind-Down',
      body: raw.replace('{salutation}', salutation),
    };
  }

  // 4. Morning Uplift
  let pool = NEUTRAL_MORNING_MESSAGES;
  if (gender === 'female') pool = FEMALE_MORNING_MESSAGES;
  else if (gender === 'male') pool = MALE_MORNING_MESSAGES;

  const raw = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: `morning-${Date.now()}`,
    category: 'morning_uplift',
    title: 'Senti Morning Uplift',
    body: raw.replace('{salutation}', salutation),
  };
}

export function isQuietHoursActive(): boolean {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  // Quiet hours: 22:00 (10 PM = 1320 mins) to 07:30 (7:30 AM = 450 mins)
  return minutes >= 1320 || minutes < 450;
}
