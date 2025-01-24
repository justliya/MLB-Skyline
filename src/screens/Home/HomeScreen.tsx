import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { navigate } from '../../utils/NavigationUtils'; // Import navigation utility

const HomeScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <Image
        source={{ uri: 'https://via.placeholder.com/800x400' }} // Replace with a relevant image
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
      {/* Sample Cards */}
      <View style={styles.cardsContainer}>
        {[1, 2, 3].map((_, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardHeadline}>Headline {index + 1}</Text>
            <Text style={styles.cardDescription}>
              Description duis aute irure dolor in reprehenderit in voluptate velit.
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A23',
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
  cardsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
  },
  cardHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
});
