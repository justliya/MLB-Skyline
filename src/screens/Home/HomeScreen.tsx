/* eslint-disable eol-last */
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { MaterialTopTabParamList } from '../../navigation/AppNavigator'; // Adjust the path to your AppNavigator

// Define the structure of a game object
interface Game {
  visteam: string; // Visiting team
  gid: string; // Unique game ID
  hometeam: string; // Home team
}

type HomeScreenProps = MaterialTopTabScreenProps<MaterialTopTabParamList, 'Main'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ route }) => {
  const { userId, username } = route.params; // Extract user info from route.params
  const [games, setGames] = useState<Game[]>([]); // State to hold games list

  // Fetch recent games on component mount
  useEffect(() => {
    fetch('https://get-recent-games-114778801742.us-central1.run.app/recent-games')
      .then((response) => response.json())
      .then((data: Game[]) => setGames(data))
      .catch((error) => {
        console.error('Error fetching games:', error);
        Alert.alert('Error', 'Unable to fetch games. Please try again later.');
      });
  }, []);

  // Handle game selection
  const handleGameSelect = (game: Game) => {
    console.log(`Selected game: ${game.hometeam} vs ${game.visteam}`);
    Alert.alert('Game Selected', `${game.hometeam} vs ${game.visteam}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Welcome, {username}!</Text>
      <FlatList
        data={games}
        keyExtractor={(item, index) => `${item.gid}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleGameSelect(item)}>
            <Text style={styles.gameItem}>{`${item.hometeam} vs ${item.visteam}`}</Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gameItem: {
    fontSize: 18,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default HomeScreen;