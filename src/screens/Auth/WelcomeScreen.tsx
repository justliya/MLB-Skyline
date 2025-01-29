/* eslint-disable react/react-in-jsx-scope */
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/AuthProvider'; // ✅ Import useAuth

type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth(); // ✅ Get user info from Auth Context

  const userId = user?.uid || 'Guest';
  const username = user?.email || 'Anonymous';

  return (
    <View style={styles.container}>
      <Image source={require('./logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome, {username}!</Text>
      <Text style={styles.subTitle}>Your User ID: {userId}</Text>

      {/* ✅ Navigate to Main with user info */}
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
