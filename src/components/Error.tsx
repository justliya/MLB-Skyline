
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

interface ErrorProps {
  onRetry?: () => void;
}

const Error: React.FC<ErrorProps> = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={{ uri: 'https://lottie.host/6a5a6357-7b2f-4c42-a3f4-a65273b436ed/kK60mL5GrH.lottie'}}
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.errorText}>
        Something went wrong. Please forgive us and try again.
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  animation: {
    width: 200,
    height: 200,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Error;
