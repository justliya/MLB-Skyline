
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SvgUri from 'react-native-svg';
import axios from 'axios';

interface Game {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
}

const ScheduleScreen: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(
          'https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024&gameType=R'
        );
        const data = response.data.dates;
        const formattedGames: Game[] = data.flatMap((date: any) =>
          date.games.map((game: any) => ({
            date: date.date,
            time: game.gameDate.split('T')[1].slice(0, 5),
            homeTeam: game.teams.home.team.name,
            awayTeam: game.teams.away.team.name,
            homeTeamId: game.teams.home.team.id,
            awayTeamId: game.teams.away.team.id,
          }))
        );
        setGames(formattedGames);
        setFilteredGames(formattedGames);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (text === '') {
      setFilteredGames(games);
    } else {
      const lowercasedText = text.toLowerCase();
      const filtered = games.filter(
        (game) =>
          game.homeTeam.toLowerCase().includes(lowercasedText) ||
          game.awayTeam.toLowerCase().includes(lowercasedText)
      );
      setFilteredGames(filtered);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search team schedules..."
            placeholderTextColor="#A6A6A6"
            value={searchTerm}
            onChangeText={handleSearch}
          />
        </View>

        {/* Schedule Cards */}
        {loading ? (
          <ActivityIndicator size="large" color="#E47B00" style={styles.loader} />
        ) : filteredGames.length > 0 ? (
          <View style={styles.scheduleContainer}>
            {filteredGames.map((game, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardDate}>{game.date}</Text>
                <Text style={styles.cardTime}>{game.time}</Text>
                <View style={styles.teamContainer}>
                  <SvgUri
                   source={{ uri: `https://www.mlbstatic.com/team-logos/${game.homeTeamId}.svg` }}
                    width={40} height={40} style={{marginRight: 10}}
                  />
                  <Text style={styles.teamText}>{game.homeTeam}</Text>
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={styles.teamContainer}>
                <SvgUri
                   source={{ uri: `https://www.mlbstatic.com/team-logos/${game.awayTeamId}.svg` }}
                    width={40} height={40} style={{marginRight: 10}}
                  />
                  <Text style={styles.teamText}>{game.awayTeam}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No matches found for "{searchTerm}"</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0D1728',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D1728',
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
  },
  loader: {
    marginTop: 20,
  },
  scheduleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
  },
  card: {
    backgroundColor: '#E47B00',
    borderRadius: 8,
    width: '45%',
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardDate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 5,
  },
  cardTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 10,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  teamText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 10,
  },
  vsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 5,
  },
  noResults: {
    alignItems: 'center',
    marginTop: 20,
  },
  noResultsText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});
