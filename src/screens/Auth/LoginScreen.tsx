
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator'; // Adjust the path if necessary

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '261515222562-o4k6rvtv8rb77dmm92g5nokc0rcn7m0s.apps.googleusercontent.com', // Replace with your web client ID
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });
  }, []);

  const loginWithEmailAndPass = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then((res: FirebaseAuthTypes.UserCredential) => {
        const user = res.user;
        console.log('User details (email login):', user);
        if (user.uid) {
          navigation.navigate('Welcome', { userId: user.uid, username: user.email || '' });
        } else {
          throw new Error('User ID (uid) is missing in the Firebase response');
        }
      })
      .catch((err) => {
        console.error('Error during email login:', err);
        Alert.alert('Error', err.message || 'Login failed. Please try again.');
      });
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn();
      let token = userInfo.data?.idToken;

      if (!token) {
        throw new Error('No ID token found during Google Sign-In');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(token);
      const userCredential = await auth().signInWithCredential(googleCredential);

      const user = userCredential.user;
      console.log('User details (Google Sign-In):', user);

      navigation.navigate('Welcome', { userId: user.uid, username: user.email || '' });
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Google Sign-In is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services are not available.');
      } else {
        Alert.alert('Error', error.message || 'Google Sign-In failed. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./logo.png')} // Replace with your logo path
        style={styles.logo}
      />
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        onPress={onGoogleButtonPress}
      />;

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.divider} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A6A6A6"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          placeholderTextColor="#A6A6A6"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={loginWithEmailAndPass}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        Don’t have an account?{' '}
        <Text style={styles.signUpText} onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1728',
    padding: 40,
    justifyContent: 'center',
  },
  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    marginVertical: 100,
    borderRadius: 150,
    marginBottom: 2,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#FFF',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#FF6A3C',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 45,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 45,
  },
  signUpText: {
    color: '#FF6A3C',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
