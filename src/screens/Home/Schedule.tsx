import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { navigate } from '../../utils/NavigationUtils';


const ScheduleScreen: React.FC = () => {
  const games = [
    { date: 'Mar. 30', time: '7 PM', homeTeam: 'Angels', awayTeam: 'Cubs' },
    { date: 'Mar. 30', time: '7 PM', homeTeam: 'Angels', awayTeam: 'Cubs' },
    { date: 'Mar. 30', time: '7 PM', homeTeam: 'Angels', awayTeam: 'Cubs' },
    { date: 'Mar. 30', time: '7 PM', homeTeam: 'Angels', awayTeam: 'Cubs' },
    { date: 'Mar. 30', time: '7 PM', homeTeam: 'Angels', awayTeam: 'Cubs' },
    { date: 'Mar. 30', time: '7 PM', homeTeam: 'Angels', awayTeam: 'Cubs' },
    { date: 'Mar. 30', time: '7 PM', homeTeam: 'Angels', awayTeam: 'Cubs' },
    { date: 'Mar. 30', time: '7 PM', homeTeam: 'Angels', awayTeam: 'Cubs' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <Image
        source={{
          uri: 'https://via.placeholder.com/800x400', // Replace with actual header image URL
        }}
        style={styles.headerImage}
      />

      {/* AI Coach Section */}
      <View style={styles.aiCoachContainer}>
        <Text style={styles.aiCoachText}>AI Coach</Text>
      </View>

     {/* Tab Navigation Buttons */}
           <View style={styles.navTabs}>
             <TouchableOpacity
               style={styles.tabButton}
               onPress={() => navigate('Schedule')} // Navigate to Schedule Tab
             >
               <Text style={styles.tabText}>Schedule</Text>
             </TouchableOpacity>
             <TouchableOpacity
               style={styles.tabButton}
               onPress={() => navigate('Stats')} // Navigate to Stats Tab
             >
               <Text style={styles.tabText}>Stats</Text>
             </TouchableOpacity>
             <TouchableOpacity
               style={styles.tabButton}
               onPress={() => navigate('Home')} // Navigate to Stats Tab
             >
               <Text style={styles.tabText}>Highlights</Text>
             </TouchableOpacity>
           </View>

      {/* Schedule Cards */}
      <View style={styles.scheduleContainer}>
        {games.map((game, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardText}>
              {game.date} {game.time}
            </Text>
            <Text style={styles.cardText}>
              {game.homeTeam} VS {game.awayTeam}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#001F54',
    },
    headerImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    aiCoachContainer: {
      padding: 10,
      alignItems: 'center',
    },
    aiCoachText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    navTabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#A6A6A6',
        paddingVertical: 10,
      },
      tabButton: {
        paddingVertical: 5,
      },
      tabText: {
        color: '#A6A6A6',
        fontSize: 16,
      },
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: 1,
      borderBottomColor: '#A6A6A6',
      paddingVertical: 10,
    },
    tab: {
      color: '#A6A6A6',
      fontSize: 16,
    },
    activeTab: {
      color: 'white',
      fontWeight: 'bold',
      borderBottomWidth: 2,
      borderBottomColor: 'white',
      paddingBottom: 5,
    },
    inactiveTab: {
      color: '#A6A6A6',
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
    cardText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
    },
  });
