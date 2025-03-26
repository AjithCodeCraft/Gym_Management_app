import { View, Text, StyleSheet } from 'react-native';

interface ChatBubbleProps {
  message: string;
  isMe: boolean;
  time: string;
}

export default function ChatBubble({ message, isMe, time }: ChatBubbleProps) {
  return (
    <View style={[styles.container, isMe ? styles.me : styles.other]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={isMe ? styles.textMe : styles.textOther}>{message}</Text>
        <Text style={[styles.time, isMe ? styles.timeMe : styles.timeOther]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  me: {
    alignItems: 'flex-end',
  },
  other: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: '#f97316',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  textMe: {
    color: 'white',
  },
  textOther: {
    color: '#1f2937',
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  timeMe: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  timeOther: {
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'left',
  },
});