import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import RegistrationScreen from '../screens/Auth/RegistrationScreen';
import Schedule from '../screens/Home/Schedule';
import Stats from '../screens/Home/Stats';
import HomeScreen from '../screens/Home/HomeScreen';
import BottomTabNavigator from '../navigation/BottomTabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ title: 'Welcome', headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={RegistrationScreen}
        options={{ title: 'Sign Up', headerShown: false }}
      />
      <Stack.Screen
        name="Schedule"
        component={Schedule}
        options={{ title: 'Schedule', headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Highlights', headerShown: false }}
      />
      <Stack.Screen
        name="Stats"
        component={Stats}
        options={{ title: 'Stats', headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator} // Reusable Bottom Tab Navigator
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
