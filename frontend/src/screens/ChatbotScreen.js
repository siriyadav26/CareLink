import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { chatbotAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

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
    } catch (error) {
      const errorMessage = { id: (Date.now() + 1).toString(), text: "I'm sorry, I'm having trouble responding. Please try again.", sender: 'bot' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.botRow]}>
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble, { backgroundColor: item.sender === 'user' ? theme.secondary : theme.surface }]}>
        <Text style={[styles.messageText, { color: item.sender === 'user' ? theme.background : theme.text, fontSize }]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.textSecondary }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, fontSize }]}
          placeholder="Type your message..."
          placeholderTextColor={theme.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          accessibilityLabel="Chat input"
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: loading ? '#ccc' : theme.secondary }]}
          onPress={sendMessage}
          disabled={loading || !inputText.trim()}
        >
          {loading ? <ActivityIndicator color={theme.background} /> : <Ionicons name="send" size={24} color={theme.background} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesList: { padding: 20, paddingBottom: 10 },
  messageRow: { marginBottom: 15 },
  userRow: { alignItems: 'flex-end' },
  botRow: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 5 },
  botBubble: { borderBottomLeftRadius: 5 },
  messageText: { fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});