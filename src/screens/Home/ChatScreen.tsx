import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import EventSource from 'react-native-sse';
import { useChat } from '../../context/ChatContext';

const ChatScreen: React.FC = () => {
  const { selectedGame, chatMode, interval } = useChat();
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const startChat = () => {
    if (!selectedGame || !selectedGame.gid || !chatMode) {
      setError('Game ID and mode are required to start the chat.');
      return;
    }

    setLoading(true);
    setError(null);
    setChatContent([]);
    setIsPaused(false);

    const url = `https://replay-114778801742.us-central1.run.app/game-replay?gid=${selectedGame.gid}&mode=${chatMode}&user_id=chip&interval=${interval}`;
    const newEventSource = new EventSource(url);

    newEventSource.addEventListener('message', (event) => {
      console.log('Received Message:', event.data);
      setChatContent((prev) => [...prev, event.data]);
    });

    newEventSource.addEventListener('error', (event) => {
      console.error('SSE Error:', event);
      setError('Error receiving data. Please try again.');
      setLoading(false);
      newEventSource.close();
    });

    newEventSource.addEventListener('open', () => {
      console.log('Connection opened.');
      setLoading(false);
    });

    setEventSource(newEventSource);
  };

  const pauseChat = async () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsPaused(true);

      try {
        await fetch('https://replay-114778801742.us-central1.run.app/pause', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gid: selectedGame?.gid,
            mode: chatMode,
            user_id: 'chip',
            interval,
          }),
        });
        console.log('Chat paused.');
      } catch (err) {
        console.error('Error pausing chat:', err);
        setError('Error pausing chat.');
      }
    }
  };

  const resumeChat = async () => {
    if (!selectedGame || !selectedGame.gid || !chatMode) {
      setError('Game ID and mode are required to resume the chat.');
      return;
    }

    setIsPaused(false);
    setLoading(true);

    try {
      await fetch('https://replay-114778801742.us-central1.run.app/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gid: selectedGame.gid,
          mode: chatMode,
          user_id: 'chip',
          interval,
        }),
      });
      console.log('Chat resumed.');
      startChat();
    } catch (err) {
      console.error('Error resuming chat:', err);
      setError('Error resuming chat.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventSource) {
      const timeout = setTimeout(() => {
        eventSource.close();
        console.log('Connection closed after timeout.');
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [eventSource]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Chat</Text>
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView style={styles.chatBox}>
        {chatContent.map((message, index) => (
          <Text key={index} style={styles.message}>
            {message}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.controls}>
        {!eventSource && <Button title="Start Chat" onPress={startChat} />}
        {eventSource && !isPaused && <Button title="Pause Chat" onPress={pauseChat} />}
        {isPaused && <Button title="Resume Chat" onPress={resumeChat} />}
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
