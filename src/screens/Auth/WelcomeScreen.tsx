import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const proceedToHome = () => {
    navigation.navigate('Main'); // Replace with HomeScreen to prevent back navigation
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./logo.png')} // Replace with your logo path
        style={styles.logo}
        resizeMode="contain"
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001345',
  },
  logo: {
    width: '60%',
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF6A3C',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen; 