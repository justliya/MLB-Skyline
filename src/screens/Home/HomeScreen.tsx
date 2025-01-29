import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // ✅ Import Picker for interval selection
import { CompositeScreenProps } from '@react-navigation/native';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialTopTabParamList, BottomTabParamList, RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/AuthProvider'; // ✅ Import Auth Context
import { TouchableOpacity } from 'react-native-gesture-handler';

// ✅ Game object structure
interface Game {
  visteam: string;
  gid: string;
  hometeam: string;
}

// ✅ Correctly inherit navigation props
type HomeScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<MaterialTopTabParamList, 'Main'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList>,
    StackScreenProps<RootStackParamList>
  >
>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, loading: authLoading } = useAuth(); // ✅ Get user info from Auth Context
  const username = user?.email || 'Anonymous';
  const userId = user?.uid || 'Guest';

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInterval, setSelectedInterval] = useState<number>(10); // ✅ Default interval

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
  
    navigation.navigate('Chat', {
      game, // ✅ Pass the selected game
      chatMode: 'default', // ✅ Set default chat mode
      interval: selectedInterval, // ✅ Pass the selected interval
      userId, // ✅ Pass userId
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Welcome, {authLoading ? 'Loading...' : username}!</Text>
      <Text style={styles.subHeader}>User ID: {authLoading ? 'Loading...' : userId}</Text>

      {/* ✅ Interval Selection */}
      <View style={styles.intervalContainer}>
        <Text style={styles.intervalLabel}>Select Interval:</Text>
        <Picker selectedValue={selectedInterval} onValueChange={(itemValue) => setSelectedInterval(itemValue)} style={styles.picker}>
          <Picker.Item label="10 seconds" value={10} />
          <Picker.Item label="20 seconds" value={20} />
          <Picker.Item label="30 seconds" value={30} />
        </Picker>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading games...</Text>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.gid}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleGameSelect(item)} style={styles.gameItem}>
              <Text style={styles.gameText}>{`${item.hometeam} vs ${item.visteam}`}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0D1728' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  subHeader: { fontSize: 16, color: '#CCC', marginBottom: 16 },
  intervalContainer: { marginBottom: 20, backgroundColor: '#1C1C1E', borderRadius: 10, padding: 10 },
  intervalLabel: { fontSize: 16, color: '#FFF', marginBottom: 5 },
  picker: { color: '#FFF', backgroundColor: '#1C1C1E' },
  gameItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#444' },
  gameText: { fontSize: 18, color: '#FFF' },
});

export default HomeScreen;