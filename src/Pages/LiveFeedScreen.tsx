import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

const LiveFeedScreen = ({ route }) => {
  const { gid } = route.params; // Game ID passed to the page
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('normal-mode'); // Default mode
  const [isReplaying, setIsReplaying] = useState(false);

  const startReplay = () => {
    const eventSource = new EventSource(
      `https://REGION-YOUR_PROJECT_ID.cloudfunctions.net/replay_game_stream?gid=${gid}&mode=${mode}`
    );

    setIsReplaying(true);

    eventSource.onmessage = (event) => {
      const newMessage = event.data; // Summary from server
      setMessages((prevMessages) => [...prevMessages, { id: Date.now(), text: newMessage }]);
    };

    eventSource.onerror = () => {
      console.error('Error connecting to the stream.');
      eventSource.close();
      setIsReplaying(false);
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Replay</Text>
        <View style={styles.buttonContainer}>
          <Button title="Normal Mode" onPress={() => setMode('normal-mode')} />
          <Button title="Learning Mode" onPress={() => setMode('learning-mode')} />
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.message}>{item.text}</Text>}
      />

      <Button title="Start Replay" onPress={startReplay} disabled={isReplaying} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row' },
  message: { backgroundColor: '#e9ecef', padding: 10, marginVertical: 5, borderRadius: 5 },
});

export default LiveFeedScreen;
