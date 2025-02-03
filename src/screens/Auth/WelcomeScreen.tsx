/* eslint-disable react/react-in-jsx-scope */
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/AuthProvider';

type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const username = user?.email ? user.email.split('@')[0] : 'Anonymous';

  return (
    <View style={styles.container}>
      <Image source={require('./logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Skyline </Text>
      <Text style={styles.title}> {username}!</Text>
      {/* Navigate to Main with user info */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.buttonText}>Continue to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1728' },
  logo: { width: 300, height: 300, marginBottom: 20, borderRadius: 150 },
  title: { fontSize: 24, color: '#FFF', fontWeight: 'bold', paddingBottom: 20 },
  button: { backgroundColor: '#FF6A3C', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default WelcomeScreen;
