import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import EventSource from 'react-native-sse';
interface Game {
  batteam: string;
  gid: string;
  pitteam: string;
}

const HomeScreen: React.FC = () => {
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const startOrResetChat = () => {
    const url = 'https://replay-114778801742.us-central1.run.app/game-replay';
    const body = JSON.stringify({
      gid: 'ANA202304070',
      mode: 'casual',
      user_id: 'testy2',
      interval: 20,
    });
    handleEventSource(url, body);
  };

  const pauseChat = async () => {
    try {
      const response = await fetch(
        'https://replay-114778801742.us-central1.run.app/pause',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gid: 'ANA202304070',
            user_id: 'testy2',
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to pause the chat');
      setEventSource(null); // Close the connection on pause
    } catch (err) {
      console.error((err as Error).message);
    }
  };

  const resumeChat = async () => {
    try {
      const response = await fetch(
        'https://replay-114778801742.us-central1.run.app/resume',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 'testy2' }),
        }
      );
      if (!response.ok) throw new Error('Failed to resume the chat');
      startOrResetChat(); // Restart the event source connection
    } catch (err) {
      console.error((err as Error).message);
    }
  };

  const fetchRecentGames = async () => {
    try {
      const response = await fetch(
        'https://get-recent-games-114778801742.us-central1.run.app/getLastTenGames'
      );
      const data: Game[] = await response.json();
      setRecentGames(data);
    } catch (err) {
      console.error('Error fetching recent games:', (err as Error).message);
    }
  };

  const handleEventSource = (url: string, body: string) => {
    setLoading(true);
    setError(null);
    setChatContent([]);

    const source = new EventSource(url, {
      headers: { 'Content-Type': 'application/json' },
      body,
      method: 'POST',
    });

    source.addEventListener('message', (event: MessageEvent) => {
      console.log('Received:', event.data);
      setChatContent((prev) => [...prev, event.data]);
    });

    source.addEventListener('error', (event) => {
      console.error('Error:', event);
      setError('Error receiving data.');
      source.close();
    });

    source.addEventListener('open', () => {
      console.log('Connection opened.');
      setLoading(false);
    });

    setEventSource(source);

    setTimeout(() => {
      source.close();
      console.log('Connection closed after timeout.');
    }, 300000);
  };

  return (
    <View style={styles.container}>
      <Button title="Start/Reset Chat" onPress={startOrResetChat} disabled={loading} />
      <Button title="Pause Chat" onPress={pauseChat} disabled={!eventSource} />
      <Button title="Resume Chat" onPress={resumeChat} disabled={!eventSource} />
      <Button title="Fetch Recent Games" onPress={fetchRecentGames} />
      {loading && <Text style={styles.loadingText}>Connecting...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <ScrollView style={styles.responseContainer}>
        {chatContent.map((content, index) => (
          <Text key={index} style={styles.responseText}>
            {index + 1}. {content}
          </Text>
        ))}
      </ScrollView>
      <ScrollView style={styles.responseContainer}>
        <Text style={styles.headerText}>Recent Games:</Text>
        {recentGames.map((game, index) => (
          <Text key={index} style={styles.responseText}>
            {game.batteam} vs {game.pitteam} (Game ID: {game.gid})
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    marginVertical: 10,
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
  responseContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 3,
  },
  responseText: {
    fontSize: 14,
    color: '#000',
    marginVertical: 5,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default HomeScreen;