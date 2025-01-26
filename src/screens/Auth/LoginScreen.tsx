/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '261515222562-jreu1tca61ai5opf4c11bk9d2ndm7cph.apps.googleusercontent.com',
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
      <Image
        source={require('./logo.png')} // Replace with your logo path
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '95%',
          marginVertical: 100,
          borderRadius: 150,
          marginBottom:2,


        }}
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
    backgroundColor: '#0D1728',
    padding: 40,
    justifyContent: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 25,
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
    marginBottom:20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFF',
    marginBottom:20,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#FFF',
    marginBottom:20,
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
