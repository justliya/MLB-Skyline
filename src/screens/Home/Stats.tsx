import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
} from 'react-native';

const statsData = [
  { year: 2018, age: 33, team: 'LAD', BA: '.312', AB: 365, H: 114, RBI: 52, HR: 14 },
  { year: 2017, age: 32, team: 'LAD', BA: '.322', AB: 457, H: 147, RBI: 71, HR: 21 },
  { year: 2016, age: 31, team: 'LAD', BA: '.275', AB: 556, H: 153, RBI: 90, HR: 27 },
  { year: 2015, age: 30, team: 'LAD', BA: '.294', AB: 385, H: 113, RBI: 60, HR: 16 },
  { year: 2014, age: 29, team: 'LAD', BA: '.340', AB: 288, H: 98, RBI: 43, HR: 7 },
  { year: 2013, age: 28, team: 'NYM', BA: '.280', AB: 200, H: 56, RBI: 16, HR: 2 },
];

const StatsScreen = () => {
  const renderStatItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.year}</Text>
      <Text style={styles.cell}>{item.age}</Text>
      <Text style={styles.cell}>{item.team}</Text>
      <Text style={styles.cell}>{item.BA}</Text>
      <Text style={styles.cell}>{item.AB}</Text>
      <Text style={styles.cell}>{item.H}</Text>
      <Text style={styles.cell}>{item.RBI}</Text>
      <Text style={styles.cell}>{item.HR}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor="#A6A6A6" />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Tab Menu */}
      <View style={styles.tabMenu}>
        <Text style={[styles.tabItem, styles.activeTab]}>Highlights</Text>
        <Text style={styles.tabItem}>Schedule</Text>
        <Text style={styles.tabItem}>Stats</Text>
      </View>

      {/* Featured Player */}
      <View style={styles.featuredPlayer}>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/JustinTurner.jpg' }}
          style={styles.playerImage}
        />
        <Text style={styles.playerName}>Justin Turner</Text>
        <Text style={styles.playerPosition}>3B</Text>
      </View>

      {/* Team Info */}
      <Text style={styles.teamDivision}>NL WEST</Text>
      <Text style={styles.teamName}>LOS ANGELES DODGERS</Text>

      {/* Stats Table Tabs */}
      <View style={styles.statsTabs}>
        <Text style={styles.statsTab}>Summary</Text>
        <Text style={[styles.statsTab, styles.activeStatsTab]}>Batting</Text>
        <Text style={styles.statsTab}>Fielding</Text>
        <Text style={styles.statsTab}>Pitching</Text>
      </View>

      {/* Stats Table */}
      <View style={styles.statsHeader}>
        <Text style={styles.headerCell}>Year</Text>
        <Text style={styles.headerCell}>Age</Text>
        <Text style={styles.headerCell}>Team</Text>
        <Text style={styles.headerCell}>BA</Text>
        <Text style={styles.headerCell}>AB</Text>
        <Text style={styles.headerCell}>H</Text>
        <Text style={styles.headerCell}>RBI</Text>
        <Text style={styles.headerCell}>HR</Text>
      </View>
      <FlatList data={statsData} renderItem={renderStatItem} keyExtractor={(item) => item.year.toString()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001345',
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    fontSize: 18,
    color: '#333',
  },
  tabMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tabItem: {
    fontSize: 16,
    color: '#FFF',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6A3C',
  },
  featuredPlayer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  playerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  playerName: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  playerPosition: {
    fontSize: 14,
    color: '#FFF',
  },
  teamDivision: {
    textAlign: 'center',
    fontSize: 14,
    color: '#A6A6A6',
    marginTop: 10,
  },
  teamName: {
    textAlign: 'center',
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  statsTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statsTab: {
    fontSize: 16,
    color: '#A6A6A6',
  },
  activeStatsTab: {
    color: '#FFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6A3C',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  headerCell: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  cell: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    flex: 1,
  },
});

export default StatsScreen;
