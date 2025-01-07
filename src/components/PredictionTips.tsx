import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { fetchPredictions } from '../Services/cloudFunctionService';




// Interfaces
interface PredictionTipsProps {
  gameId: string;
}

interface Team {
  name: string;
  logo: string;
  record: string;
  pitcher: string;
  era: string;
}

interface Weather {
  condition: string;
  wind: string;
  temp: string;
}

// Component
const PredictionTips: React.FC<PredictionTipsProps> = ({ gameId }) => {
  // State Variables
  const [teamA, setTeamA] = useState<Team>({
    name: 'Team A',
    logo: '',
    record: '45-30',
    pitcher: 'John Doe',
    era: '3.12',
  });
  const [teamB, setTeamB] = useState<Team>({
    name: 'Team B',
    logo: '',
    record: '50-25',
    pitcher: 'Jane Smith',
    era: '2.89',
  });
  const [weather, setWeather] = useState<Weather>({
    condition: 'Clear',
    wind: '8 mph NW',
    temp: '75°F',
  });

  const [winnerPrediction, setWinnerPrediction] = useState('');
  const [scorePredictionA, setScorePredictionA] = useState('');
  const [scorePredictionB, setScorePredictionB] = useState('');
  const [topHitter, setTopHitter] = useState('');
  const [homeRuns, setHomeRuns] = useState(0);
  const [strikeouts, setStrikeouts] = useState(0);
  const [extraInnings, setExtraInnings] = useState(false);
  const [grandSlam, setGrandSlam] = useState(false);
  const [firstScore, setFirstScore] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Tips State
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);

  // ML Model States
  const { fetchPredictions: fetchMLPredictions } = useMLModels();
  const [mlPredictions, setMLPredictions] = useState<string[]>([]);
  const [loadingMLPredictions, setLoadingMLPredictions] = useState(false);

  // Fetch Game Data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Simulate API Fetch for Game Details (Replace with GUMBO API)
        setTeamA({
          name: 'New York Yankees',
          logo: 'https://example.com/yankees-logo.png',
          record: '55-20',
          pitcher: 'Gerrit Cole',
          era: '2.45',
        });
        setTeamB({
          name: 'Boston Red Sox',
          logo: 'https://example.com/redsox-logo.png',
          record: '48-30',
          pitcher: 'Chris Sale',
          era: '3.12',
        });
        setWeather({
          condition: 'Partly Cloudy',
          wind: '10 mph NE',
          temp: '78°F',
        });
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchGameData();
  }, []);

  // Fetch Prediction Tips
  useEffect(() => {
    fetchPredictions(gameId).then((data) => {
      setTips(data);
      setLoadingTips(false);
    });
  }, [gameId]);

  // Fetch AI Predictions
  const handleGetMLPredictions = async () => {
    setLoadingMLPredictions(true);
    const result = await fetchMLPredictions(gameId);
    if (result.data) {
      setMLPredictions(result.data.predictions);
    } else {
      Alert.alert('Error', result.error || 'Failed to fetch predictions.');
    }
    setLoadingMLPredictions(false);
  };

  // Handle Prediction Submission
  const handleSubmit = () => {
    setSubmitted(true);
    Alert.alert('Prediction Submitted!', 'Your predictions have been saved.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>MLB Predictions – Game Day</Text>
        <View style={styles.teamLogos}>
          <Image source={{ uri: teamA.logo }} style={styles.logo} />
          <Text style={styles.vs}>VS</Text>
          <Image source={{ uri: teamB.logo }} style={styles.logo} />
        </View>
        
          <Button title="Home" onPress={() => {}} />
          <Button title="My Predictions" onPress={() => {}} />
          <Button title="Settings" onPress={() => {}} />
        
      </View>

      {/* Game Summary Section */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {teamA.name} (Record: {teamA.record}) vs {teamB.name} (Record: {teamB.record})
        </Text>
        <Text>Starting Pitchers:</Text>
        <Text>{teamA.name}: {teamA.pitcher}, ERA: {teamA.era}</Text>
        <Text>{teamB.name}: {teamB.pitcher}, ERA: {teamB.era}</Text>
        <Text>Weather: {weather.condition} | Wind: {weather.wind} | Temp: {weather.temp}</Text>
      </View>

      {/* AI Prediction Tips Section */}
      <Text style={styles.sectionTitle}>Prediction Tips:</Text>
      {loadingTips ? (
        <ActivityIndicator />
      ) : (
        tips.map((tip, index) => (
          <Text key={index} style={styles.tipText}>{tip}</Text>
        ))
      )}

      {/* ML Predictions Section */}
      <Button title="Get AI Predictions" onPress={handleGetMLPredictions} />
      {loadingMLPredictions ? (
        <ActivityIndicator />
      ) : (
        mlPredictions.map((prediction, index) => (
          <Text key={index} style={styles.tipText}>{prediction}</Text>
        ))
      )}

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title={submitted ? 'Edit Prediction' : 'Submit Prediction'}
          onPress={handleSubmit}
        />
        <Button title="Share Prediction" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { padding: 10 },
  header: { alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  teamLogos: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 50 },
  vs: { marginHorizontal: 10, fontSize: 16 },
  summary: { marginTop: 10 },
  summaryText: { fontSize: 16, fontWeight: 'bold' },
  predictions: { marginTop: 20 },
  input: { borderWidth: 1, padding: 8, marginVertical: 5 },
  tipText: { fontSize: 16, marginVertical: 5 },
  footer: { marginTop: 20 },
});

export default PredictionTips;
function useMLModels(): { fetchPredictions: any; } {
  throw new Error('Function not implemented.');
}

