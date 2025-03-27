import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ChatBubbleProps = {
  message: string;
  isMe: boolean;
  time: string;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMe, time }) => {
  return (
    <View style={[styles.bubble, isMe ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.messageText}>{message}</Text>
      <Text style={styles.timeText}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
    color: 'gray',
    alignSelf: 'flex-end',
  },
});

export default ChatBubble;
