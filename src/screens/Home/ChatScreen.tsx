
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Alert, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import EventSource from 'react-native-sse';
import { useAuth } from '../../hooks/AuthProvider';
import BottomSheet from '../../components/BottomSheet';
import { BottomSheetHandle } from '../../components/types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import TextToSpeech from '../../components/TextToSpeech';



const { height: screenHeight } = Dimensions.get('screen');

const ChatScreen: React.FC<any> = ({ route }) => {
  const { game, hometeam, visteam } = route.params ?? {};
  const { user } = useAuth();
  const userId = user?.uid || 'Guest';

  const [chatMode, setChatMode] = useState<string | null>(null);
  const [interval, setInterval] = useState<number>(10);
  const [chatContent, setChatContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const bottomSheetRef = useRef<BottomSheetHandle>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  if (!game || !hometeam || !visteam) {
    return <Text style={styles.errorText}>Error: Missing game data.</Text>;
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
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ gid: game, mode: chatMode, interval, user_id: userId });

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(url, { headers, body, method: 'POST' });
    eventSourceRef.current = es;

    es.addEventListener('message', (event) => {
      setChatContent((prev) => [...prev, event.data as string]);
    });

    es.addEventListener('error', () => {
      setError('Unable to receive chat messages.');
      es.close();
      eventSourceRef.current = null;
    });

    es.addEventListener('open', () => {
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
    <View style={styles.container}>
      <Text style={styles.headerText}>Game: {hometeam} vs {visteam}</Text>

      {/* Start Chat Button */}
      {!eventSourceRef.current && (
        <TouchableOpacity style={styles.startButton} onPress={startChat} disabled={!chatMode}>
          <Text style={styles.startButtonText}>Start Chat</Text>
        </TouchableOpacity>
      )}

      {/* Chat Messages */}
      <ScrollView style={styles.chatBox}>
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
        {error && <Text style={styles.errorText}>{error}</Text>}
        {chatContent.map((message, index) => (
          <Animated.View key={index} entering={FadeIn} exiting={FadeOut} style={styles.chatBubble}>
            <Text style={styles.chatMessage}>{message}</Text>
            <TextToSpeech message={message} />
          </Animated.View>
        ))}
      </ScrollView>

      {/* Chat Controls */}
      {eventSourceRef.current && (
        <View style={styles.controls}>
          {!isPaused ? (
            <TouchableOpacity style={styles.pauseButton} onPress={pauseChat}>
              <Text style={styles.pauseButtonText}>Pause Chat</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.resumeButton} onPress={resumeChat}>
              <Text style={styles.resumeButtonText}>Resume Chat</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={closeConnection}>
            <Text style={styles.closeButtonText}>Close Chat</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Open Bottom Sheet */}
      <TouchableOpacity style={styles.settingsButton} onPress={() => bottomSheetRef.current?.openSheet()}>
        <Text style={styles.settingsButtonText}>Ai Assistant</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.settingsHeader}>Select Chat Mode:</Text>
          <Button
            title="Casual"
            onPress={() => setChatMode('casual')}
            color={chatMode === 'casual' ? '#FFA500' : '#CCC'}
          />
          <Button
            title="Technical"
            onPress={() => setChatMode('technical')}
            color={chatMode === 'technical' ? '#FFA500' : '#CCC'}
          />

          <Text style={styles.settingsHeader}>Select Interval:</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1728',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
  },
  chatBox: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 15,
    backgroundColor: '#0D1728',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  chatBubble: {
    backgroundColor: '#447AB7',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 4,
    alignItems: 'center',
  },
  chatMessage: {
    color: '#F3FDF7',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 100,
    height: 100,
  },
  loadingText: {
    color: '#AAAAAA',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  startButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 75,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: '#FF4500',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumeButton: {
    backgroundColor: '#32CD32',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 18,
    margin: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 7,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1E1E2F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  settingsHeader: {
    fontSize: 20,
    marginVertical: 10,
    color: '#FFA500',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lottie: { width: 200, height: 200 },
});

export default ChatScreen;
