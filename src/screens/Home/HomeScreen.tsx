import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { SvgUri } from 'react-native-svg';
import { MaterialTopTabParamList, BottomTabParamList, RootStackParamList } from '../../navigation/AppNavigator';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';


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



  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    const params = {
      game: game.gid,
      hometeam: game.hometeam,
      visteam: game.visteam,
      statsapi_game_pk: game.statsapi_game_pk,
    };
    console.log('Navigating to Chat with params:', params);
    navigation.navigate('Chat', params);
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
      <Text style={styles.gameItemText}>{`${item.visteam}   vs   ${item.hometeam}`}</Text>
      <SvgUri
        uri={getTeamLogoUrl(item.statsapi_game_pk[1][item.hometeam])}
        width={40}
        height={40}
        style={styles.teamLogo}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>Select an MLB game to receive AI-powered play-by-play
          strategy explanations during the game.
        </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0D1728',
  },
  subHeader: {
    fontWeight: 'regular',
    fontSize: 16,
    color: '#CCC',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 17,
    color: '#CCC',
    marginVertical: 10,
    textAlign: 'center',
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
    backgroundColor: '#EEEAE7',
    marginVertical: 6,
    borderRadius: 10,
  },
  gameItemText: {
    fontFamily: 'poppins',
    fontWeight: 'bold',
    fontSize: 17,
    color: 'black',
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
