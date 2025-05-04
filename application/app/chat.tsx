import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import { apiAuth } from '@/api/axios';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);

  useEffect(() => {
    const fetchIds = async () => {
      try {
        const trainerId = await AsyncStorage.getItem('trainer_id');
        const userId = await AsyncStorage.getItem('id');
        setTrainerId(trainerId);
        setUserId(userId);
      } catch (error) {
        console.log('Error fetching IDs:', error);
      } finally {
        setLoading(false); // Stop loading once IDs are fetched
      }
    };

    fetchIds();
  }, []);

  useEffect(() => {
    if (trainerId && userId && !initialFetchComplete) {
      const fetchMessages = async () => {
        setLoading(true); // Start loading only for the initial fetch
        try {
          const response = await apiAuth.get(`chat/trainer/${trainerId}/`);
          const fetchedMessages = response.data;


          if (Array.isArray(fetchedMessages)) {
            // Assuming the API returns messages in the correct format
            const formattedMessages: Message[] = fetchedMessages.map((msg: any) => ({
              id: msg.id.toString(),
              text: msg.message,
              sender: msg.sender.toString() === userId ? 'me' : 'other',
              timestamp: new Date(msg.timestamp),
              status: 'sent', // Mark fetched messages as sent
            }));

            // Sort messages by timestamp in descending order (latest to oldest)
            formattedMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setMessages(formattedMessages);
          } else {
            console.log('Fetched messages is not an array:', fetchedMessages);
          }
        } catch (error) {
          console.log('Error fetching messages:', error);
        } finally {
          setLoading(false); // Stop loading once messages are fetched
          setInitialFetchComplete(true); // Mark initial fetch as complete
        }
      };

      fetchMessages();

      // Set up polling to fetch new messages every 3 seconds
      const intervalId = setInterval(() => {
        fetchMessages().catch(console.log); // Handle errors in background fetch
      }, 3000);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [trainerId, userId, initialFetchComplete]);

  const handleSend = useCallback(async (text: string) => {
    if (userId && trainerId) {
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text,
        sender: 'me',
        timestamp: new Date(),
        status: 'sending', // Mark message as sending
      };
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        // Sort messages by timestamp in descending order (latest to oldest)
        updatedMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return updatedMessages;
      });

      // Send the message to the server
      try {
        await apiAuth.post('messages/send/', {
          sender_id: userId,
          receiver_id: trainerId,
          message: text,
        });

        // Update message status to sent
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
          )
        );
      } catch (error) {
        console.log('Error sending message:', error);

        // Update message status to failed
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'failed' } : msg
          )
        );
      }
    }
  }, [trainerId, userId]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader title="Fitness Coach" />

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <ChatBubble
              message={item.text}
              isMe={item.sender === 'me'}
              time={item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
            {item.status === 'sending' && (
              <ActivityIndicator size="small" color="#9ca3af" style={styles.sendingIndicator} />
            )}
            {item.status === 'failed' && (
              <Text style={styles.failedText}>Failed to send</Text>
            )}
          </View>
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
  messageContainer: {
    position: 'relative',
  },
  sendingIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  failedText: {
    color: 'red',
    fontSize: 10,
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
