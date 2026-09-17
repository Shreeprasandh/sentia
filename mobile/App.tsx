import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, LogBox } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, CheckSquare, Sparkles, Settings, Users, ShoppingBag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows } from './src/theme/tokens';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BagRadarScreen } from './src/screens/BagRadarScreen';
import { EssentialsChecklistScreen } from './src/screens/EssentialsChecklistScreen';
import { CycleTrackerScreen } from './src/screens/CycleTrackerScreen';
import { VitalityTrackerScreen } from './src/screens/VitalityTrackerScreen';
import { CircleScreen } from './src/screens/CircleScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { SettingsAndLegalScreen } from './src/screens/SettingsAndLegalScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { AppStartupAnimation } from './src/components/AppStartupAnimation';
import { OnboardingTour } from './src/components/OnboardingTour';
import { SentiChatModal } from './src/components/SentiChatModal';
import { CircleProvider, useCircle } from './src/context/CircleContext';
import { useDoubleBackExit } from './src/hooks/useDoubleBackExit';

// Completely silence LogBox warning overlays and intercept HMR disconnection toasts
const _originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (msg.includes('Cannot connect to Expo CLI') ||
      msg.includes('Expo CLI') ||
      msg.includes('HMR') ||
      msg.includes('Metro'))
  ) {
    return;
  }
  _originalWarn(...args);
};

LogBox.ignoreAllLogs(true);

type NavTab = 'dashboard' | 'radar' | 'essentials' | 'cycle' | 'circle' | 'shop' | 'settings';

function MainContent() {
  const insets = useSafeAreaInsets();
  const {
    mode,
    isAuthenticated,
    showOnboardingTour,
    setShowOnboardingTour,
    profile,
    isSentiChatOpen,
    sentiChatInitialMode,
    closeSentiChat,
  } = useCircle();
  const [isStartingUp, setIsStartingUp] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Android Double-Back Hardware Button Protection
  useDoubleBackExit({
    currentTab,
    onNavigateHome: () => setCurrentTab('dashboard'),
  });

  const switchTab = (tab: NavTab) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCurrentTab(tab);
  };

  // Ensure bottom tab bar floats comfortably above physical home indicator or navigation bar
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <View style={styles.container}>
      {/* Choreographed Startup Opening Animation */}
      {isStartingUp && (
        <AppStartupAnimation onAnimationComplete={() => setIsStartingUp(false)} />
      )}

      {/* Unauthenticated State: Display Luxury Auth & Onboarding Gate */}
      {!isStartingUp && !isAuthenticated && (
        <AuthScreen />
      )}

      {/* Authenticated State: Display Main Application Viewport & Tab Navigation */}
      {!isStartingUp && isAuthenticated && (
        <>
          {/* Active Screen Viewport */}
          <View style={styles.viewport}>
            {currentTab === 'dashboard' && <DashboardScreen onNavigate={(route) => setCurrentTab(route as NavTab)} />}
            {currentTab === 'radar' && <BagRadarScreen onBack={() => setCurrentTab('dashboard')} />}
            {currentTab === 'essentials' && <EssentialsChecklistScreen onBack={() => setCurrentTab('dashboard')} />}
            {currentTab === 'cycle' && (
              profile.gender === 'male' ? (
                <VitalityTrackerScreen onBack={() => setCurrentTab('dashboard')} />
              ) : (
                <CycleTrackerScreen onBack={() => setCurrentTab('dashboard')} />
              )
            )}
            {currentTab === 'circle' && <CircleScreen onBack={() => setCurrentTab('dashboard')} />}
            {currentTab === 'shop' && <ShopScreen onBack={() => setCurrentTab('dashboard')} />}
            {currentTab === 'settings' && <SettingsAndLegalScreen onBack={() => setCurrentTab('dashboard')} />}
          </View>

          {/* Senti Interactive Onboarding Tour (Launched upon first-time sign up) */}
          <OnboardingTour
            visible={showOnboardingTour}
            onComplete={() => setShowOnboardingTour(false)}
          />

          {/* Senti Interactive AI Chat Sheet Modal (Globally Accessible Across All Tabs) */}
          <SentiChatModal
            visible={isSentiChatOpen}
            onClose={closeSentiChat}
            initialMode={sentiChatInitialMode}
            onNavigateAction={(route) => setCurrentTab(route as NavTab)}
          />

          {/* Artisanal Bottom Tab Bar with Dynamic Safe Area Clearance */}
          <View style={[styles.tabBarContainer, { paddingBottom: bottomInset }]}>
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => switchTab('dashboard')}
                activeOpacity={0.7}
              >
                <Home
                  size={20}
                  color={currentTab === 'dashboard' ? (mode === 'friends' ? Colors.cognacAmber : Colors.primary) : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    currentTab === 'dashboard' && (mode === 'friends' ? styles.tabLabelCognac : styles.tabLabelActive),
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => switchTab('radar')}
                activeOpacity={0.7}
              >
                <Compass
                  size={20}
                  color={currentTab === 'radar' ? Colors.primary : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    currentTab === 'radar' && styles.tabLabelActive,
                  ]}
                >
                  Radar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => switchTab('essentials')}
                activeOpacity={0.7}
              >
                <CheckSquare
                  size={20}
                  color={currentTab === 'essentials' ? Colors.primary : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    currentTab === 'essentials' && styles.tabLabelActive,
                  ]}
                >
                  Checklist
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => switchTab('circle')}
                activeOpacity={0.7}
              >
                <Users
                  size={20}
                  color={currentTab === 'circle' ? Colors.cognacAmber : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    currentTab === 'circle' && styles.tabLabelCognac,
                  ]}
                >
                  Circle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => switchTab('settings')}
                activeOpacity={0.7}
              >
                <Settings
                  size={20}
                  color={currentTab === 'settings' ? Colors.primary : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    currentTab === 'settings' && styles.tabLabelActive,
                  ]}
                >
                  Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CircleProvider>
        <MainContent />
      </CircleProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  viewport: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: Colors.canvasElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
    ...Shadows.card,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: Colors.canvasElevated,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabLabelCognac: {
    color: Colors.cognacAmber,
    fontWeight: '700',
  },
});
