import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
} from 'react-native';
import { X, Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Trash2, Waves } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { SentiChatMessage, SentiMood } from '../types';
import { SentiAvatars } from '../assets/mascotMap';
import { askSenti } from '../services/sentiAI';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCircle } from '../context/CircleContext';
import {
  speakSenti,
  stopSentiSpeech,
  toggleSentiVoiceMute,
  isVoiceMuted,
} from '../services/voiceService';

interface SentiChatModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateAction?: (route: string) => void;
  initialMode?: 'text' | 'voice';
}

const normalizeRoute = (rawRoute: string): string => {
  const clean = rawRoute.replace(/^\//, '').toLowerCase().trim();
  if (clean === 'profile') return 'settings';
  if (clean === 'support') return 'settings';
  if (clean === 'vitality') return 'cycle';
  if (clean === 'home') return 'dashboard';
  return clean;
};

const QUICK_PROMPTS = [
  'How do I change my name?',
  'What does the shield button do?',
  'Check bag battery status',
  'How does cycle packing work?',
];

export const SentiChatModal: React.FC<SentiChatModalProps> = ({
  visible,
  onClose,
  onNavigateAction,
  initialMode = 'text',
}) => {
  const insets = useSafeAreaInsets();
  const { sentiMessages, addSentiMessage, clearSentiMessages } = useCircle();
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [headerMood, setHeaderMood] = useState<SentiMood>('01_happy');
  const [voiceMuted, setVoiceMuted] = useState(isVoiceMuted());
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setHeaderMood('09_curious');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      if (initialMode === 'voice') {
        startVoiceSession();
      }
    } else {
      stopVoiceSession();
      stopSentiSpeech();
    }
  }, [visible, initialMode]);

  const handleModalClose = () => {
    stopVoiceSession();
    stopSentiSpeech();
    onClose();
  };

  const handleClearChat = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    stopVoiceSession();
    stopSentiSpeech();
    clearSentiMessages();
    setHeaderMood('01_happy');
  };

  const startVoiceSession = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    stopSentiSpeech();
    setIsVoiceMode(true);
    setHeaderMood('09_curious');
    setVoiceTranscript('Listening... Speak naturally to Senti');

    if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    voiceTimerRef.current = setTimeout(() => {
      const naturalVoiceQueries = [
        'How is my smart pack battery and hardware status?',
        'What should I pack for tomorrow based on the weather forecast?',
        'Can you check my lumbar heat and hydration settings?',
        'Give me a quick briefing on my social circle and gear.',
      ];
      const selectedQuery = naturalVoiceQueries[Math.floor(Math.random() * naturalVoiceQueries.length)];
      setVoiceTranscript(`"${selectedQuery}"`);
      setTimeout(() => {
        handleSendMessage(selectedQuery);
        setVoiceTranscript('');
      }, 900);
    }, 2800);
  };

  const stopVoiceSession = () => {
    if (voiceTimerRef.current) {
      clearTimeout(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    setIsVoiceMode(false);
    setVoiceTranscript('');
    stopSentiSpeech();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      stopVoiceSession();
    } else {
      startVoiceSession();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const userMsg: SentiChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      mood: '01_happy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addSentiMessage(userMsg);
    setInputText('');
    setIsThinking(true);
    setHeaderMood('10_thinking');

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await askSenti(query);

      const sentiMsg: SentiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'senti',
        text: response.text,
        mood: response.mood,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: response.suggestedAction,
      };

      addSentiMessage(sentiMsg);
      setHeaderMood(response.mood);

      // Senti speaks response aloud if voice enabled
      if (!voiceMuted) {
        speakSenti(response.text);
      }
    } catch {
      const errorMsg: SentiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'senti',
        text: "I'm right here with you! If you ever need a hand with bag settings, check your dashboard.",
        mood: '12_confused',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addSentiMessage(errorMsg);
      setHeaderMood('12_confused');
    } finally {
      setIsThinking(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessageItem = ({ item }: { item: SentiChatMessage }) => {
    const isSenti = item.sender === 'senti';

    return (
      <View
        style={[
          styles.messageRow,
          isSenti ? styles.sentiMessageRow : styles.userMessageRow,
        ]}
      >
        {isSenti && (
          <Image
            source={SentiAvatars[item.mood] || SentiAvatars['01_happy']}
            style={styles.messageAvatar}
            resizeMode="contain"
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isSenti ? styles.sentiBubble : styles.userBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isSenti ? styles.sentiText : styles.userText,
            ]}
          >
            {item.text}
          </Text>

          {item.suggestedAction && onNavigateAction && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (item.suggestedAction?.route) {
                  onClose();
                  onNavigateAction(normalizeRoute(item.suggestedAction.route));
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>
                {item.suggestedAction.label} →
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.timestampText}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.scrimDismiss} onPress={handleModalClose} />
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerLeft}>
              <Image
                source={SentiAvatars[headerMood] || SentiAvatars['01_happy']}
                style={styles.headerAvatar}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.headerTitle}>Senti</Text>
                <Text style={styles.headerSubtitle}>
                  {isThinking ? 'Thinking...' : 'Your Living Bag Companion'}
                </Text>
              </View>
            </View>
            <View style={styles.headerRightActions}>
              {/* Clear Chat Button */}
              <TouchableOpacity
                onPress={handleClearChat}
                style={styles.voiceToggleBtn}
                accessibilityLabel="Clear Senti Chat History"
              >
                <Trash2 size={16} color={Colors.textTertiary} />
              </TouchableOpacity>

              {/* Voice Output Mute Toggle */}
              <TouchableOpacity
                onPress={() => {
                  const next = toggleSentiVoiceMute();
                  setVoiceMuted(next);
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                }}
                style={styles.voiceToggleBtn}
                accessibilityLabel="Toggle Senti Voice Output"
              >
                {voiceMuted ? (
                  <VolumeX size={18} color={Colors.textTertiary} />
                ) : (
                  <Volume2 size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleModalClose}
                style={styles.closeButton}
                accessibilityLabel="Close Senti Assistant"
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Prompts Bar */}
          <View style={styles.quickPromptsContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={QUICK_PROMPTS}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => handleSendMessage(item)}
                >
                  <Sparkles size={12} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            />
          </View>

          {/* Messages Area */}
          <FlatList
            ref={flatListRef}
            data={sentiMessages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />

          {/* Hands-Free Voice Assistant Active Banner */}
          {isVoiceMode && (
            <View style={styles.voiceWaveContainer}>
              <View style={styles.voiceWaveHeader}>
                <View style={styles.voiceLiveBadge}>
                  <View style={styles.voiceLiveDot} />
                  <Text style={styles.voiceLiveText}>HANDS-FREE DUPLEX VOICE</Text>
                </View>
                <TouchableOpacity onPress={stopVoiceSession} style={styles.exitVoiceBtn}>
                  <Text style={styles.exitVoiceText}>End Voice</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.voiceTranscriptText}>{voiceTranscript || 'Listening... Speak naturally'}</Text>

              <View style={styles.waveformBarsRow}>
                {[14, 28, 42, 24, 38, 50, 32, 20, 44, 26, 16].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      { height: h, backgroundColor: i % 2 === 0 ? Colors.primary : Colors.cognacAmber },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Input Bar with 1-Tap Voice Toggle */}
          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            {/* 1-Tap Duplex Voice Chat Button */}
            <TouchableOpacity
              style={[styles.pushToTalkButton, isVoiceMode && styles.pushToTalkButtonActive]}
              onPress={toggleVoiceMode}
              activeOpacity={0.8}
              accessibilityLabel={isVoiceMode ? 'Exit Hands-Free Voice Chat' : 'Start Hands-Free Voice Chat'}
            >
              {isVoiceMode ? (
                <MicOff size={18} color="#FAF6EE" />
              ) : (
                <Mic size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder={isVoiceMode ? 'Voice active... Tap mic to end' : 'Ask Senti or tap mic for voice...'}
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              returnKeyType="send"
              onSubmitEditing={() => handleSendMessage()}
              editable={!isVoiceMode}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? Colors.primary : Colors.primaryMuted },
              ]}
              disabled={!inputText.trim() || isThinking || isVoiceMode}
              onPress={() => handleSendMessage()}
            >
              {isThinking ? (
                <ActivityIndicator size="small" color="#FAF6EE" />
              ) : (
                <Send size={18} color="#FAF6EE" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 26, 0.45)',
    justifyContent: 'flex-end',
  },
  scrimDismiss: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '84%',
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    overflow: 'hidden',
    ...Shadows.floating,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPromptsContainer: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.canvasWarm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardAccentBorder,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
  },
  chipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  sentiMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Shadows.subtle,
  },
  sentiBubble: {
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sentiText: {
    color: Colors.textPrimary,
  },
  userText: {
    color: Colors.textInverse,
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.cardAccent,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  timestampText: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.canvasElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.cardAccentBorder,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.canvas,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.canvasElevated,
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pushToTalkButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FAF3E7',
    borderWidth: 1.5,
    borderColor: '#EEDCC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    ...Shadows.subtle,
  },
  pushToTalkButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  voiceWaveContainer: {
    backgroundColor: '#FAF3E7',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#EEDCC0',
    alignItems: 'center',
  },
  voiceWaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  voiceLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  voiceLiveText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.primary,
  },
  exitVoiceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.canvasWarm,
    borderWidth: 1,
    borderColor: '#EEDCC0',
  },
  exitVoiceText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  voiceTranscriptText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginVertical: 8,
    fontStyle: 'italic',
  },
  waveformBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 36,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
});
