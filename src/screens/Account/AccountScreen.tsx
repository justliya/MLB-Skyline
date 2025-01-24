import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';


const AccountScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLearningModeEnabled, setIsLearningModeEnabled] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);

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
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Account</Text>

        {/* Username and Home Team */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Username:</Text> JohnDoe
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Home Team:</Text> Cubs
          </Text>
        </View>

        {/* Language Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => Alert.alert('Language Selection', 'Language options coming soon!')}
        >
          <Text style={styles.dropdownText}>Language</Text>
        </TouchableOpacity>

        {/* Home Team Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => Alert.alert('Team Selection', 'Team selection coming soon!')}
        >
          <Text style={styles.dropdownText}>Home Team</Text>
        </TouchableOpacity>

        {/* Learning Mode */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Learning Mode</Text>
          <Switch
            value={isLearningModeEnabled}
            onValueChange={toggleLearningMode}
            thumbColor={isLearningModeEnabled ? '#FF6A3C' : '#DDD'}
            trackColor={{ false: '#CCC', true: '#FFAB8F' }}
          />
        </View>

        {/* Text-to-Speech */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Text-to-Speech</Text>
          <Switch
            value={isTTSEnabled}
            onValueChange={toggleTTS}
            thumbColor={isTTSEnabled ? '#FF6A3C' : '#DDD'}
            trackColor={{ false: '#CCC', true: '#FFAB8F' }}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0D1728',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0D1728',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6A3C',
    textAlign: 'center',
    marginVertical: 20,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#FF6A3C',
  },
  dropdown: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#FFF',
  },
  signOutButton: {
    backgroundColor: '#FF6A3C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  signOutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;
