import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import EventSource from 'react-native-sse';
import LottieView from 'lottie-react-native';
import MessageBox from '../../components/MessageBox';
import Sound from 'react-native-sound';
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
      const response = await fetch('https://cloud-speech-114778801742.us-central1.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio, status: ${response.status} message: ${response.statusText}`);
      }

      const { audioUrl } = await response.json();

      const sound = new Sound(audioUrl, null, (error) => {
        if (error) {
          console.error('Error loading sound:', error);
          return;
        }
        sound.play((success) => {
          if (!success) {
            console.error('Playback failed due to audio decoding errors');
          }
          sound.release();
        });
      });
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
       <Text style={styles.subHeader}>
        {`Game: ${game.hometeam} vs ${game.visteam} | Interval: ${interval}s`}
      </Text>
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
            style={styles.message}
            message={message}
            onSpeak={() => handleSpeak(message)}
          />
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lottie: { width: 200, height: 200 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#000' },
});

export default ChatScreen;