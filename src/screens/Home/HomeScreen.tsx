import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert, Button } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialTopTabParamList, BottomTabParamList, RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/AuthProvider';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SvgUri } from 'react-native-svg';

// Game object structure
interface Game {
  gid: string;
  visteam: string;
  hometeam: string;
  statsapi_game_pk: [
    number,
    {
      [teamCode: string]: number;
    }
  ];
}

// Correctly inherit navigation props
type HomeScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<MaterialTopTabParamList, 'Main'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList>,
    StackScreenProps<RootStackParamList>
  >
>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, loading: authLoading } = useAuth();
  const username = user?.email || 'Anonymous';
  const userId = user?.uid || 'Guest';

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInterval, setSelectedInterval] = useState<number>(10);
  const [chatMode, setChatMode] = useState<string>('default');

  useEffect(() => {
    fetch('https://get-recent-games-114778801742.us-central1.run.app/recent-games')
      .then((response) => response.json())
      .then((data: Game[]) => {
        setGames(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching games:', error);
        Alert.alert('Error', 'Unable to fetch games. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleGameSelect = (game: Game) => {
    console.log(`Selected game: ${game.hometeam} vs ${game.visteam}, Interval: ${selectedInterval}s`);
    navigation.navigate('Chat', { game, chatMode, interval: selectedInterval });
  };

  const getTeamLogoUrl = (teamCode: number) => {
    return `https://www.mlbstatic.com/team-logos/${teamCode}.svg`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Welcome, {authLoading ? 'Loading...' : username}!</Text>
      <Text style={styles.subHeader}>User ID: {authLoading ? 'Loading...' : userId}</Text>
      <Text style={styles.header}>Select a Game</Text>
      <FlatList
        data={games}
        keyExtractor={(item, index) => `${item.gid}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleGameSelect(item)} style={styles.gameItemContainer}>
            {loading && <Text>Loading...</Text>}
            <SvgUri uri={getTeamLogoUrl(item.statsapi_game_pk[1][item.visteam])} width={40} height={40} style={styles.teamLogo} />
            <Text style={styles.gameItemText}>{`${item.visteam} vs ${item.hometeam}`}</Text>
            <SvgUri uri={getTeamLogoUrl(item.statsapi_game_pk[1][item.hometeam])} width={40} height={40} style={styles.teamLogo} />
          </TouchableOpacity>
        )}
      />
      <View style={styles.settings}>
        <Button title="Casual Mode" onPress={() => setChatMode('casual')} />
        <Button title="Technical Mode" onPress={() => setChatMode('technical')} />
        <Button title="Set Interval: 10s" onPress={() => setSelectedInterval(10)} />
        <Button title="Set Interval: 20s" onPress={() => setSelectedInterval(20)} />
        <Button title="Set Interval: 30s" onPress={() => setSelectedInterval(30)} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  subHeader: { fontSize: 16, color: '#CCC', marginBottom: 16 },
  container: { flex: 1, padding: 16, backgroundColor: '#0D1728' },
  gameItemContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  teamLogo: { marginHorizontal: 8 },
  gameItemText: { fontSize: 18, flex: 1, textAlign: 'center', color: '#FFF' },
  settings: { marginTop: 16 },
});

export default HomeScreen;
