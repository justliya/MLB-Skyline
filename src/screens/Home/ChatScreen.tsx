/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Alert, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import EventSource from 'react-native-sse';
import { useAuth } from '../../hooks/AuthProvider';
import BottomSheet from '../../components/BottomSheet';
import { BottomSheetHandle } from '../../components/types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Tooltip } from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';




const { height: screenHeight } = Dimensions.get('screen');

const ChatScreen: React.FC<any> = ({ route }) => {
  const { game, hometeam, visteam } = route.params ?? {};
  const { user } = useAuth();
  const userId = user?.uid || 'Guest';
  const [open, setOpen] = React.useState(false);
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

      <Tooltip
        containerStyle={{ width: 350, height: 120, display: 'flex', position: 'absolute', bottom: 50, transform: [{ translateX: -150 }] }}
        visible={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        popover={

          <Text style={styles.tooltip}>
            <Text style={styles.tooltipfocus}>Casual Mode:</Text>
            <Text> Provides simplified explanations suitable for all fans.</Text>
            {'\n\n'}
            <Text style={styles.tooltipfocus}>Technical Mode:</Text>
            <Text> Offers in-depth strategy breakdowns for advanced analysis.</Text>
          </Text>
        }
      >
        <TouchableOpacity onPress={() => setOpen(!open)}>
          <Text style={styles.tooltipTrigger}>Tap on AI and choose a mode to start</Text>
        </TouchableOpacity>
      </Tooltip>

      {/* Start Chat Button */}
      {!eventSourceRef.current && (
        <Button
          title="Start Chat"
          onPress={startChat}
          disabled={!chatMode}
        />
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
          </Animated.View>
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


      {/* Open Bottom Sheet */}

      <TouchableOpacity style={styles.settingsButton} onPress={() => bottomSheetRef.current?.openSheet()}>
        <Text style={styles.settingsButtonText}>AI</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}

      <BottomSheet backgroundColor="#0D1728" ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
        <ScrollView style={styles.bottomSheetContent}>
          <Text style={styles.settingsHeader}>Select Chat Mode:</Text>
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

          <Text style={styles.settingsHeader}>Select Interval:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
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
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1728',
    padding: 20,
  },
  tooltipTrigger: {
    color: '#FFF',
    fontFamily: 'poppins',
    fontSize: 17,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  tooltip: {
    color: '#FFF',
    fontFamily: 'poppins',
    fontSize: 14,
  },
  tooltipfocus: {
    fontWeight: 'bold',
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
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center', // Center the bubble horizontally
    flex: 1, // Allow the bubble to flex and take available width
    backgroundColor: '#EEE8E4', // White text for contrast
  },

  chatMessage: {
    color: 'black', // White text for contrast
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },

  startButton: {
    backgroundColor: '#00E676',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A0A0A0',
    fontSize: 16,
    marginVertical: 10,
  },
  errorText: {
    color: '#FF1744',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingAnimation: {
    width: 100,
    height: 100,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  pauseButton: {
    backgroundColor: '#FF4500',
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
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#0D1728',
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
