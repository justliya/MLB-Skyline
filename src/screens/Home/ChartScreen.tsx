import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import WinProbabilityChart from '../../components/WinProbabilityChart';

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
  play_id: string | null;
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

  const fetchPredictions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}?gid=${game}&statsapi_game_pk=${statsapi_game_pk}`);
      console.log("API Response:", response.data);
      setPredictions(response.data.predictions);
      
      // Extract key plays from predictions
      const newKeyPlays = response.data.predictions
        .filter(pred => pred.key_play)
        .map(pred => pred.key_play!)
      setKeyPlays(newKeyPlays);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error("Error fetching predictions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPredictions();
  }, []);

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
    padding: 5,
    backgroundColor: THEME.darkNavy,
  },
  chartWrapper: {
    flex: 2,
    marginBottom: 10,
  },
  keyPlaysWrapper: {
    flex: 1,
    backgroundColor: THEME.navy,
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  keyPlaysTitle: {
    fontSize: 13,
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
    backgroundColor: `${THEME.darkNavy}90`,
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
    color: '#3FD710FF',
    backgroundColor: `#18E51820`,
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

export default ChartScreen;
