/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-catch-shadow */
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import EventSource from 'react-native-sse';
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound';
import { SvgUri } from 'react-native-svg';
import MessageBox from '../../components/MessageBox';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialTopTabParamList, BottomTabParamList, RootStackParamList } from '../../navigation/AppNavigator';
import { CompositeScreenProps } from '@react-navigation/native';
import { useAuth } from '../../hooks/AuthProvider'; // Import Auth Context

// Define ChatScreen Props
type ChatScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<MaterialTopTabParamList, 'Chat'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList>,
    StackScreenProps<RootStackParamList>
  >
>;


const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {

  const [chatMode, setChatMode] = useState<string>(''); // Chat mode state
  const [interval, setInterval] = useState<number>(10); // Default interval
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { user } = useAuth();
  const userId = user?.uid || 'Guest';

  const { game, hometeam, visteam } = route.params ?? {}; // Get game data from params

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  if (!game || !hometeam || !visteam ) {
    return <Text style={styles.error}>Error: Missing game data.</Text>;
  }

  const getTeamLogoUrl = (teamCode: number) => {
    return `https://www.mlbstatic.com/team-logos/${teamCode}.svg`;
  };
  const startChat = () => {
    if (!chatMode) {
      Alert.alert('Error', 'Please select a chat mode before starting.');
      return;
    }

    setLoading(true);
    setError(null);
    setChatContent([]);
    setIsPaused(false);

    const url = `https://replay-114778801742.us-central1.run.app/game-replay?gid=${game}&mode=${chatMode}&user_id=${userId}&interval=${interval}`;
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ gid: game, mode: chatMode, interval, user_id: userId });

    const es = new EventSource(url, { headers, body, method: 'POST' });

    setEventSource(es);

    es.addEventListener('message', (event) => {
      setChatContent((prev) => [...prev, event.data as string]);
    });

    es.addEventListener('error', (event) => {
      console.error('SSE Error:', event);
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
    }
  };

  const resumeChat = () => {
    setIsPaused(false);
    startChat();
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

      const sound = new Sound(audioUrl, (error) => {
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
  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Chat</Text>
      <View style={styles.teamInfo}>
        <SvgUri
          uri={getTeamLogoUrl(visteam)}
          width={50}
          height={50}
          style={styles.teamLogo}
          onError={(error) => console.error('Failed to load visitor team logo:', error)}
        />
        <Text style={styles.vsText}>vs</Text>
        <SvgUri
          uri={getTeamLogoUrl(hometeam)}
          width={50}
          height={50}
          style={styles.teamLogo}
          onError={(error) => console.error('Failed to load home team logo:', error)}
        />
      </View>
      <Text style={styles.subHeader}>
        {`Game: ${hometeam} vs ${visteam}`}
      </Text>

      {/* Chat Mode Selection */}
      <Text style={styles.modePrompt}>Select Chat Mode:</Text>
      <View style={styles.modeButtons}>
        <Button
          title="Casual"
          onPress={() => setChatMode('casual')}
          color={chatMode === 'casual' ? '#007AFF' : '#CCC'}
        />
        <Button
          title="Technical"
          onPress={() => setChatMode('technical')}
          color={chatMode === 'technical' ? '#007AFF' : '#CCC'}
        />
      </View>
     {/* Interval Selection */}
     <Text style={styles.modePrompt}>Select Interval:</Text>
      <View style={styles.modeButtons}>
        <Button title="10s" onPress={() => setInterval(10)} color={interval === 10 ? '#34C759' : '#CCC'} />
        <Button title="20s" onPress={() => setInterval(20)} color={interval === 20 ? '#34C759' : '#CCC'} />
        <Button title="30s" onPress={() => setInterval(30)} color={interval === 30 ? '#34C759' : '#CCC'} />
      </View>

      {/* Start Chat Button */}
      {!eventSource && (
        <Button
          title="Start Chat"
          onPress={startChat}
          color="#007AFF"
          disabled={!chatMode} // Disable if no chat mode selected
        />
      )}

      {/* Chat Messages */}
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
          <MessageBox key={index} message={message}
          onSpeak={() => handleSpeak(message)}
          />
        ))}
      </ScrollView>

      {/* Chat Controls */}
      {eventSource && (
        <View style={styles.controls}>
          {!isPaused && <Button title="Pause Chat" onPress={pauseChat} color="#FF9500" />}
          {isPaused && <Button title="Resume Chat" onPress={resumeChat} color="#34C759" />}
          <Button title="Close Chat" onPress={closeConnection} color="#FF3B30" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0D1728' },
  header: { fontSize: 24, color: '#FFF', marginBottom: 10 },
  subHeader: { fontSize: 16, color: '#CCC', marginBottom: 16 },
  teamInfo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  vsText: { fontSize: 18, color: '#FFF', marginHorizontal: 10 },
  teamLogo: { marginHorizontal: 10 },
  modePrompt: { fontSize: 18, color: '#FFF', marginBottom: 10 },
  modeButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lottie: { width: 200, height: 200 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#FFF' },
  chatBox: { flex: 1, marginVertical: 16 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  error: { color: 'red', marginBottom: 16 },
});

export default ChatScreen;
