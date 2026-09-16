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
} from 'react-native';
import { X, Send, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, Spacing, BorderRadius } from '../theme/tokens';
import { SentiChatMessage, SentiMood } from '../types';
import { SentiAvatars } from '../assets/mascotMap';
import { askSenti } from '../services/sentiAI';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SentiChatModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateAction?: (route: string) => void;
}

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
}) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<SentiChatMessage[]>([
    {
      id: 'welcome',
      sender: 'senti',
      text: "Hey there! I'm Senti, your bag's companion. What's on your mind today?",
      mood: '01_happy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [headerMood, setHeaderMood] = useState<SentiMood>('01_happy');

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setHeaderMood('09_curious');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [visible]);

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

    setMessages((prev) => [...prev, userMsg]);
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

      setMessages((prev) => [...prev, sentiMsg]);
      setHeaderMood(response.mood);
    } catch {
      const errorMsg: SentiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'senti',
        text: "I'm having a little trouble connecting, but you can always find bag settings right on your dashboard!",
        mood: '12_confused',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
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
                  onNavigateAction(item.suggestedAction.route);
                }
              }}
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
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
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close Senti Assistant"
            >
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
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
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />

          {/* Input Bar with Dynamic Safe Bottom Clearance */}
          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Senti anything about your bag..."
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              returnKeyType="send"
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? Colors.primary : Colors.primaryMuted },
              ]}
              disabled={!inputText.trim() || isThinking}
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
    backgroundColor: 'rgba(15, 31, 26, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    minHeight: '65%',
    borderWidth: 1,
    borderColor: Colors.cardAccentBorder,
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
});
