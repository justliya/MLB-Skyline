import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import EventSource from 'react-native-sse';

interface Game {
  visteam: string;
  gid: string;
  hometeam: string;
}

interface ChatScreenProps {
  game: Game;
  chatMode: string;
  interval: number;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ game, chatMode, interval }) => {
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const startChat = () => {
    if (!game || !game.gid || !chatMode) {
      setError('Game ID and mode are required to start the chat.');
      return;
    }

    setLoading(true);
    setError(null);
    setChatContent([]);
    setIsPaused(false);

    const url = `https://replay-114778801742.us-central1.run.app/game-replay?gid=${game.gid}&mode=${chatMode}&user_id=chip&interval=${interval}`;
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ gid: game.gid, mode: chatMode, interval, user_id: 'chip' });

    const es = new EventSource(url, { headers, body, method: 'POST' });

    setEventSource(es);

    es.addEventListener('message', (event) => {
      console.log('Received Message:', event.data);
      setChatContent((prev) => [...prev, event.data as string]);
    });

    es.addEventListener('error', (event) => {
      console.error('SSE Error:', event);
      setError('Error receiving data. Please try again.');
      setLoading(false);
      es.close();
    });

    es.addEventListener('open', () => {
      console.log('Connection opened.');
      setLoading(false);
    });
  };

  const pauseChat = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsPaused(true);
      console.log('Chat paused.');
    }
  };

  const resumeChat = () => {
    setIsPaused(false);
    startChat();
    console.log('Chat resumed.');
  };

  const closeConnection = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      Alert.alert('Connection closed.');
    }
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('EventSource connection closed.');
      }
    };
  }, [eventSource]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Chat</Text>
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView style={styles.chatBox}>
        {chatContent.map((message, index) => (
          <Text key={index} style={styles.message}>
            {index + 1}. {message}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.controls}>
        {!eventSource && <Button title="Start Chat" onPress={startChat} />}
        {eventSource && !isPaused && <Button title="Pause Chat" onPress={pauseChat} />}
        {isPaused && <Button title="Resume Chat" onPress={resumeChat} />}
        <Button title="Close Connection" onPress={closeConnection} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, marginBottom: 16 },
  chatBox: { flex: 1, marginVertical: 16 },
  message: { marginBottom: 8, fontSize: 16 },
  error: { color: 'red', marginBottom: 16 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
});

export default ChatScreen;
