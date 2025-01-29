import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ route, navigation }) => {
  const { userId, username } = route.params;

  return (
    <View style={styles.container}>
      <Image source={require('./logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome, {username || 'Guest'}!</Text>
      <Text style={styles.subTitle}>Your User ID: {userId}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.buttonText}>Continue to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1728' },
  logo: { width: 200, height: 200, marginBottom: 20 },
  title: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  subTitle: { fontSize: 16, color: '#CCC', marginBottom: 20 },
  button: { backgroundColor: '#FF6A3C', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default WelcomeScreen;
