import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { BottomSheetHandle } from '../../components/types';
import BottomSheet from '../../components/BottomSheet';
import EventSource from 'react-native-sse';
import { useAuth } from '../../hooks/AuthProvider';

const { height: screenHeight } = Dimensions.get('screen');

const ChatScreen: React.FC<any> = ({ route }) => {
  const bottomSheetRef = useRef<BottomSheetHandle>(null);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [chatMode, setChatMode] = useState<string | null>(null);
  const [chatInterval, setChatInterval] = useState<number | null>(null);
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { user } = useAuth();
  const userId = user?.uid || 'Guest';

  const { game, hometeam, visteam } = route.params ?? {};

  useEffect(() => {
    return () => {
      eventSource?.close();
      setEventSource(null);
    };
  }, [eventSource]);

  const startChat = () => {
    if (!chatMode || !chatInterval) {
      Alert.alert('Error', 'Please select a chat mode and interval before starting.');
      return;
    }

    const url = `https://replay-114778801742.us-central1.run.app/game-replay?gid=${game}&mode=${chatMode}&user_id=${userId}&interval=${chatInterval}`;
    const headers = { 'Content-Type': 'application/json' };

    const es = new EventSource(url, { headers });
    setEventSource(es);

    es.addEventListener('message', (event) => setChatContent((prev) => [...prev, event.data as string]));
    es.addEventListener('error', () => {
      Alert.alert('Error', 'Unable to receive chat messages.');
      es.close();
    });
  };

  return (
    <View>
      <Button title="Settings" onPress={() => bottomSheetRef.current?.openSheet()} />
      <BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5} backgroundColor="#fff">
        <View>
          <Button title="Mode 1" onPress={() => setChatMode('mode1')} />
          <Button title="Mode 2" onPress={() => setChatMode('mode2')} />
          <Button title="10s" onPress={() => setChatInterval(10)} />
          <Button title="20s" onPress={() => setChatInterval(20)} />
          <Button title="30s" onPress={() => setChatInterval(30)} />
        </View>
      </BottomSheet>

      <Button title="Start Chat" onPress={startChat} disabled={!chatMode || !chatInterval} />
      <ScrollView>
        {chatContent.map((message, index) => (
          <Text key={index}>{message}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default ChatScreen;
