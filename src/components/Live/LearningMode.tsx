import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Tts from 'react-native-tts';
import { fetchExplanationFromGemini } from '../Hooks/geminiApi'; // Add your API utility
import { fetchGameCaptions } from '../utils/gumboApi'; // Add your GUMBO API utility

const LearningMode = () => {
  const [captions, setCaptions] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLearningModeEnabled, setIsLearningModeEnabled] = useState(true); // Local toggle for now
  const [isTTSEnabled, setIsTTSEnabled] = useState(false); // Local toggle for now

  useEffect(() => {
    if (!isLearningModeEnabled) return;

    const fetchCaptions = async () => {
      const captionsData = await fetchGameCaptions(12345); // Replace with actual game ID
      setCaptions(captionsData);
    };

    fetchCaptions();

    const intervalId = setInterval(fetchCaptions, 10000);
    return () => clearInterval(intervalId);
  }, [isLearningModeEnabled]);

  const handleExplain = async (term: string) => {
    setIsLoading(true);
    try {
      const explanationText = await fetchExplanationFromGemini(term);
      setExplanation(explanationText);

      if (isTTSEnabled) {
        Tts.speak(explanationText);
      }
    } catch (error) {
      setExplanation('Error fetching explanation.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLearningModeEnabled) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>
          Learning Mode is disabled. Enable it in settings to use this feature.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Game Captions</Text>
      {captions.map((caption, index) => (
        <TouchableOpacity key={index} onPress={() => handleExplain(caption)}>
          <Text style={styles.caption}>{caption}</Text>
        </TouchableOpacity>
      ))}

      {isLoading && <ActivityIndicator size="large" color="blue" />}
      {explanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanation}>{explanation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  caption: { fontSize: 16, color: 'blue', marginVertical: 5 },
  explanationBox: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' },
  explanation: { fontSize: 14, color: '#333' },
  disabledContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  disabledText: { fontSize: 16, color: 'gray', textAlign: 'center', padding: 20 },
});

export default LearningMode;
