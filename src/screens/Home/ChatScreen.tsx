import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import EventSource from 'react-native-sse';
import LottieView from 'lottie-react-native';
import { useChat } from '../../context/ChatContext';
import MessageBox from '../../components/MessageBox';

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
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ gid: selectedGame.gid, mode: chatMode, interval, user_id: 'chip' });

    const es = new EventSource(url, { headers, body, method: 'POST' });

    setEventSource(es);

    es.addEventListener('message', (event) => {
      console.log('Received Message:', event.data);
      setChatContent((prev) => [...prev, event.data]);
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

  const handleSpeak = async (message: string) => {
    try {
      const convertTextToSpeech = httpsCallable(functions, 'convertTextToSpeech');
      const response = await convertTextToSpeech({ text: message });
      const audioUrl = response.data.audioUrl;
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error converting text to speech:', error);
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
      {loading && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={{ uri: 'https://lottie.host/7021d99d-c876-446a-8da1-6526261ff2d5/wMKc48xEek.json' }}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView style={styles.chatBox}>
        {chatContent.map((message, index) => (
          <MessageBox
            key={index}
            message={message}
            onSpeak={() => handleSpeak(message)}
          />
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lottie: { width: 200, height: 200 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#000' },
});

export default ChatScreen;
