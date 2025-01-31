import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import EventSource, { EventSourceListener } from "react-native-sse";
import WinProbabilityChart from '../../components/WinProbabilityChart';

interface KeyPlay {
  play: string;
  win_probability: number;
  probability_change: number;
  explanation: string;
}

interface ApiData {
  play: string;
  play_label: string | null;
  home_team: string;
  inning: string;
  win_probability: number;
  key_plays?: KeyPlay[];
}

const API_URL = "https://replay-114778801742.us-central1.run.app/predict-win?user_id=testy6";

const THEME = {
  navy: '#1A2B3C',
  darkNavy: '#0F1825',
  orange: '#FF6B35',
  lightOrange: '#FF8B5E',
  gray: '#8795A1',
  lightGray: '#CBD2D9',
  white: '#FFFFFF',
};

const LiveScreen: React.FC = () => {
  const [liveData, setLiveData] = useState<ApiData | null>(null);
  const [keyPlays, setKeyPlays] = useState<KeyPlay[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryCount = useRef(0);

  const setupEventSource = () => {
    if (isConnecting || eventSourceRef.current) {
      return; // Don't create new connection if one exists or is in progress
    }

    setIsConnecting(true);
    setConnectionError(null);

    const es = new EventSource(API_URL, {
      headers: {
        Accept: "text/event-stream",
      },
      method: "GET",
      pollingInterval: 20,
    });

    const listener: EventSourceListener = (event) => {
      if (event.type === "open") {
        console.log("SSE Connection Opened");
        setIsConnecting(false);
        setConnectionError(null);
        retryCount.current = 0; // Reset retry count on successful connection
      } else if (event.type === "message") {
        try {
          if (event.data.trim() === "Replay paused.") {
            console.log("Replay paused, closing connection...");
            cleanup();
            return;
          }

          const newData: ApiData = JSON.parse(event.data);
          setLiveData(newData);

          if (newData.key_plays?.length > 0) {
            setKeyPlays(prev => [...prev, ...newData.key_plays]);
          }
        } catch (error) {
          console.error("Error parsing event data:", error);
        }
      } else if (event.type === "error") {
        console.error("SSE Connection Error:", event.message);
        handleConnectionError("Connection error occurred");
      } else if (event.type === "exception") {
        console.error("Exception in SSE:", event.message, event.error);
        handleConnectionError("Connection exception occurred");
      }
    };

    es.addEventListener("open", listener);
    es.addEventListener("message", listener);
    es.addEventListener("error", listener);

    eventSourceRef.current = es;
  };

  const handleConnectionError = (error: string) => {
    cleanup();
    setConnectionError(error);
    setIsConnecting(false);

    // Attempt retry if under max retries
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(`Retrying connection (${retryCount.current}/${maxRetries})...`);
      retryTimeoutRef.current = setTimeout(setupEventSource, 5000); // Retry after 5 seconds
    } else {
      setConnectionError(`Failed to connect after ${maxRetries} attempts`);
    }
  };

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.removeAllEventListeners();
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    setupEventSource();
    return cleanup;
  }, []);

  if (connectionError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{connectionError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!liveData ? (
        <ActivityIndicator size="large" color={THEME.orange} />
      ) : (
        <>
          <WinProbabilityChart apiData={liveData} />

          <View style={styles.keyPlaysWrapper}>
            <Text style={styles.keyPlaysTitle}>Key Plays</Text>
            <ScrollView 
              style={styles.keyPlaysContainer}
              contentContainerStyle={styles.keyPlaysContent}
            >
              {keyPlays.length === 0 ? (
                <Text style={styles.noKeyPlays}>No key plays yet.</Text>
              ) : (
                keyPlays.map((play, index) => (
                  <View key={index} style={styles.keyPlayItem}>
                    <View style={styles.playHeader}>
                      <Text style={styles.playType}>{play.play}</Text>
                      <Text style={[
                        styles.probabilityChange,
                        play.probability_change > 0 ? styles.positiveChange : styles.negativeChange
                      ]}>
                        {play.probability_change > 0 ? '+' : ''}{play.probability_change.toFixed(2)}%
                      </Text>
                    </View>
                    <Text style={styles.explanation}>{play.explanation || "No explanation provided."}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  keyPlaysWrapper: {
    flex: 1,
    marginTop: 20,
    backgroundColor: THEME.darkNavy,
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  keyPlaysTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.white,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  keyPlaysContainer: {
    maxHeight: 300,
  },
  keyPlaysContent: {
    gap: 12,
    paddingVertical: 5,
  },
  keyPlayItem: {
    backgroundColor: `${THEME.navy}90`,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: THEME.orange,
  },
  playHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playType: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.white,
    flex: 1,
  },
  probabilityChange: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  positiveChange: {
    color: THEME.orange,
    backgroundColor: `${THEME.orange}20`,
  },
  negativeChange: {
    color: '#FF4D4D',
    backgroundColor: '#FF4D4D20',
  },
  explanation: {
    fontSize: 14,
    color: THEME.lightGray,
    lineHeight: 20,
  },
  noKeyPlays: {
    textAlign: 'center',
    fontSize: 14,
    color: THEME.gray,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  keyPlayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
});

export default LiveScreen;
