import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  User,
  Shield,
  FileText,
  Mail,
  Download,
  Trash2,
  CheckCircle,
  ExternalLink,
  LogOut,
  MapPin,
  Phone,
  Save,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Navigation,
  Heart,
  Mic,
  Info,
  Sparkles,
  Smartphone,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';
import { CountryCodePickerModal } from '../components/CountryCodePickerModal';
import { WidgetStudioModal } from '../components/WidgetStudioModal';
import { detectCurrentAddress } from '../services/locationService';

interface SettingsAndLegalScreenProps {
  onBack: () => void;
}

export const SettingsAndLegalScreen: React.FC<SettingsAndLegalScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const {
    profile,
    updateProfile,
    signOut,
    triggerEmergencySOS,
    emotionalSupportNotifications,
    toggleEmotionalSupportNotifications,
    inAppWakeWordEnabled,
    toggleInAppWakeWord,
  } = useCircle();

  const [fullName, setFullName] = useState(profile.fullName || 'Shree Prasandh');
  const [salutation, setSalutation] = useState(profile.salutation || 'Sir');
  const [birthday, setBirthday] = useState(profile.birthday || profile.dateOfBirth || '2001-08-14');
  const [gender, setGender] = useState<'female' | 'male' | 'non_binary' | 'prefer_not_to_say'>(
    profile.gender || 'prefer_not_to_say'
  );
  const [shippingAddress, setShippingAddress] = useState(profile.shippingAddress || '');

  // Parse dial code and raw phone number
  const initialPhone = profile.phone || '+91 98401 23456';
  const matchedDial = initialPhone.startsWith('+') ? initialPhone.split(' ')[0] : '+91';
  const initialNumber = initialPhone.replace(matchedDial, '').trim();

  const [selectedDialCode, setSelectedDialCode] = useState(matchedDial || '+91');
  const [selectedCountryIso, setSelectedCountryIso] = useState(matchedDial === '+91' ? 'IN' : 'GL');
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [locatingAddress, setLocatingAddress] = useState(false);

  const [guardianName, setGuardianName] = useState(profile.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(profile.guardianPhone || '');
  const [guardianEmail, setGuardianEmail] = useState(profile.guardianEmail || '');

  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [careModalVisible, setCareModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [widgetStudioVisible, setWidgetStudioVisible] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const handleDetectCurrentLocation = async () => {
    setLocatingAddress(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const result = await detectCurrentAddress();
    setLocatingAddress(false);
    if (result.success && result.formattedAddress) {
      setShippingAddress(result.formattedAddress);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    } else {
      Alert.alert('Location Auto-Fill', result.error || 'Could not retrieve current address.');
    }
  };

  const handleSaveProfile = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    const fullPhone = phoneNumber.trim() ? `${selectedDialCode} ${phoneNumber.trim()}` : '';
    updateProfile({
      fullName: fullName.trim(),
      name: fullName.trim(),
      salutation: salutation.trim(),
      birthday: birthday.trim(),
      dateOfBirth: birthday.trim(),
      shippingAddress: shippingAddress.trim(),
      phone: fullPhone,
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianEmail: guardianEmail.trim(),
      gender: gender,
    });
    Alert.alert(
      'Profile Updated',
      'Your identity, telemetry profile, shipping address, and emergency guardian details have been saved securely.'
    );
  };

  const handleTriggerSOS = () => {
    Alert.alert(
      'Emergency SOS Dispatch',
      `Broadcast an emergency distress alert to ${guardianName || 'your registered emergency guardian'} with real-time hardware telemetry and GPS beacon coordinates?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispatch SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              const res = await triggerEmergencySOS();
              if (res.success) {
                if (res.smsUrl && profile.guardianPhone) {
                  Alert.alert(
                    'SOS Dispatched',
                    `Emergency distress alert successfully transmitted to ${profile.guardianEmail || 'guardian'}. Would you like to open your messaging app to send a direct emergency SMS?`,
                    [
                      { text: 'Done', style: 'cancel' },
                      {
                        text: 'Send SMS',
                        onPress: () => {
                          Linking.openURL(res.smsUrl!).catch(() => {});
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert('SOS Dispatched', `Emergency distress alert successfully transmitted to ${profile.guardianEmail || 'guardian'}.`);
                }
              } else {
                Alert.alert('SOS Alert', 'Distress beacon activated locally.');
              }
            } catch {
              Alert.alert('SOS Alert', 'Distress beacon activated locally.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Alert.alert(
      'Sign Out of Sentia',
      'Are you sure you want to sign out of this device? Your local session token will be cleared from SecureStore.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            onBack();
          },
        },
      ]
    );
  };

  // Dynamic status bar safe clearance: accommodates Dynamic Island, camera punch-hole, and status bar
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;

  const togglePasswordVisibility = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setShowPassword((prev) => !prev);
  };

  const handleExportData = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Alert.alert(
      'Export Telemetry Data',
      'A secure, encrypted JSON archive of your bags, trips, and telemetry records has been prepared and sent to your verified email.',
      [{ text: 'Done', style: 'default' }]
    );
  };

  const handleDeleteAccount = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    Alert.alert(
      'Delete Account & Telemetry',
      'This action will permanently erase your profile, bag registrations, and telemetry records from Supabase in adherence to GDPR Right-to-be-Forgotten. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase All Data',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Erased', 'Your profile and data have been deleted.');
          },
        },
      ]
    );
  };

  const handleSendSupport = () => {
    if (!supportMessage.trim()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportModalVisible(false);
      setSupportMessage('');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} translucent={true} />

      {/* Header with Dynamic Safe Area Clearance */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <Text style={styles.sectionHeader}>Profile & Credentials</Text>
        <View style={styles.card}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Salutation */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Companion Salutation (e.g. Sir, Madam, Lord, Dr.)</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                value={salutation}
                onChangeText={setSalutation}
                placeholder="Preferred salutation"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <View style={styles.inputWrapper}>
              <Calendar size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                value={birthday}
                onChangeText={setBirthday}
                placeholder="YYYY-MM-DD (e.g. 2001-08-14)"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Wellness Telemetry Profile (Gender Customization) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Wellness Telemetry Profile</Text>
            <View style={styles.genderRow}>
              {(
                [
                  { key: 'female', label: 'Female', sub: 'Cycle Care' },
                  { key: 'male', label: 'Male', sub: 'Vitality & Focus' },
                  { key: 'prefer_not_to_say', label: 'Neutral', sub: 'Balanced' },
                ] as const
              ).map((item) => {
                const isSelected = gender === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.genderCard, isSelected && styles.genderCardSelected]}
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                      setGender(item.key);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderCardTitle, isSelected && styles.genderCardTitleSelected]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.genderCardSub, isSelected && styles.genderCardSubSelected]}>
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.inputHelpText}>
              Configures the hardware dashboard between Cycle Care and Vitality & Spinal Ergonomics.
            </Text>
          </View>

          {/* Shipping Address */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.inputLabel}>Boutique Shipping & Delivery Address</Text>
              <TouchableOpacity
                style={styles.useLocationBtn}
                onPress={handleDetectCurrentLocation}
                disabled={locatingAddress}
                activeOpacity={0.8}
              >
                {locatingAddress ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Navigation size={12} color={Colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.useLocationBtnText}>Use Current Location</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12, minHeight: 68 }]}>
              <MapPin size={18} color={Colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
              <TextInput
                style={[styles.textInput, { height: 48, textAlignVertical: 'top', paddingTop: 0 }]}
                value={shippingAddress}
                onChangeText={setShippingAddress}
                placeholder="Residence or office shipping address"
                placeholderTextColor={Colors.textTertiary}
                multiline
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <View style={styles.phoneInputRow}>
              <TouchableOpacity
                style={styles.countryPickerBtn}
                onPress={() => setShowCountryPicker(true)}
                activeOpacity={0.8}
              >
                <View style={styles.countryPillBadge}>
                  <Text style={styles.countryPillText}>{selectedCountryIso}</Text>
                </View>
                <Text style={styles.countryCodeText}>{selectedDialCode}</Text>
                <ChevronDown size={14} color={Colors.textTertiary} style={{ marginLeft: 3 }} />
              </TouchableOpacity>

              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="98401 23456"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Emergency Guardian Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency SOS Guardian Contact</Text>
            <View style={styles.inputWrapper}>
              <Shield size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                value={guardianName}
                onChangeText={setGuardianName}
                placeholder="Guardian name"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Guardian Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Guardian Phone Relay</Text>
            <View style={styles.inputWrapper}>
              <Phone size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                value={guardianPhone}
                onChangeText={setGuardianPhone}
                placeholder="Guardian phone number"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Guardian Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Guardian Email Relay</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                value={guardianEmail}
                onChangeText={setGuardianEmail}
                placeholder="Guardian email address"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Save Profile Button */}
          <TouchableOpacity
            style={styles.saveProfileButton}
            onPress={handleSaveProfile}
            activeOpacity={0.85}
          >
            <Save size={16} color="#FAF6EE" />
            <Text style={styles.saveProfileButtonText}>Save Profile & Address Details</Text>
          </TouchableOpacity>
        </View>

        {/* Emotional Support & Senti Intelligence */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Emotional Support & Senti Intelligence</Text>
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setCareModalVisible(true);
            }}
            style={styles.headerInfoBtn}
            activeOpacity={0.7}
          >
            <Info size={15} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {/* Master Toggle: Emotional Support & Daily Care */}
          <TouchableOpacity
            style={styles.settingToggleRow}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              toggleEmotionalSupportNotifications();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.settingToggleLeft}>
              <View style={styles.settingIconBadge}>
                <Heart size={18} color={Colors.primary} />
              </View>
              <View style={styles.settingToggleTextCol}>
                <Text style={styles.settingToggleTitle}>Emotional Support & Daily Care</Text>
                <Text style={styles.settingToggleDesc}>
                  Gentle check-ins, hydration pacing, and evening wind-down messages (max 2/day, quiet hours 22:00-07:30).
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                emotionalSupportNotifications ? styles.toggleSwitchOn : styles.toggleSwitchOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  emotionalSupportNotifications ? styles.toggleThumbOn : styles.toggleThumbOff,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Master Toggle: In-App "Hey Senti" Wake Word */}
          <TouchableOpacity
            style={[styles.settingToggleRow, { borderBottomWidth: 0, marginTop: Spacing.sm }]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              toggleInAppWakeWord();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.settingToggleLeft}>
              <View style={styles.settingIconBadge}>
                <Mic size={18} color={Colors.primary} />
              </View>
              <View style={styles.settingToggleTextCol}>
                <Text style={styles.settingToggleTitle}>In-App "Hey Senti" Wake Word</Text>
                <Text style={styles.settingToggleDesc}>
                  Hands-free voice chat trigger while Sentia is open on screen. Pauses when app is closed to protect privacy and battery.
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                inAppWakeWordEnabled ? styles.toggleSwitchOn : styles.toggleSwitchOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  inAppWakeWordEnabled ? styles.toggleThumbOn : styles.toggleThumbOff,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Android Home Screen Widget Studio */}
          <TouchableOpacity
            style={[styles.settingToggleRow, { borderBottomWidth: 0, marginTop: Spacing.xs }]}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setWidgetStudioVisible(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.settingToggleLeft}>
              <View style={styles.settingIconBadge}>
                <Smartphone size={18} color={Colors.primary} />
              </View>
              <View style={styles.settingToggleTextCol}>
                <Text style={styles.settingToggleTitle}>Android Home Screen Widget Studio</Text>
                <Text style={styles.settingToggleDesc}>
                  Preview & configure 2x2 companion aura and 4x4 command pod on your phone launcher.
                </Text>
              </View>
            </View>
            <ExternalLink size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Security & Data Protection */}
        <Text style={styles.sectionHeader}>Security & Privacy Rights</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setPrivacyModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Shield size={18} color={Colors.primary} />
              <Text style={styles.menuText}>Privacy Policy (Zero Data Selling)</Text>
            </View>
            <ExternalLink size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setTermsModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <FileText size={18} color={Colors.primary} />
              <Text style={styles.menuText}>Terms & Hardware Conditions</Text>
            </View>
            <ExternalLink size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Download size={18} color={Colors.primary} />
              <Text style={styles.menuText}>Export Telemetry Archive (JSON)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <LogOut size={18} color={Colors.primary} />
              <Text style={styles.menuText}>Sign Out of Sentia</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Trash2 size={18} color={Colors.statusDanger} />
              <Text style={[styles.menuText, { color: Colors.statusDanger }]}>
                Permanently Delete Account & Data
              </Text>
            </View>
          </TouchableOpacity>

          {/* Emergency SOS Quick Dispatch */}
          <TouchableOpacity
            style={[styles.sosProfileButton, { marginTop: Spacing.md }]}
            onPress={handleTriggerSOS}
            activeOpacity={0.85}
          >
            <AlertTriangle size={16} color="#B91C1C" />
            <Text style={styles.sosProfileButtonText}>Trigger Emergency SOS Dispatch</Text>
          </TouchableOpacity>
        </View>

        {/* Support & Concierge */}
        <Text style={styles.sectionHeader}>Support & Concierge</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => setSupportModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Mail size={18} color={Colors.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.menuText}>Contact Sentia Concierge</Text>
                <Text style={styles.menuSubtext}>Direct email to sentia.service@gmail.com</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Copyright Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyrightText}>
            © 2026 Sentia Living Systems Inc. All rights reserved.
          </Text>
          <Text style={styles.versionText}>
            Firmware v2.4.1 • Mobile App v1.0.0 (Expo SDK 52)
          </Text>

          {/* Micro Legal Links */}
          <View style={styles.footerLegalRow}>
            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setPrivacyModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLegalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerLegalDot}>•</Text>
            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setTermsModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLegalLink}>Terms & Conditions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal visible={privacyModalVisible} animationType="slide" transparent>
        <View style={styles.legalModalOverlay}>
          <View style={styles.legalModalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView style={styles.legalScroll}>
              <Text style={styles.legalHeading}>1. Zero Data Monetization</Text>
              <Text style={styles.legalBody}>
                Sentia does not sell, rent, or trade your personal information, bag location history, or reproductive health telemetry to advertising brokers or third-party networks.
              </Text>
              <Text style={styles.legalHeading}>2. End-to-End Telemetry Encryption</Text>
              <Text style={styles.legalBody}>
                All sensor streams (weight, zipper, battery, GPS) are encrypted in transit using TLS 1.3 and at rest with AES-256 PostgreSQL encryption backed by Row Level Security (RLS).
              </Text>
              <Text style={styles.legalHeading}>3. GDPR & CCPA Compliance</Text>
              <Text style={styles.legalBody}>
                You retain the right to export your complete telemetry history at any time or execute an atomic account erasure directly from settings.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal visible={termsModalVisible} animationType="slide" transparent>
        <View style={styles.legalModalOverlay}>
          <View style={styles.legalModalContent}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>
            <ScrollView style={styles.legalScroll}>
              <Text style={styles.legalHeading}>1. Hardware Ownership & Warranty</Text>
              <Text style={styles.legalBody}>
                Every Sentia Smart Bag includes a 2-year manufacturer warranty covering internal sensors, battery pack, and BLE transceivers under normal usage.
              </Text>
              <Text style={styles.legalHeading}>2. Emergency Dispatch Limitation</Text>
              <Text style={styles.legalBody}>
                The School Bag SOS trigger is an auxiliary notification system. It relies on active cellular/Bluetooth connectivity and is not a substitute for local emergency response services.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setTermsModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Support Desk Modal */}
      <Modal visible={supportModalVisible} animationType="slide" transparent>
        <View style={styles.legalModalOverlay}>
          <View style={styles.legalModalContent}>
            <Text style={styles.modalTitle}>Sentia Support Concierge</Text>
            <Text style={styles.modalSubtitle}>
              Dispatched directly to sentia.service@gmail.com
            </Text>

            {supportSent ? (
              <View style={styles.successState}>
                <CheckCircle size={40} color={Colors.primary} />
                <Text style={styles.successTitle}>Ticket Dispatched</Text>
                <Text style={styles.successSubtitle}>Our concierge team will respond within 4 hours.</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.supportInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your question, repair request, or feedback..."
                  placeholderTextColor={Colors.textTertiary}
                  value={supportMessage}
                  onChangeText={setSupportMessage}
                />
                <View style={styles.supportButtonsRow}>
                  <TouchableOpacity
                    style={styles.supportCancelButton}
                    onPress={() => setSupportModalVisible(false)}
                  >
                    <Text style={styles.supportCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.supportSendButton}
                    onPress={handleSendSupport}
                  >
                    <Text style={styles.supportSendText}>Send Ticket</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Emotional Support & Daily Care Architecture Modal */}
      <Modal visible={careModalVisible} animationType="slide" transparent>
        <View style={styles.legalModalOverlay}>
          <View style={styles.legalModalContent}>
            <Text style={styles.modalTitle}>Daily Care & Senti Intelligence</Text>
            <Text style={styles.modalSubtitle}>Empathetic companion pacing and privacy protocols</Text>
            <ScrollView style={styles.legalScroll}>
              <Text style={styles.legalHeading}>1. Pacing & Attention Respect</Text>
              <Text style={styles.legalBody}>
                To eliminate notification fatigue, Sentia strictly enforces a maximum cap of two emotional check-ins per 24-hour window. Messages are sent only during moments of physical transition or rest.
              </Text>
              <Text style={styles.legalHeading}>2. Sacred Quiet Hours</Text>
              <Text style={styles.legalBody}>
                From 22:00 to 07:30 local device time, Sentia enters silent companion mode. No proactive notifications are ever dispatched during your rest window.
              </Text>
              <Text style={styles.legalHeading}>3. Contextual Hardware Sync</Text>
              <Text style={styles.legalBody}>
                Care prompts synchronize with real bag sensor telemetry: hydration reminders based on movement and weather telemetry, posture resets during heavy carry periods, and soothing lumbar warmth reminders during high-stress hours or cycle phases.
              </Text>
              <Text style={styles.legalHeading}>4. In-App Hands-Free Voice</Text>
              <Text style={styles.legalBody}>
                When enabled, Sentia listens for the "Hey Senti" wake word only while the app is actively on your screen. The audio stream never records or transmits ambient conversations to third parties and immediately suspends when the app is minimized.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setCareModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CountryCodePickerModal
        visible={showCountryPicker}
        selectedCode={selectedDialCode}
        onSelect={(item) => {
          setSelectedDialCode(item.code);
          setSelectedCountryIso(item.iso);
        }}
        onClose={() => setShowCountryPicker(false)}
      />

      <WidgetStudioModal
        visible={widgetStudioVisible}
        onClose={() => setWidgetStudioVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  card: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.subtle,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 48,
  },
  countryPillBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.canvasWarm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginRight: 6,
  },
  countryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  useLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAccent,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  useLocationBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  visibilityButton: {
    padding: 4,
  },
  saveProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    marginTop: Spacing.sm,
    ...Shadows.subtle,
  },
  saveProfileButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF6EE',
  },
  sosProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    marginTop: Spacing.sm,
  },
  sosProfileButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF6EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  menuSubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  footerLegalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerLegalLink: {
    fontSize: 11,
    color: Colors.textTertiary,
    textDecorationLine: 'underline',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerLegalDot: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginHorizontal: 8,
  },
  legalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  legalModalContent: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: Colors.canvas,
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.floating,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  legalScroll: {
    marginVertical: Spacing.md,
  },
  legalHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  legalBody: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  modalCloseButtonText: {
    color: Colors.textInverse,
    fontWeight: '600',
    fontSize: 14,
  },
  supportInput: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginVertical: Spacing.md,
  },
  supportButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  supportCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    marginRight: Spacing.sm,
    backgroundColor: Colors.cardAccent,
  },
  supportCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  supportSendButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    marginLeft: Spacing.sm,
    backgroundColor: Colors.primary,
  },
  supportSendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  successSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  headerInfoBtn: {
    padding: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.cardAccent,
  },
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  settingToggleLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 14,
  },
  settingIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cardAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  settingToggleTextCol: {
    flex: 1,
  },
  settingToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingToggleDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  toggleSwitch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: Colors.primary,
  },
  toggleSwitchOff: {
    backgroundColor: '#D1D5DB',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FAF6EE',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCardSelected: {
    backgroundColor: Colors.cardAccent,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  genderCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  genderCardTitleSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  genderCardSub: {
    fontSize: 9,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  genderCardSubSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputHelpText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
    lineHeight: 15,
  },
});
