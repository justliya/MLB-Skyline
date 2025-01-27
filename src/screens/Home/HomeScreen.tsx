import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useChat } from '../../context/ChatContext';

// Define the structure of a game object
interface Game {
  visteam: string;
  gid: string;
  hometeam: string;
}

// Define the props for the HomeScreen
interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [games, setGames] = useState<Game[]>([]);
  const { setSelectedGame, setChatMode, setInterval } = useChat();

  useEffect(() => {
    fetch('https://get-recent-games-114778801742.us-central1.run.app/recent-games')
      .then((response) => response.json())
      .then((data: Game[]) => setGames(data))
      .catch(console.error);
  }, []);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    navigation.navigate('Chat');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Game</Text>
      <FlatList
        data={games}
        keyExtractor={(item, index) => `${item.gid}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleGameSelect(item)}>
            <Text style={styles.gameItem}>{`${item.hometeam} vs ${item.visteam}`}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.settings}>
        <Button title="Casual Mode" onPress={() => setChatMode('casual')} />
        <Button title="Technical Mode" onPress={() => setChatMode('technical')} />
        <Button title="Set Interval: 10s" onPress={() => setInterval(10)} />
        <Button title="Set Interval: 20s" onPress={() => setInterval(20)} />
        <Button title="Set Interval: 30s" onPress={() => setInterval(30)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, marginBottom: 16 },
  gameItem: { fontSize: 18, marginVertical: 8 },
  settings: { marginTop: 16 },
});

export default HomeScreen;
