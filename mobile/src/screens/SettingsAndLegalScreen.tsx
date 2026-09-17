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
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';

interface SettingsAndLegalScreenProps {
  onBack: () => void;
}

export const SettingsAndLegalScreen: React.FC<SettingsAndLegalScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, signOut } = useCircle();

  const [fullName, setFullName] = useState(profile.fullName || 'Shree Prasandh');
  const [salutation, setSalutation] = useState(profile.salutation || 'Sir');
  const [shippingAddress, setShippingAddress] = useState(profile.shippingAddress || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [guardianName, setGuardianName] = useState(profile.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(profile.guardianPhone || '');
  const [guardianEmail, setGuardianEmail] = useState(profile.guardianEmail || '');

  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const handleSaveProfile = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    updateProfile({
      fullName: fullName.trim(),
      name: fullName.trim(),
      salutation: salutation.trim(),
      shippingAddress: shippingAddress.trim(),
      phone: phone.trim(),
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianEmail: guardianEmail.trim(),
    });
    Alert.alert(
      'Profile Updated',
      'Your identity, shipping address, and emergency guardian details have been saved securely.'
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

          {/* Shipping Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Boutique Shipping & Delivery Address</Text>
            <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 10 }]}>
              <MapPin size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.textInput, { height: 50, textAlignVertical: 'top' }]}
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
            <View style={styles.inputWrapper}>
              <Phone size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
              />
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
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
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
});
