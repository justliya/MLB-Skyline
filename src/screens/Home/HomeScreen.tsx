import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import EventSource from 'react-native-sse';
import Svg, { Path } from 'react-native-svg'; // Import components from react-native-svg
import Slider from '@react-native-community/slider';

const HomeScreen: React.FC = () => {
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'casual' | 'technical'>('casual');
  const [interval, setInterval] = useState(20);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const fetchAIResponse = () => {
    setLoading(true);
    setError(null);
    setChatContent([]);

    const url = 'https://replay-114778801742.us-central1.run.app/game-replay';
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({
      gid: 'ALS202407160',
      mode: mode,
      interval: interval,
    });

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

  const closeConnection = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      Alert.alert('Connection closed.');
    }
  };

  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Hello, I am Skyline your personal AI baseball analyst.</Text>
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'casual' && styles.activeMode]}
          onPress={() => setMode('casual')}
        >
          <Text style={styles.modeText}>Casual Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'technical' && styles.activeMode]}
          onPress={() => setMode('technical')}
        >
          <Text style={styles.modeText}>Technical Mode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Update Interval: {interval}s</Text>
        <Slider
          minimumValue={10}
          maximumValue={60}
          step={10}
          value={interval}
          onValueChange={setInterval}
          minimumTrackTintColor="#1E90FF"
          maximumTrackTintColor="#D3D3D3"
        />
      </View>

      <TouchableOpacity
        style={styles.fetchButton}
        onPress={fetchAIResponse}
        disabled={loading}
      >
        <Text style={styles.fetchButtonText}>
          {loading ? 'Connecting...' : 'Start Streaming'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <ScrollView
        style={styles.responseContainer}
        onScrollBeginDrag={closeConnection}
      >
        {chatContent.map((content, index) => (
          <Text key={index} style={styles.responseText}>
            {index + 1}. {content}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.svgContainer}>
        <Svg width="50" height="50" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C13.1046 2 14 2.89543 14 4H10C10 2.89543 10.8954 2 12 2ZM5 4C5 2.34315 6.34315 1 8 1H16C17.6569 1 19 2.34315 19 4H20C21.1046 4 22 4.89543 22 6V10C22 11.1046 21.1046 12 20 12H18.66C18.874 12.6144 19 13.295 19 14C19 17.3137 16.3137 20 13 20C9.68629 20 7 17.3137 7 14C7 13.295 7.12595 12.6144 7.34 12H4C2.89543 12 2 11.1046 2 10V6C2 4.89543 2.89543 4 4 4H5Z"
            fill="#1E90FF"
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  titleText: {
    fontSize: 18,
    color: '#FACC15',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modeButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#374151',
  },
  activeMode: {
    backgroundColor: '#1E90FF',
  },
  modeText: {
    color: '#FFF',
    fontSize: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    color: '#FFF',
    marginBottom: 10,
  },
  fetchButton: {
    padding: 15,
    backgroundColor: '#1E40AF',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  fetchButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  responseContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 5,
  },
  responseText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  svgContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
});

export default HomeScreen;
