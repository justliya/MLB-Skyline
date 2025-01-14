import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const TriviaScreen = () => {
  const [question, setQuestion] = useState('Who holds the record for the most home runs in MLB history?');
  const [options, setOptions] = useState([
    'Barry Bonds',
    'Hank Aaron',
    'Babe Ruth',
    'Alex Rodriguez',
  ]);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionPress = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      Alert.alert('No Selection', 'Please select an option before submitting!');
      return;
    }

    // Placeholder for validation logic
    if (selectedOption === 'Barry Bonds') {
      // eslint-disable-next-line quotes
      Alert.alert("Correct!", 'Barry Bonds holds the record with 762 home runs.');
    } else {
      Alert.alert('Incorrect', 'The correct answer is Barry Bonds.');
    }

    // Reset selection for next question (if applicable)
    setSelectedOption(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trivia Quiz</Text>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOption === option && styles.selectedOption,
            ]}
            onPress={() => handleOptionPress(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Answer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  question: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#D1E7FF',
    borderColor: '#007BFF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TriviaScreen;
