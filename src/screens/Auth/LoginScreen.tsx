/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { useChat } from '../../context/ChatContext'; // Import useChat

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useChat(); // Get loginUser from context

  const loginWithEmailAndPass = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(res => {
        const userData = {
          id: res.user.uid,
          name: res.user.displayName || email.split('@')[0],
          email: res.user.email,
        };
        loginUser(userData); // Initialize chat user
        Alert.alert('Success', 'Logged In');
        navigation.navigate('Welcome');
      })
      .catch(err => {
        console.log(err);
        Alert.alert('Error', err.message || 'Login failed. Please try again.');
      });
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  async function onGoogleButtonPress() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult.data?.idToken || signInResult.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const userData = {
        id: userCredential.user.uid,
        name: userCredential.user.displayName,
        email: userCredential.user.email,
      };
      loginUser(userData); // Initialize chat user
      Alert.alert('Success', 'Signed in with Google!');
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', error.message || 'Google Sign-In failed. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('./logo.png')} // Replace with your logo path
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
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
        onChangeText={text => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          placeholderTextColor="#A6A6A6"
          value={password}
          onChangeText={text => setPassword(text)}
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
    backgroundColor: '#001345',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: 150,
    marginBottom: 30,
    alignSelf: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFF',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#FFF',
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
    marginBottom: 15,
  },
  eyeIcon: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#FF6A3C',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
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
    marginTop: 20,
  },
  signUpText: {
    color: '#FF6A3C',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
