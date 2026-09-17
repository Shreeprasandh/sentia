import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  Shield,
  Check,
  Calendar,
  ChevronDown,
  Navigation,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { useCircle } from '../context/CircleContext';
import { ExtendedProfile } from '../types';
import { CountryCodePickerModal } from '../components/CountryCodePickerModal';
import { detectCurrentAddress } from '../services/locationService';

type AuthMode = 'sign_in' | 'sign_up';
type SignUpStep = 1 | 2;

const SALUTATION_OPTIONS = ['Sir', 'Madam', 'Lord', 'Dr.', 'None'];

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const insets = useSafeAreaInsets();
  const { signIn, signUp, demoLogin } = useCircle();

  const [mode, setMode] = useState<AuthMode>('sign_in');
  const [signUpStep, setSignUpStep] = useState<SignUpStep>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State - Step 1: Identity & Credentials
  const [fullName, setFullName] = useState('');
  const [selectedSalutation, setSelectedSalutation] = useState('Sir');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'prefer_not_to_say'>('female');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Sign Up State - Step 2: Delivery & Emergency Protection
  const [shippingAddress, setShippingAddress] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  // Country Dial Code & GPS Location State
  const [selectedDialCode, setSelectedDialCode] = useState('+91');
  const [selectedCountryIso, setSelectedCountryIso] = useState('IN');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [locatingAddress, setLocatingAddress] = useState(false);

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

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 12;

  const handleSignIn = async () => {
    if (!signInEmail.trim() || !signInPassword.trim()) {
      Alert.alert('Required Fields', 'Please provide both your registered email and password.');
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const res = await signIn(signInEmail.trim(), signInPassword);
    setLoading(false);

    if (res.success) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      if (onSuccess) onSuccess();
    } else {
      Alert.alert('Authentication Failed', res.error || 'Invalid email or password.');
    }
  };

  const calculateAge = (dobString: string): number => {
    const parts = dobString.trim().split(/[-/]/);
    if (parts.length !== 3) return -1;
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let day = parseInt(parts[2], 10);
    if (parts[2].length === 4) {
      year = parseInt(parts[2], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[0], 10);
    }
    if (isNaN(year) || isNaN(month) || isNaN(day)) return -1;
    if (year < 1900 || year > new Date().getFullYear()) return -1;
    if (month < 1 || month > 12) return -1;
    if (day < 1 || day > 31) return -1;
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleStep1Continue = () => {
    if (!fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      Alert.alert('Password Strength', 'Password must contain at least 6 characters.');
      return;
    }
    if (!birthdate.trim()) {
      Alert.alert('Date of Birth Required', 'Please enter your date of birth (YYYY-MM-DD) to verify eligibility.');
      return;
    }
    const age = calculateAge(birthdate.trim());
    if (age === -1) {
      Alert.alert('Invalid Date Format', 'Please enter a valid date in YYYY-MM-DD format (e.g. 2002-08-14).');
      return;
    }
    if (age < 16) {
      Alert.alert(
        'Age Restriction (16+ Required)',
        'Sentia Smart Living Ecosystem requires account holders to be at least 16 years of age in accordance with smart device transport liability and biometric data protection regulations.'
      );
      return;
    }
    if (!agreeTerms) {
      Alert.alert(
        'Terms Agreement Required',
        'Please review and agree to the Sentia Terms of Service and Privacy Policy to proceed.'
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSignUpStep(2);
  };

  const handleCompleteSignUp = async (skipStep2: boolean = false) => {
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const cleanHandle = '@' + fullName.trim().toLowerCase().replace(/\s+/g, '.') + '.sentia';
    const randomCode = 'SNT-' + Math.floor(100 + Math.random() * 900) + 'X';

    const profileData: Partial<ExtendedProfile> = {
      fullName: fullName.trim(),
      name: fullName.trim(),
      salutation: selectedSalutation === 'None' ? '' : selectedSalutation,
      email: signUpEmail.trim().toLowerCase(),
      phone: signUpPhone.trim() ? `${selectedDialCode} ${signUpPhone.trim()}` : `${selectedDialCode} 98401 23456`,
      birthday: birthdate.trim(),
      dateOfBirth: birthdate.trim(),
      gender: gender,
      userCode: randomCode,
      handle: cleanHandle,
      shippingAddress: skipStep2
        ? 'Unspecified Address • Update in Settings'
        : shippingAddress.trim() || '452 Belgravia Crescent, Suite 402, London',
      guardianName: skipStep2 ? 'Unassigned' : guardianName.trim() || 'Primary Guardian',
      guardianPhone: skipStep2 ? '' : guardianPhone.trim() || '+1 (555) 902-3341',
      guardianEmail: skipStep2 ? '' : guardianEmail.trim() || 'guardian.sentia@gmail.com',
    };

    const res = await signUp(profileData, signUpPassword);
    setLoading(false);

    if (res.success) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      if (onSuccess) onSuccess();
    } else {
      Alert.alert('Registration Failed', res.error || 'Unable to register account. Please try again.');
    }
  };

  const handleDemoLaunch = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    demoLogin();
    if (onSuccess) onSuccess();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} translucent={true} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Image
            source={require('../../assets/brand/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>SENTIA</Text>
          <Text style={styles.brandSubtitle}>Smart Living Ecosystem • Autonomous Companion</Text>
        </View>

        {/* Mode Switcher Tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'sign_in' && styles.tabButtonActive]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setMode('sign_in');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabButtonText, mode === 'sign_in' && styles.tabButtonTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, mode === 'sign_up' && styles.tabButtonActive]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setMode('sign_up');
              setSignUpStep(1);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabButtonText, mode === 'sign_up' && styles.tabButtonTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* SIGN IN FORM */}
        {mode === 'sign_in' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Executive Member Access</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to synchronize your smart pack, telemetry, and encrypted Circle tribe.
            </Text>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Registered Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@sentialiving.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={signInEmail}
                  onChangeText={setSignInEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your security password"
                  placeholderTextColor={Colors.textTertiary}
                  value={signInPassword}
                  onChangeText={setSignInPassword}
                  secureTextEntry={!showSignInPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowSignInPassword((p) => !p)}
                  style={styles.eyeBtn}
                >
                  {showSignInPassword ? (
                    <EyeOff size={18} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Sign In Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FAF6EE" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Sign In with Sentia Cloud</Text>
                  <ArrowRight size={16} color="#FAF6EE" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR INSTANT DEMO TESTING</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Demo Launch Button */}
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoLaunch}
              activeOpacity={0.85}
            >
              <View style={styles.demoIconBadge}>
                <Sparkles size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoTitle}>Quick Launch: Executive Demo</Text>
                <Text style={styles.demoSubtitle}>Direct access as Shree Prasandh (Sir)</Text>
              </View>
              <ArrowRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* SIGN UP FORM */}
        {mode === 'sign_up' && (
          <View style={styles.card}>
            {/* Step 1: Identity & Credentials */}
            {signUpStep === 1 && (
              <>
                <View style={styles.stepHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepBadge}>STEP 1 OF 2</Text>
                    <Text style={styles.cardTitle}>Identity & Security</Text>
                  </View>
                </View>
                <Text style={styles.cardSubtitle}>
                  Create your personal owner credential and companion address profile.
                </Text>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color={Colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Shree Prasandh"
                      placeholderTextColor={Colors.textTertiary}
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                </View>

                {/* Salutation Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Preferred Companion Salutation</Text>
                  <Text style={styles.inputHelpText}>
                    How Luna and Senti will address you throughout the ecosystem.
                  </Text>
                  <View style={styles.salutationChipsRow}>
                    {SALUTATION_OPTIONS.map((sal) => {
                      const isSelected = selectedSalutation === sal;
                      return (
                        <TouchableOpacity
                          key={sal}
                          style={[
                            styles.salutationChip,
                            isSelected && styles.salutationChipSelected,
                          ]}
                          onPress={() => {
                            try {
                              Haptics.selectionAsync();
                            } catch {}
                            setSelectedSalutation(sal);
                          }}
                          activeOpacity={0.8}
                        >
                          {isSelected && <Check size={12} color="#FAF6EE" style={{ marginRight: 4 }} />}
                          <Text
                            style={[
                              styles.salutationChipText,
                              isSelected && styles.salutationChipTextSelected,
                            ]}
                          >
                            {sal}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Date of Birth - 16+ Requirement */}
                <View style={styles.inputGroup}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.inputLabel}>Date of Birth</Text>
                    <Text style={{ fontSize: 10, color: Colors.cognacAmber, fontWeight: '700' }}>16+ REQUIRED</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <Calendar size={18} color={Colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="YYYY-MM-DD (e.g. 2002-08-14)"
                      placeholderTextColor={Colors.textTertiary}
                      value={birthdate}
                      onChangeText={setBirthdate}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  <Text style={styles.inputHelpText}>
                    Sentia hardware ecosystems require members to be at least 16 years of age in compliance with smart device lithium transport liability and digital safety laws.
                  </Text>
                </View>

                {/* Wellness Telemetry Profile (Gender Customization) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Wellness Telemetry Profile</Text>
                  <View style={styles.genderRow}>
                    {(
                      [
                        { key: 'female', label: 'Female', sub: 'Cycle Care' },
                        { key: 'male', label: 'Male', sub: 'Vitality' },
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
                    Determines whether your hardware dashboard activates Cycle Care sync or Vitality & Spinal Ergonomics.
                  </Text>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color={Colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="you@domain.com"
                      placeholderTextColor={Colors.textTertiary}
                      value={signUpEmail}
                      onChangeText={setSignUpEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
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
                        placeholder="98401 23456"
                        placeholderTextColor={Colors.textTertiary}
                        value={signUpPhone}
                        onChangeText={setSignUpPhone}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Create Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color={Colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="At least 6 characters"
                      placeholderTextColor={Colors.textTertiary}
                      value={signUpPassword}
                      onChangeText={setSignUpPassword}
                      secureTextEntry={!showSignUpPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowSignUpPassword((p) => !p)}
                      style={styles.eyeBtn}
                    >
                      {showSignUpPassword ? (
                        <EyeOff size={18} color={Colors.textSecondary} />
                      ) : (
                        <Eye size={18} color={Colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms of Service & Privacy Policy Checkbox */}
                <TouchableOpacity
                  style={styles.termsCheckboxRow}
                  onPress={() => setAgreeTerms((p) => !p)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkboxSquare, agreeTerms && styles.checkboxSquareChecked]}>
                    {agreeTerms && <Check size={12} color="#FAF6EE" />}
                  </View>
                  <Text style={styles.termsCheckboxText}>
                    I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>, and confirm I am 16 years of age or older.
                  </Text>
                </TouchableOpacity>

                {/* Step 1 Continue Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleStep1Continue}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>Continue to Delivery & Safety</Text>
                  <ArrowRight size={16} color="#FAF6EE" />
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: Delivery & Emergency Protection */}
            {signUpStep === 2 && (
              <>
                <View style={styles.stepHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepBadge}>STEP 2 OF 2</Text>
                    <Text style={styles.cardTitle}>Delivery & Safety Guardian</Text>
                  </View>
                </View>
                <Text style={styles.cardSubtitle}>
                  Used for boutique hardware delivery and emergency hardware SOS distress relays.
                </Text>

                {/* Shipping Address */}
                <View style={styles.inputGroup}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={styles.inputLabel}>Residence & Shipping Address</Text>
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
                  <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 10 }]}>
                    <MapPin size={18} color={Colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                      placeholder="Street, Suite / Apt, City, Postal Code"
                      placeholderTextColor={Colors.textTertiary}
                      value={shippingAddress}
                      onChangeText={setShippingAddress}
                      multiline
                    />
                  </View>
                </View>

                {/* Emergency Guardian Section */}
                <View style={styles.guardianSectionHeader}>
                  <Shield size={16} color={Colors.primary} />
                  <Text style={styles.guardianSectionTitle}>Emergency SOS Guardian Relay</Text>
                </View>

                {/* Guardian Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Guardian Contact Name</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color={Colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Aria Sterling"
                      placeholderTextColor={Colors.textTertiary}
                      value={guardianName}
                      onChangeText={setGuardianName}
                    />
                  </View>
                </View>

                {/* Guardian Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Guardian Phone Relay</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={18} color={Colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="+1 (555) 902-3341"
                      placeholderTextColor={Colors.textTertiary}
                      value={guardianPhone}
                      onChangeText={setGuardianPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Guardian Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Guardian Email Relay</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color={Colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="guardian.sentia@gmail.com"
                      placeholderTextColor={Colors.textTertiary}
                      value={guardianEmail}
                      onChangeText={setGuardianEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Complete Registration Action */}
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={() => handleCompleteSignUp(false)}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FAF6EE" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Complete & Meet Senti</Text>
                      <Sparkles size={16} color="#FAF6EE" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Navigation Controls: Skip & Back */}
                <View style={styles.step2FooterRow}>
                  <TouchableOpacity
                    style={styles.backStepButton}
                    onPress={() => setSignUpStep(1)}
                    activeOpacity={0.8}
                  >
                    <ArrowLeft size={14} color={Colors.textSecondary} />
                    <Text style={styles.backStepText}>Back to Step 1</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => handleCompleteSignUp(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.skipButtonText}>Skip & Finish in Settings</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <CountryCodePickerModal
        visible={showCountryPicker}
        selectedCode={selectedDialCode}
        onSelect={(item) => {
          setSelectedDialCode(item.code);
          setSelectedCountryIso(item.iso);
        }}
        onClose={() => setShowCountryPicker(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  brandLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F5EFE0',
    borderRadius: BorderRadius.pill,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    ...Shadows.subtle,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FAF6EE',
  },
  card: {
    backgroundColor: Colors.canvasElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    ...Shadows.card,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputHelpText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
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
    borderRadius: BorderRadius.md,
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
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
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
  salutationChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  salutationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    backgroundColor: Colors.canvas,
  },
  salutationChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  salutationChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  salutationChipTextSelected: {
    color: '#FAF6EE',
  },
  guardianSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  guardianSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.pill,
    marginTop: Spacing.sm,
    ...Shadows.subtle,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FAF6EE',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    paddingHorizontal: 10,
    letterSpacing: 0.8,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E7',
    borderWidth: 1.5,
    borderColor: '#EEDCC0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 12,
  },
  demoIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF6EE',
    borderWidth: 1,
    borderColor: '#EEDCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  demoSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  step2FooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  backStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  backStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  skipButton: {
    padding: 6,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  termsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.canvasElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxSquareChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsCheckboxText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
