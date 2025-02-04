import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Button, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import WinProbabilityChart from '../../components/WinProbabilityChart';
import { WebView } from 'react-native-webview';

interface Game {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
}

interface KeyPlay {
  play_label: string;
  win_probability: number;
  probability_change: number;
  explanation: string;
  play_id?: string | null;
}

interface ApiData {
  home_team: string;
  inning: string;
  win_probability: number;
  key_play?: KeyPlay;
}

interface ApiResponse {
  predictions: ApiData[];
}

const API_URL = "https://replay-114778801742.us-central1.run.app/predict-win";
const VIDEO_API_URL = "https://www.mlb.com/video/search?"

const THEME = {
  navy: '#1A2B3C',
  darkNavy: '#0F1825',
  orange: '#FF6B35',
  lightOrange: '#FF8B5E',
  gray: '#8795A1',
  lightGray: '#CBD2D9',
  white: '#FFFFFF',
};

const ChartScreen: React.FC<any> = ({ route }) => {
  const { game, hometeam, visteam, statsapi_game_pk } = route.params ?? {};
  console.log('ChartScreen received params:', { game, hometeam, visteam, statsapi_game_pk });
  const [predictions, setPredictions] = useState<ApiData[]>([]);
  const [keyPlays, setKeyPlays] = useState<KeyPlay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<KeyPlay | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const webViewRef = useRef<WebView>(null);

  const fetchPredictions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}?gid=${game}&statsapi_game_pk=${statsapi_game_pk[0]}`);
      console.log("API Response:", response.data);
      setPredictions(response.data.predictions);
      
      // Extract key plays from predictions
      const newKeyPlays = response.data.predictions
        .filter(pred => pred.key_play)
        .map(pred => pred.key_play!)
      setKeyPlays(newKeyPlays);
      console.log("Key Plays:", newKeyPlays);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error("Error fetching predictions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideoUrl = async (playId: string | undefined) => {
    if (!playId)  {
      console.error('No playId provided'); 
      return;
    }
      const videoPageLink =`${VIDEO_API_URL}q=playid="${playId}"`
        setVideoUrl(videoPageLink);
  };

  React.useEffect(() => {
    fetchPredictions();
  },[]);

  const handleViewPlay = (play: KeyPlay) => {
    setSelectedPlay(play);
    if (play.play_id) {
      fetchVideoUrl(play.play_id);
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPlay(null);
    setVideoUrl(null);
  };

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const onWebViewLoad = () => {
    if (webViewRef.current) {

      webViewRef.current.injectJavaScript(`
        window.scroll({
          top: 200,
          left: 0,
          behavior: 'smooth'
        });
      `);
      console.log('page adjusted and video playback started');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchPredictions} color={THEME.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={THEME.orange} />
      ) : (
        <>
          <View style={styles.chartWrapper}>
            <WinProbabilityChart data={predictions} />
          </View>

          <View style={styles.keyPlaysWrapper}>
            <Text style={styles.keyPlaysTitle}>Key Plays</Text>
            <ScrollView 
              style={styles.keyPlaysContainer}
              contentContainerStyle={styles.keyPlaysContent}
            >
              {keyPlays.length === 0 ? (
                <Text style={styles.noKeyPlays}>No key plays yet.</Text>
              ) : (
                keyPlays.map((play: KeyPlay, index: number) => (
                  <View key={index} style={styles.keyPlayItem}>
                    <View style={styles.playHeader}>
                      <Text style={styles.playType}>{play.play_label}</Text>
                      <Text style={[
                        styles.probabilityChange,
                        play.probability_change > 0 ? styles.positiveChange : styles.negativeChange
                      ]}>
                        {play.probability_change > 0 ? '+' : ''}{play.probability_change.toFixed(2)}%
                      </Text>
                    </View>
                    <Text style={styles.explanation}>{truncateText(play.explanation || "No explanation provided.", 100)}</Text>
                    <TouchableOpacity
                      style={styles.viewPlayButton}
                      onPress={() => handleViewPlay(play)}>
                      <Text style={styles.viewPlayButtonText}>View Play</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </>
      )}

      {selectedPlay && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedPlay.play_label}</Text>
              <View style={styles.videoContainer}>
                {videoUrl ? (
                  <WebView
                    ref={webViewRef}
                    source={{ uri: videoUrl }}
                    style={styles.video}
                    onLoad={onWebViewLoad}
                    allowsAirPlayForMediaPlayback={true}
                    allowsFullscreenVideo={true}
                    allowsPictureInPictureMediaPlayback={true}
                    allowsInlineMediaPlayback={true}
                  />
                ) : (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME.orange} />
                  </View>
                )}
              </View>
              <Text style={styles.modalExplanation}>{selectedPlay.explanation}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: THEME.darkNavy,
  },
  chartWrapper: {
    height: 250, // Adjusted height to fit the child component
    marginBottom: 5,
  },
  keyPlaysWrapper: {
    maxHeight: 300, // Adjust to fit the content
    backgroundColor: THEME.navy,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  keyPlaysTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.white,
    marginBottom: 12,
    textAlign: 'left',
    letterSpacing: 0.5,
    backgroundColor: THEME.orange,
    padding: 8,
    borderRadius: 5,
  },
  keyPlaysContainer: {
    height: 500,
  },
  keyPlaysContent: {
    gap: 20,
    paddingVertical: 10,
  },
  keyPlayItem: {
    backgroundColor: `${THEME.darkNavy}90`,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: THEME.orange,
    position: 'relative',
    marginBottom: 20, 
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
    color: '#3FD710FF',
    backgroundColor: `#18E51820`,
  },
  negativeChange: {
    color: '#FF4D4D',
    backgroundColor: '#FF4D4D20',
  },
  explanation: {
    fontSize: 16,
    color: THEME.lightGray,
    lineHeight: 20,
    marginBottom: 20, 
    textAlign: 'left', // Align text to the left
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
  viewPlayButton: {
    backgroundColor: `${THEME.orange}20`,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  viewPlayButtonText: {
    color: THEME.orange,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '95%',
    backgroundColor: THEME.navy,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.white,
    marginTop: 10,
    textAlign: 'left', // Align text to the left
    width: '100%', // Ensure the text takes the full width
  },
  videoContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    marginBottom: 12,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: THEME.lightGray,
    marginBottom: 12,
    textAlign: 'left', 
  },
  modalExplanation: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.lightGray,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'left', 
    width: '100%', 
  },
  closeButton: {
    backgroundColor: THEME.orange,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 5,
  },
  closeButtonText: {
    color: THEME.white,
    fontWeight: '600',
  },
});

export default ChartScreen;
