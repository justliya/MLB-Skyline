import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import axios from 'axios'; // Import Axios
import { CompositeScreenProps } from '@react-navigation/native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { SvgUri } from 'react-native-svg';
import { MaterialTopTabParamList, BottomTabParamList, RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/AuthProvider';
import { TouchableOpacity } from 'react-native-gesture-handler';

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

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('https://get-recent-games-114778801742.us-central1.run.app/recent-games');
        setGames(response.data); // Update state with fetched games
      } catch (error) {
        console.error('Error fetching games:', error);
        Alert.alert('Error', 'Unable to fetch games. Please try again later.');
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    fetchGames(); // Call the function
  }, []);

  const handleGameSelect = (game: Game) => {
    navigation.navigate('Chat', {
      game: game.gid,
      hometeam: game.hometeam,
      visteam: game.visteam,
    });
  };

  const getTeamLogoUrl = (teamCode: number) => {
    return `https://www.mlbstatic.com/team-logos/${teamCode}.svg`;
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <TouchableOpacity onPress={() => handleGameSelect(item)} style={styles.gameItemContainer}>
      <SvgUri
        uri={getTeamLogoUrl(item.statsapi_game_pk[1][item.visteam])}
        width={40}
        height={40}
        style={styles.teamLogo}
      />
      <Text style={styles.gameItemText}>{`${item.visteam} vs ${item.hometeam}`}</Text>
      <SvgUri
        uri={getTeamLogoUrl(item.statsapi_game_pk[1][item.hometeam])}
        width={40}
        height={40}
        style={styles.teamLogo}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {authLoading ? 'Loading...' : username}!</Text>
      <Text style={styles.subHeader}>User ID: {authLoading ? 'Loading...' : userId}</Text>

      <Text style={styles.sectionHeader}>Select a Game</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading games...</Text>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.gid}
          renderItem={renderGameItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0D1728',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#CCC',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  gameItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1C1C1E',
    marginVertical: 6,
    borderRadius: 10,
  },
  gameItemText: {
    fontSize: 16,
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  teamLogo: {
    marginHorizontal: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default HomeScreen;
