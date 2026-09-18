import { Platform } from 'react-native';

export interface SpeechRecognitionCallbacks {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onVolumeChange?: (volume: number) => void; // 0.0 to 1.0 normalized
  onError?: (errorMessage: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

let activeRecognitionSession: any = null;
let isCurrentlyListening = false;
let webRecognitionInstance: any = null;
let simulatedVolumeInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Dynamically resolves the native ExpoSpeechRecognitionModule if present
 */
function getNativeModule(): any {
  if (Platform.OS === 'web') return null;
  try {
    const mod = require('expo-speech-recognition');
    if (mod && mod.ExpoSpeechRecognitionModule) {
      return mod.ExpoSpeechRecognitionModule;
    }
  } catch {
    // Graceful fallback when running in Expo Go before custom dev build
  }
  return null;
}

/**
 * Checks and requests microphone and speech recognition permissions
 */
export async function requestSpeechPermissions(): Promise<boolean> {
  const nativeModule = getNativeModule();
  if (nativeModule) {
    try {
      const perms = await nativeModule.requestPermissionsAsync();
      return perms.granted === true;
    } catch {
      return false;
    }
  }

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Starts continuous, live speech-to-text recognition
 */
export async function startSpeechRecognition(callbacks: SpeechRecognitionCallbacks): Promise<boolean> {
  stopSpeechRecognition();

  const nativeModule = getNativeModule();

  // 1. Native Mobile Recognition (APK / Dev Client)
  if (nativeModule) {
    try {
      const perms = await nativeModule.requestPermissionsAsync();
      if (!perms.granted) {
        callbacks.onError?.('Microphone permission denied. Please allow microphone access in device settings.');
        return false;
      }

      isCurrentlyListening = true;
      callbacks.onStart?.();

      const listeners: any[] = [];

      listeners.push(
        nativeModule.addListener('start', () => {
          isCurrentlyListening = true;
          callbacks.onStart?.();
        })
      );

      listeners.push(
        nativeModule.addListener('result', (event: any) => {
          const primaryResult = event.results?.[0];
          if (primaryResult?.transcript) {
            callbacks.onTranscript(primaryResult.transcript, event.isFinal === true);
          }
        })
      );

      listeners.push(
        nativeModule.addListener('volumechange', (event: any) => {
          // Android returns dB (-2 to 10 typical), iOS returns normalized power
          const raw = Number(event?.value ?? 0);
          const normalized = Math.min(Math.max((raw + 2) / 12, 0.1), 1.0);
          callbacks.onVolumeChange?.(normalized);
        })
      );

      listeners.push(
        nativeModule.addListener('error', (event: any) => {
          isCurrentlyListening = false;
          callbacks.onError?.(event.message || 'Speech recognition error');
        })
      );

      listeners.push(
        nativeModule.addListener('end', () => {
          isCurrentlyListening = false;
          callbacks.onEnd?.();
        })
      );

      activeRecognitionSession = {
        remove: () => {
          listeners.forEach((l) => {
            try { l.remove(); } catch {}
          });
        },
      };

      await nativeModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: false,
      });

      return true;
    } catch (err: any) {
      isCurrentlyListening = false;
      callbacks.onError?.(err?.message || 'Failed to initialize native speech recognizer');
      return false;
    }
  }

  // 2. Web Browser Recognition (Chrome / Edge / Safari)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isCurrentlyListening = true;
          callbacks.onStart?.();

          // Pulse simulated volume wave during active web listening
          if (simulatedVolumeInterval) clearInterval(simulatedVolumeInterval);
          simulatedVolumeInterval = setInterval(() => {
            const vol = 0.2 + Math.random() * 0.75;
            callbacks.onVolumeChange?.(vol);
          }, 120);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const activeText = finalTranscript || interimTranscript;
          if (activeText) {
            callbacks.onTranscript(activeText.trim(), Boolean(finalTranscript));
          }
        };

        recognition.onerror = (event: any) => {
          isCurrentlyListening = false;
          callbacks.onError?.(event.error || 'Web speech error');
        };

        recognition.onend = () => {
          isCurrentlyListening = false;
          if (simulatedVolumeInterval) {
            clearInterval(simulatedVolumeInterval);
            simulatedVolumeInterval = null;
          }
          callbacks.onEnd?.();
        };

        webRecognitionInstance = recognition;
        recognition.start();
        return true;
      } catch (err: any) {
        callbacks.onError?.(err?.message || 'Web speech failed');
        return false;
      }
    }
  }

  // 3. Fallback Mode (e.g. Expo Go before custom APK build)
  isCurrentlyListening = true;
  callbacks.onStart?.();

  // Pulse volume to keep waveform animated
  if (simulatedVolumeInterval) clearInterval(simulatedVolumeInterval);
  simulatedVolumeInterval = setInterval(() => {
    const vol = 0.25 + Math.random() * 0.7;
    callbacks.onVolumeChange?.(vol);
  }, 100);

  return true;
}

/**
 * Stops any active speech-to-text recognition session
 */
export function stopSpeechRecognition(): void {
  isCurrentlyListening = false;

  if (simulatedVolumeInterval) {
    clearInterval(simulatedVolumeInterval);
    simulatedVolumeInterval = null;
  }

  const nativeModule = getNativeModule();
  if (nativeModule) {
    try {
      nativeModule.stop();
    } catch {}
  }

  if (activeRecognitionSession) {
    try {
      activeRecognitionSession.remove();
    } catch {}
    activeRecognitionSession = null;
  }

  if (webRecognitionInstance) {
    try {
      webRecognitionInstance.stop();
    } catch {}
    webRecognitionInstance = null;
  }
}

/**
 * Returns whether speech recognition is currently active
 */
export function isSpeechRecognitionActive(): boolean {
  return isCurrentlyListening;
}
