import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { SvgUri } from 'react-native-svg';
import { MaterialTopTabParamList, BottomTabParamList, RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/AuthProvider';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Game {
  gamePk: number;
  gameDate: string;
  teams: {
    away: {
      name: string;
      id: number;
    };
    home: {
      name: string;
      id: number;
    };
  };
  score: {
    away: number;
    home: number;
  };
  status: string;
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
    fetch('https://get-recent-games-114778801742.us-central1.run.app/games?sportId=1&season=2024&game_type=R')
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
    const params = {
      game: game.gamePk,
      date: game.gameDate,
      teams: game.teams,
      score: game.score,
    };
    console.log('Navigating to Chat with params:', params);
    navigation.navigate('Chat', params);
  };

  const getTeamLogoUrl = (teamId: number) => {
    return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <TouchableOpacity onPress={() => handleGameSelect(item)} style={styles.gameItemContainer}>
      <SvgUri
        uri={getTeamLogoUrl(item.teams.away.id)}
        width={40}
        height={40}
        style={styles.teamLogo}
      />
      <Text style={styles.gameItemText}>{`${item.teams.away.name} vs ${item.teams.home.name}`}</Text>
      <SvgUri
        uri={getTeamLogoUrl(item.teams.home.id)}
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
          keyExtractor={(item) => item.gamePk.toString()}
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
