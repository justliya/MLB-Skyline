/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Alert, ScrollView, Dimensions } from 'react-native';
import EventSource from 'react-native-sse';
import { useAuth } from '../../hooks/AuthProvider';
import BottomSheet from '../../components/BottomSheet';
import { BottomSheetHandle } from '../../components/types';
import Error from '../../components/Error';

const { height: screenHeight } = Dimensions.get('screen');

const ChatScreen: React.FC<any> = ({ route }) => {
  const { game, hometeam, visteam, statsapi_game_pk } = route.params ?? {}; // Ensure valid game data
  console.log('ChatScreen received params:', { game, hometeam, visteam, statsapi_game_pk });
  const { user } = useAuth();
  const userId = user?.uid || 'Guest';

  const [chatMode, setChatMode] = useState<string | null>(null);
  const [interval, setInterval] = useState<number>(10);
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null); // Track the active SSE connection
  const bottomSheetRef = useRef<BottomSheetHandle>(null); // Ref for bottom sheet

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  if (!game || !hometeam || !visteam || !statsapi_game_pk) {
    return <Error />;
  }

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
    console.log(`Connecting to SSE: ${url}`);

    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ gid: game, mode: chatMode, interval, user_id: userId });

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(url, { headers, body, method: 'POST' });
    eventSourceRef.current = es;

    es.addEventListener('message', (event) => {
      console.log(`Message: ${event.data}`);
      setChatContent((prev) => [...prev, event.data as string]);
    });

    es.addEventListener('error', (event) => {
      console.error('SSE Error:', event);
      setError('Unable to receive chat messages.');
      es.close();
      eventSourceRef.current = null; // Clean up reference
    });

    es.addEventListener('open', () => {
      console.log('SSE Connection Opened');
      setLoading(false);
    });
  };

  const pauseChat = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsPaused(true);
    }
  };

  const resumeChat = () => {
    setIsPaused(false);
    startChat();
  };

  const closeConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      Alert.alert('Connection closed.');
    }
  };

  return (
    <View>
      <Text>Game: {hometeam} vs {visteam}</Text>

      {/* Open Bottom Sheet */}
      <Button title="Settings" onPress={() => bottomSheetRef.current?.openSheet()} />

      {/* Bottom Sheet */}
      <BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
        <View>
          <Text>Select Chat Mode:</Text>
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

          <Text>Select Interval:</Text>
          <Button
            title="10s"
            onPress={() => setInterval(10)}
            color={interval === 10 ? '#34C759' : '#CCC'}
          />
          <Button
            title="20s"
            onPress={() => setInterval(20)}
            color={interval === 20 ? '#34C759' : '#CCC'}
          />
          <Button
            title="30s"
            onPress={() => setInterval(30)}
            color={interval === 30 ? '#34C759' : '#CCC'}
          />
        </View>
      </BottomSheet>

      {/* Start Chat Button */}
      {!eventSourceRef.current && (
        <Button
          title="Start Chat"
          onPress={startChat}
          disabled={!chatMode}
        />
      )}

      {loading && <Text>Loading...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {/* Chat Messages */}
      <ScrollView>
        {chatContent.map((message, index) => (
          <Text key={index}>{message}</Text>
        ))}
      </ScrollView>

      {/* Chat Controls */}
      {eventSourceRef.current && (
        <>
          {!isPaused ? (
            <Button title="Pause Chat" onPress={pauseChat} />
          ) : (
            <Button title="Resume Chat" onPress={resumeChat} />
          )}
          <Button title="Close Chat" onPress={closeConnection} />
        </>
      )}
    </View>
  );
};

export default ChatScreen;
