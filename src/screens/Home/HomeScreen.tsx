import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import  EventSource  from 'react-native-sse'; // Import the SSE library

const HomeScreen: React.FC = () => {
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIResponse = () => {
    setLoading(true);
    setError(null); // Clear previous errors
    setChatContent([]); // Clear previous content

    const url = 'https://replay-114778801742.us-central1.run.app/game-replay';
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({
      gid: 'ALS202407160',
      mode: 'casual',
      interval: 20,
    });

    // Create a new EventSource instance
    const eventSource = new EventSource(url, { headers, body, method: 'POST' });

    // Listen for incoming messages
    eventSource.addEventListener('message', (event) => {
      console.log('Received Message:', event.data);

      // Append the new message to chatContent
      setChatContent((prev) => [...prev, event.data]);
    });

    // Handle errors
    eventSource.addEventListener('error', (event) => {
      console.error('SSE Error:', event);
      setError('Error receiving data. Please try again.');
      setLoading(false);
      eventSource.close();
    });

    // Handle open event (connection established)
    eventSource.addEventListener('open', () => {
      console.log('Connection opened.');
      setLoading(false);
    });

    // Automatically close the connection after 30 seconds
    setTimeout(() => {
      eventSource.close();
      console.log('Connection closed after timeout.');
    }, 300000);
  };

  return (
    <View style={styles.container}>
      <Button title="Fetch AI Response" onPress={fetchAIResponse} disabled={loading} />
      {loading && <Text style={styles.loadingText}>Connecting...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <ScrollView style={styles.responseContainer}>
        {chatContent.map((content, index) => (
          <Text key={index} style={styles.responseText}>
            {index + 1}. {content}
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
});

export default HomeScreen;
