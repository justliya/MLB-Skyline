
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const proceedToHome = () => {
    navigation.navigate('Main'); // Replace with your actual route
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./logo.png')} // Replace with your logo path
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to Skyline</Text>
      <TouchableOpacity style={styles.button} onPress={proceedToHome}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center elements
    alignItems: 'center',
    backgroundColor: '#0D1728', // Dark background color
    paddingVertical: 20, // Reduced padding
  },
  logo: {
    width: 250, // Adjusted smaller logo size
    height: 250,
    marginBottom: 20,
    borderRadius: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30, // Slightly smaller text
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 35, // Closer to the button
  },
  button: {
    backgroundColor: '#FF6A3C', // Orange color for button
    paddingVertical: 12, // Slightly reduced padding
    paddingHorizontal: 40, // Narrower button
    borderRadius: 20, // Smaller radius for compactness
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16, // Adjusted font size for balance
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
