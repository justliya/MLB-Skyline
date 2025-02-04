import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../../hooks/AuthProvider';
import auth from '@react-native-firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Dropdown } from 'react-native-element-dropdown';
import { SvgUri } from 'react-native-svg';
import { Button } from '@rneui/themed';

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, loading } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const username = user?.email ? user.email.split('@')[0] : 'Anonymous';

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
        const data = await response.json();
        const formattedTeams = data.teams.map((team: any) => ({
          label: team.name,
          value: team.name,
          logo: `https://www.mlbstatic.com/team-logos/${team.id}.svg`,
        }));
        setTeams(formattedTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        Alert.alert('Error', 'Failed to load MLB teams.');
      }
    };

    fetchTeams();
  }, []);

  const handleSignOut = () => {
    auth()
      .signOut()
      .then(() => {
        Alert.alert('Success', 'You have been signed out.');
        navigation.navigate('Login');
      })
      .catch((error: Error) => {
        console.error('Sign Out Error:', error);
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Account</Text>

        {/* Username and Home Team */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Username: </Text>
            {username}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Home Team: </Text>
            {selectedTeam ? selectedTeam.label : 'Select a team'}
          </Text>
        </View>

        {/* Home Team Dropdown */}
        <Dropdown
          style={styles.dropdown}
          data={teams}
          labelField="label"
          valueField="value"
          placeholder="Select a Team"
          search
          searchPlaceholder="Search team..."
          value={selectedTeam}
          onChange={(item) => setSelectedTeam(item)}
          renderLeftIcon={() =>
            selectedTeam && (
              <SvgUri uri={selectedTeam.logo} width={30} height={30} style={styles.teamLogo} />
            )
          }
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              <SvgUri uri={item.logo} width={30} height={30} />
              <Text style={styles.teamText}>{item.label}</Text>
            </View>
          )}
        />

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          buttonStyle={styles.signOutButton}
          titleStyle={styles.signOutButtonText}
          onPress={handleSignOut}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1728',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6A3C',
    textAlign: 'center',
    marginVertical: 20,
  },
  infoContainer: {
    marginBottom: 20,
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
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderColor: '#FF6A3C',
    borderWidth: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  teamText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  teamLogo: {
    marginRight: 10,
  },
  signOutButton: {
    backgroundColor: '#FF6A3C',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  signOutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;
