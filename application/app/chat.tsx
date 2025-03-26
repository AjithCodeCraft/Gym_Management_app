import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useState, useCallback } from 'react';
// import ChatBubble from './components/ChatBubble';
// import ChatInput from './components/ChatInput';
// import ChatHeader from './components/ChatHeader';
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey there! How can I help you with your fitness goals today?',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '2',
      text: "I'm looking for a new workout routine",
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
  ]);

  const handleSend = useCallback((text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      sender: 'me',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader title="Fitness Coach" />
      
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatBubble 
            message={item.text} 
            isMe={item.sender === 'me'} 
            time={item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
        )}
        contentContainerStyle={styles.listContent}
        inverted={messages.length > 0}
      />
      
      <ChatInput onSend={handleSend} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
});