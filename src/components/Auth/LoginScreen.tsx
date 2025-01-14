import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const LoginScreen = () => {
  const navigation = useNavigation(); // Hook to get navigation instance
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email and Password Login
  const loginWithEmailAndPass = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(res => {
        console.log(res);
        Alert.alert('Success', 'Logged In');
        navigation.navigate('Welcome');
      })
      .catch(err => {
        console.log(err);
        Alert.alert('Error', err.message || 'Login failed. Please try again.');
      });
  };

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '261515222562-jreu1tca61ai5opf4c11bk9d2ndm7cph.apps.googleusercontent.com',
    });
  }, []);

  // Google Sign-In Function
  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the user's ID token
      const signInResult = await GoogleSignin.signIn();

      // Retrieve the ID token from the result
      let idToken = signInResult.data?.idToken || signInResult.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      console.log('User signed in with Google:', userCredential);
      Alert.alert('Success', 'Signed in with Google!');
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', error.message || 'Google Sign-In failed. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={text => setPassword(text)}
        secureTextEntry
        autoCapitalize="none"
      />
      {/* Email Login Button */}
      <TouchableOpacity style={styles.button} onPress={loginWithEmailAndPass}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      {/* Google Sign-In Button */}
      <TouchableOpacity style={styles.button} onPress={onGoogleButtonPress}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4285F4', // Google brand color
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
