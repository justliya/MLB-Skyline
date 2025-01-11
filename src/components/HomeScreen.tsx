import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const HomeScreen = () => {
  const navigation = useNavigation(); // Get navigation instance

  // Sign out function
  const handleSignOut = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.navigate('LoginScreen'); // Navigate back to the login screen after signing out
      })
      .catch(error => {
        console.error('Sign Out Error:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Skyline</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
