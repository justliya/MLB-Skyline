import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ActivityIndicator } from 'react-native';
import {useAuth } from '../../hooks/AuthProvider';
import auth from '@react-native-firebase/auth';
import UserInfo from '../../components/UserInfo';


const AccountScreen: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {return <ActivityIndicator size="large" color="#0000ff" />;}



  return (

      <View style={styles.container}>
        <Text style={styles.header}>Account</Text>

        {/* Username and Home Team */}
        <View style={styles.infoContainer}>
          <UserInfo displayName={user?.displayName || 'User'} photoURL={user?.photoURL || 'https://via.placeholder.com/50'} />
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


        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={() => auth().signOut()}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

  );
};

const styles = StyleSheet.create({
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
