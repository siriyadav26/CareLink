import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { chatbotAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#f0edf6',
  surface: '#ece8f3',
  raised: '#f7f4fc',
  orchid: '#9b72cf',
  lavender: '#b39ddb',
  iris: '#7c6bc4',
  lilac: '#d1c4e9',
  lilacDeep: '#c5aee8',
  textPrimary: '#3d2c6e',
  textSecondary: '#8b7ab8',
  shadow: '#c8c0dc',
  highlight: '#ffffff',
};

const neu = (depth = 6) => ({
  shadowColor: COLORS.shadow,
  shadowOffset: { width: depth, height: depth },
  shadowOpacity: 0.5,
  shadowRadius: depth * 1.5,
  elevation: depth,
});

const neuInset = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: -3, height: -3 },
  shadowOpacity: 0.4,
  shadowRadius: 6,
  elevation: 0,
};

export default function ChatbotScreen() {
  const { theme, fontSize, speak } = useAccessibility();
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm your AI healthcare assistant. How can I help you today?", sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    speak(inputText);
    try {
      const response = await chatbotAPI.sendMessage(inputText);
      const botMessage = { id: (Date.now() + 1).toString(), text: response.data.reply, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
      speak(response.data.reply);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding. Please try again.",
        sender: 'bot',
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.botRow]}>
      {item.sender === 'bot' && (
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={14} color={COLORS.orchid} />
          </View>
        </View>
      )}
      <View style={[
        styles.bubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble,
      ]}>
        <Text style={[
          styles.bubbleText,
          { fontSize, color: item.sender === 'user' ? COLORS.highlight : COLORS.textPrimary }
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="medical" size={20} color={COLORS.orchid} />
        </View>
        <View>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSub}>Always here to help</Text>
        </View>
        <View style={[styles.onlineDot]} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.typingBubble}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.2 }]} />
            ))}
          </View>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, { fontSize }]}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            accessibilityLabel="Chat input"
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading || !inputText.trim()}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color={COLORS.highlight} size="small" />
            : <Ionicons name="arrow-up" size={22} color={COLORS.highlight} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lilac,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...neu(4),
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  onlineDot: {
    marginLeft: 'auto',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#a8e6cf',
    borderWidth: 2,
    borderColor: COLORS.bg,
  },

  messagesList: { padding: 20, paddingBottom: 8 },
  messageRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },

  avatarWrap: { marginRight: 8 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lilac,
    justifyContent: 'center',
    alignItems: 'center',
    ...neu(3),
  },

  bubble: { maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: {
    backgroundColor: COLORS.iris,
    borderBottomRightRadius: 4,
    ...neu(4),
  },
  botBubble: {
    backgroundColor: COLORS.raised,
    borderBottomLeftRadius: 4,
    ...neu(4),
  },
  bubbleText: { lineHeight: 22, fontWeight: '500' },

  typingRow: { paddingHorizontal: 24, paddingBottom: 8, flexDirection: 'row' },
  typingBubble: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: COLORS.raised,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    ...neu(3),
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.orchid,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: COLORS.bg,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lilac,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...neu(3),
  },
  input: {
    color: COLORS.textPrimary,
    maxHeight: 100,
    lineHeight: 22,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.iris,
    justifyContent: 'center',
    alignItems: 'center',
    ...neu(5),
  },
  sendBtnDisabled: { backgroundColor: COLORS.lavender, opacity: 0.6 },
});