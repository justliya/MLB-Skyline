import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';

interface QuizScreenProps {
  gameId: string;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ gameId }) => {
  // GUMBO API Data
  const { questions, loading, error } = useGumboAPI(gameId);

  // ML Model Integration
  const { fetchQuizHints } = useMLModels();
  const [hints, setHints] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);

  // Component States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<string[]>([]); // Earned trading cards
  const [earnedPoints, setEarnedPoints] = useState(0); // Points earned for rewards

  // Initial Hint Fetch on Mount
  useEffect(() => {
    if (questions.length > 0) {
      handleGetHints(); // Fetch hints for the first question
    }
  }, [questions]); // Only run when questions are loaded

  // Handle Answer Selection
  const handleAnswer = (answer: string) => {
    const question = questions[currentQuestionIndex];

    // Check if the answer is correct
    if (answer === question.answer) {
      const pointsEarned = 10; // Points per correct answer
      setScore(score + pointsEarned);
      setEarnedPoints(earnedPoints + pointsEarned);

      // Reward a trading card for every 20 points
      if ((earnedPoints + pointsEarned) % 20 === 0) {
        const card = `Player ${cards.length + 1}`; // Replace with GUMBO historical players
        setCards([...cards, card]); // Add card to collection
        Alert.alert('Congratulations!', `You earned a trading card: ${card}`);
      }
    }

    // Move to the next question or finish the quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setHints([]); // Clear hints for the next question
    } else {
      Alert.alert(`Quiz Completed! Final Score: ${score}/${questions.length * 10}`);
    }
  };

  // Fetch AI Hints for the Current Question
  const handleGetHints = async () => {
    setLoadingHints(true);
    const result = await fetchQuizHints(questions[currentQuestionIndex].question);
    if (result.data) {
      setHints(result.data);
    } else {
      Alert.alert('Error', result.error || 'Failed to fetch AI hints.');
    }
    setLoadingHints(false);
  };

  // Handle Loading/Error States
  if (loading) return <Text>Loading quiz...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      {/* Question */}
      <Text style={styles.questionText}>{questions[currentQuestionIndex].question}</Text>

      {/* Options */}
      <FlatList
        data={questions[currentQuestionIndex].options}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleAnswer(item)} style={styles.option}>
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* AI Hints Button */}
      <Button title="Get AI Hints" onPress={handleGetHints} />

      {/* Loading AI Hints */}
      {loadingHints && <ActivityIndicator size="large" />}

      {/* Display AI Hints */}
      {hints.length > 0 && (
        <View style={styles.hintsContainer}>
          <Text style={styles.hintsTitle}>Hints:</Text>
          {hints.map((hint, index) => (
            <Text key={index} style={styles.hintText}>
              {hint}
            </Text>
          ))}
        </View>
      )}

      {/* Score and Points */}
      <Text style={styles.scoreText}>Score: {score}</Text>
      <Text style={styles.pointsText}>Points: {earnedPoints}</Text>

      {/* Earned Trading Cards */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardsTitle}>Your Trading Cards:</Text>
        {cards.length > 0 ? (
          <FlatList
            data={cards}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/100' }} // Replace with card image URL
                  style={styles.cardImage}
                />
                <Text style={styles.cardText}>{item}</Text>
              </View>
            )}
          />
        ) : (
          <Text>No cards earned yet. Answer correctly to earn cards!</Text>
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { padding: 10 },
  questionText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  option: { padding: 10, marginVertical: 5, borderWidth: 1, borderRadius: 8 },
  hintsContainer: { marginTop: 15 },
  hintsTitle: { fontSize: 16, fontWeight: 'bold' },
  hintText: { fontSize: 14, marginTop: 5 },
  scoreText: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  pointsText: { fontSize: 16, marginTop: 10 },
  cardContainer: { marginTop: 20 },
  cardsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { alignItems: 'center', marginVertical: 5 },
  cardImage: { width: 100, height: 100, marginBottom: 5 },
  cardText: { fontSize: 14, fontWeight: 'bold' },
});

export default QuizScreen;

function useMLModels(): { fetchQuizHints: any; } {
  throw new Error('Function not implemented.');
}
function useGumboAPI(gameId: string): { questions: any; loading: any; error: any; } {
  throw new Error('Function not implemented.');
}

