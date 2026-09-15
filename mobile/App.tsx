import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Home, Compass, CheckSquare, Sparkles, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows } from './src/theme/tokens';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BagRadarScreen } from './src/screens/BagRadarScreen';
import { EssentialsChecklistScreen } from './src/screens/EssentialsChecklistScreen';
import { CycleTrackerScreen } from './src/screens/CycleTrackerScreen';
import { SettingsAndLegalScreen } from './src/screens/SettingsAndLegalScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'radar' | 'essentials' | 'cycle' | 'settings'>('dashboard');

  const switchTab = (tab: 'dashboard' | 'radar' | 'essentials' | 'cycle' | 'settings') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCurrentTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* Active Screen Viewport */}
      <View style={styles.viewport}>
        {currentTab === 'dashboard' && <DashboardScreen onNavigate={(route) => setCurrentTab(route as any)} />}
        {currentTab === 'radar' && <BagRadarScreen onBack={() => setCurrentTab('dashboard')} />}
        {currentTab === 'essentials' && <EssentialsChecklistScreen onBack={() => setCurrentTab('dashboard')} />}
        {currentTab === 'cycle' && <CycleTrackerScreen onBack={() => setCurrentTab('dashboard')} />}
        {currentTab === 'settings' && <SettingsAndLegalScreen onBack={() => setCurrentTab('dashboard')} />}
      </View>

      {/* Artisanal Bottom Tab Bar */}
      <SafeAreaView style={styles.tabBarSafeArea}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => switchTab('dashboard')}
            activeOpacity={0.7}
          >
            <Home
              size={20}
              color={currentTab === 'dashboard' ? Colors.primary : Colors.textTertiary}
            />
            <Text
              style={[
                styles.tabLabel,
                currentTab === 'dashboard' && styles.tabLabelActive,
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
            onPress={() => switchTab('cycle')}
            activeOpacity={0.7}
          >
            <Sparkles
              size={20}
              color={currentTab === 'cycle' ? '#9D174D' : Colors.textTertiary}
            />
            <Text
              style={[
                styles.tabLabel,
                currentTab === 'cycle' && { color: '#9D174D', fontWeight: '700' },
              ]}
            >
              Cycle
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
      </SafeAreaView>
    </View>
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
  tabBarSafeArea: {
    backgroundColor: Colors.canvasElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
    ...Shadows.card,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
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
});
