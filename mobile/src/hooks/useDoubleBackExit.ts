import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface UseDoubleBackExitProps {
  currentTab: string;
  onNavigateHome: () => void;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

/**
 * Android Hardware Back Button Hook:
 * 1. If modal open: closes modal.
 * 2. If on sub-screen: returns smoothly to Home ('dashboard').
 * 3. If on Home: requires double-tap within 2000ms to exit app.
 */
export function useDoubleBackExit({
  currentTab,
  onNavigateHome,
  isModalOpen = false,
  onCloseModal,
}: UseDoubleBackExitProps) {
  const lastBackPressTime = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // 1. If an active modal is open, dismiss it first
      if (isModalOpen && onCloseModal) {
        onCloseModal();
        return true;
      }

      // 2. If on any sub-tab, redirect to Home
      if (currentTab !== 'dashboard') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        onNavigateHome();
        return true;
      }

      // 3. If on Home, check double-press exit window
      const now = Date.now();
      if (now - lastBackPressTime.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressTime.current = now;
      ToastAndroid.show('Press back again to exit Sentia', ToastAndroid.SHORT);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [currentTab, onNavigateHome, isModalOpen, onCloseModal]);
}
