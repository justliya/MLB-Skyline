import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const AccountScreen = () => {
  const navigation = useNavigation();
  const [isLearningModeEnabled, setIsLearningModeEnabled] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState('Select Team'); // Placeholder

  // Toggle Learning Mode
  const toggleLearningMode = () => setIsLearningModeEnabled(prev => !prev);

  // Toggle Text-to-Speech
  const toggleTTS = () => setIsTTSEnabled(prev => !prev);

  // Sign Out Function
  const handleSignOut = () => {
    auth()
      .signOut()
      .then(() => {
        Alert.alert('Success', 'You have been signed out.');
        navigation.navigate('Login');
      })
      .catch(error => {
        console.error('Sign Out Error:', error);
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      {/* Learning Mode Toggle */}
      <View style={styles.preference}>
        <Text style={styles.preferenceText}>Enable Learning Mode</Text>
        <Switch value={isLearningModeEnabled} onValueChange={toggleLearningMode} />
      </View>

      {/* Text-to-Speech Toggle */}
      <View style={styles.preference}>
        <Text style={styles.preferenceText}>Enable Text-to-Speech</Text>
        <Switch value={isTTSEnabled} onValueChange={toggleTTS} />
      </View>

      {/* Home Team Selection */}
      <View style={styles.preference}>
        <Text style={styles.preferenceText}>Home Team</Text>
        <TouchableOpacity
          style={styles.teamButton}
          onPress={() => Alert.alert('Team Selection', 'Team selection coming soon!')}
        >
          <Text style={styles.teamButtonText}>{selectedHomeTeam}</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  preferenceText: {
    fontSize: 16,
    color: '#555',
  },
  teamButton: {
    backgroundColor: '#E7E7E7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  teamButtonText: {
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    marginTop: 30,
    backgroundColor: '#FF4C4C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;
