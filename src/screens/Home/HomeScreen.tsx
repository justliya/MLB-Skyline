import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import { useChat } from '../../context/ChatContext';

// Define the structure of a game object
interface Game {
  gid: string;
  visteam: string;
  hometeam: string;
  statsapi_game_pk: [
    number,
    {
      [teamCode: string]: number; // Allows for dynamic team codes like "SDN" or "ARI"
    }
  ];
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

  const getTeamLogoUrl = (teamCode: number) => {
    const url = `https://www.mlbstatic.com/team-logos/${teamCode}.svg`;
    return url;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Game</Text>
      <FlatList
        data={games}
        keyExtractor={(item, index) => `${item.gid}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleGameSelect(item)} style={styles.gameItemContainer}>
            <SvgUri uri={getTeamLogoUrl(item.statsapi_game_pk[1][item.visteam])} width={40} height={40} style={styles.teamLogo} />
            <Text style={styles.gameItemText}>{`${item.visteam} vs ${item.hometeam}`}</Text>
            <SvgUri uri={getTeamLogoUrl(item.statsapi_game_pk[1][item.hometeam])} width={40} height={40} style={styles.teamLogo} />
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
  gameItemContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  teamLogo: { marginHorizontal: 8 },
  gameItemText: { fontSize: 18, flex: 1, textAlign: 'center' },
  settings: { marginTop: 16 },
});

export default HomeScreen;
