import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import EventSource from 'react-native-sse';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/AuthProvider'; // ✅ Import Auth Context

interface Game {
  visteam: string;
  gid: string;
  hometeam: string;
}

// ✅ Define ChatScreen Props to Expect Params
type ChatScreenProps = StackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { user } = useAuth(); // ✅ Get user from Auth Context

  // ✅ Extract game, chatMode, and interval from navigation params
  const { game, chatMode, interval } = route.params ?? {};
  const userId = user?.uid || 'Guest'; // ✅ Fallback for guests

  if (!game || !chatMode || !interval) {
    return <Text style={styles.error}>Error: Missing required parameters.</Text>;
  }

  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const startChat = () => {
    setLoading(true);
    setError(null);
    setChatContent([]);
    setIsPaused(false);

    const url = `https://replay-114778801742.us-central1.run.app/game-replay?gid=${game.gid}&mode=${chatMode}&user_id=${userId}&interval=${interval}`;
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ gid: game.gid, mode: chatMode, interval, user_id: userId });

    const es = new EventSource(url, { headers, body, method: 'POST' });

    setEventSource(es);

    es.addEventListener('message', (event) => {
      setChatContent((prev) => [...prev, event.data as string]);
    });

    es.addEventListener('error', (event) => {
      setError('Error receiving data. Please try again.');
      setLoading(false);
      es.close();
    });

    es.addEventListener('open', () => {
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Chat</Text>
      <Text style={styles.subHeader}>
        {`Game: ${game.hometeam} vs ${game.visteam} | Interval: ${interval}s`}
      </Text>
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView style={styles.chatBox}>
        {chatContent.map((message, index) => (
          <Text key={index} style={styles.message}>{`${index + 1}. ${message}`}</Text>
        ))}
      </ScrollView>
      <View style={styles.controls}>
        {!eventSource && <Button title="Start Chat" onPress={startChat} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0D1728' },
  header: { fontSize: 24, color: '#FFF', marginBottom: 10 },
  subHeader: { fontSize: 16, color: '#CCC', marginBottom: 16 },
  chatBox: { flex: 1, marginVertical: 16 },
  message: { marginBottom: 8, fontSize: 16, color: '#FFF' },
  error: { color: 'red', marginBottom: 16 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
});

export default ChatScreen;