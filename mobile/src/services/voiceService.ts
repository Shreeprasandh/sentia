import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

let isSpeechMuted = false;
let cachedVoiceIdentifier: string | null = null;
let lastSpeechTimestamp = 0;
const MIN_SPEECH_INTERVAL_MS = 600; // Rate-limiting defense against stutter/flooding

export type SentiVoiceTone = 'gentle' | 'sweet' | 'ultra_sweet';
let currentTone: SentiVoiceTone = 'sweet';

/**
 * Discovers and caches the sweetest, highest-fidelity female voice on the device
 */
async function getSweetFemaleVoice(): Promise<string | undefined> {
  if (cachedVoiceIdentifier) return cachedVoiceIdentifier;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices || voices.length === 0) return undefined;

    // High-priority cute/sweet female voice signatures
    const preferredSignatures = Platform.OS === 'ios'
      ? ['samantha', 'siri', 'karen', 'victoria', 'en-us']
      : ['female', 'en-us-x-sfg', 'en-us-x-tpf', 'neural', 'natural'];

    for (const sig of preferredSignatures) {
      const match = voices.find(
        (v) =>
          v.language.toLowerCase().startsWith('en') &&
          (v.name.toLowerCase().includes(sig) || v.identifier.toLowerCase().includes(sig))
      );
      if (match) {
        cachedVoiceIdentifier = match.identifier;
        return match.identifier;
      }
    }

    // Generic English female fallback
    const fallback = voices.find(
      (v) => v.language.toLowerCase().startsWith('en') && (v as any).gender === 'female'
    );
    if (fallback) {
      cachedVoiceIdentifier = fallback.identifier;
      return fallback.identifier;
    }
  } catch {
    // Silent fallback to system default
  }
  return undefined;
}

export function setSentiVoiceTone(tone: SentiVoiceTone) {
  currentTone = tone;
}

export function getSentiVoiceTone(): SentiVoiceTone {
  return currentTone;
}

export function toggleSentiVoiceMute(): boolean {
  isSpeechMuted = !isSpeechMuted;
  if (isSpeechMuted) {
    Speech.stop();
  }
  return isSpeechMuted;
}

export function isVoiceMuted(): boolean {
  return isSpeechMuted;
}

/**
 * Speak text aloud with sweet, cute, human-like cadence
 * Pitch: 1.22 (sweet, warm girl mascot pitch)
 * Rate: 0.94 (relaxed, conversational human pacing)
 */
export async function speakSenti(text: string): Promise<void> {
  if (isSpeechMuted) return;

  const now = Date.now();
  if (now - lastSpeechTimestamp < MIN_SPEECH_INTERVAL_MS) {
    return; // Rate limit anti-abuse defense
  }
  lastSpeechTimestamp = now;

  try {
    await Speech.stop();

    // Sanitize input: strip bracketed tags, markdown asterisks, URLs, and prompt-injection artifacts
    const cleanSpeechText = text
      .replace(/\[MOOD:[a-z0-9_]+\]/gi, '')
      .replace(/\[[A-Z0-9_]+\]/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/https?:\/\/\S+/gi, '')
      .trim();

    if (!cleanSpeechText) return;

    const voiceId = await getSweetFemaleVoice();

    // Pitch configurations for cute human girl mascot
    let pitch = 1.22;
    let rate = 0.94;

    if (currentTone === 'ultra_sweet') {
      pitch = 1.28;
      rate = 0.96;
    } else if (currentTone === 'gentle') {
      pitch = 1.14;
      rate = 0.92;
    }

    Speech.speak(cleanSpeechText, {
      language: 'en-US',
      voice: voiceId,
      pitch,
      rate,
    });
  } catch {
    // Graceful silent fallback
  }
}

export function stopSentiSpeech(): void {
  try {
    Speech.stop();
  } catch {}
}

export function previewSentiVoice(sample?: string): void {
  const previewText = sample || 'Hello Sir! Senti is ready to keep your day safe and organized.';
  speakSenti(previewText);
}
