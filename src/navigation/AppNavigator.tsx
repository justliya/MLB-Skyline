/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import RegistrationScreen from '../screens/Auth/RegistrationScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ScheduleScreen from '../screens/Home/ScheduleScreen';
import StatsScreen from '../screens/Home/StatsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ChatScreen from '../screens/Home/ChatScreen';

// --- Navigation Types ---
export type RootStackParamList = {
  Login: undefined;
  Welcome: { userId: string, username: string } | undefined;
  SignUp: undefined;
  Main: undefined;
  Chat: {
    gamePk: number;
    gameDate: string;
    teams: {
      away: {
        name: string;
        id: number;
      };
      home: {
        name: string;
        id: number;
      };
    };
    score: {
      away: number;
      home: number;
    };
  } | undefined;
};

export type BottomTabParamList = {
  Home: NavigatorScreenParams<MaterialTopTabParamList>;
  Profile: undefined;
};

export type MaterialTopTabParamList = {
  Main: undefined; // HomeScreen is the default for the MaterialTopTabs
  Chat: {
    gamePk: number;
    gameDate: string;
    teams: {
      away: {
        name: string;
        id: number;
      };
      home: {
        name: string;
        id: number;
      };
    };
    score: {
      away: number;
      home: number;
    };
  } | undefined;
  Schedule: undefined;
  Stats: undefined;
};

// --- Combining Navigation Props ---
export type MainScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<MaterialTopTabParamList, 'Main'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList>,
    StackScreenProps<RootStackParamList>
  >
>;

export type ProfileScreenProps = BottomTabScreenProps<BottomTabParamList, 'Profile'>;

// --- Navigators ---
const RootStack = createStackNavigator<RootStackParamList>();
const BottomTab = createBottomTabNavigator<BottomTabParamList>();
const MaterialTopTab = createMaterialTopTabNavigator<MaterialTopTabParamList>();

// --- MaterialTopTabs Component ---
function GameTabs({ route }) {
  const { gamePk, gameDate, teams, score } = route.params ?? {}; // Ensure valid game data
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D1728' }}>
      <MaterialTopTab.Navigator
        initialRouteName="Main"
        screenOptions={{
          tabBarStyle: { backgroundColor: '#0D1728' },
          tabBarIndicatorStyle: { backgroundColor: '#FFFFFF', height: 2 },
          tabBarLabelStyle: { fontSize: 14, color: '#CCCCCC' },
        }}
      >
        <MaterialTopTab.Screen name="Main" component={ChatScreen} initialParams={{ gamePk, gameDate, teams, score }} />
        <MaterialTopTab.Screen name="Schedule" component={ScheduleScreen} initialParams={{ gamePk, gameDate, teams, score }} />
        <MaterialTopTab.Screen name="Stats" component={StatsScreen} initialParams={{ gamePk, gameDate, teams, score }} />
      </MaterialTopTab.Navigator>
    </SafeAreaView>
  );
}

// --- BottomTabs Component ---
function MainTabs() {
  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // Hides the bottom tab header
        tabBarStyle: { backgroundColor: '#0D1728', height: 65 }, // Customizes bottom tab bar
        tabBarLabelStyle: { color: '#FFF', fontSize: 12 },
        tabBarActiveTintColor: '#FF6A3C',
      }}
    >
      <BottomTab.Screen name="Home" component={HomeScreen} />
      <BottomTab.Screen name="Profile" component={ProfileScreen} />
    </BottomTab.Navigator>
  );
}

// --- RootStack Component ---
export default function AppNavigator() {
  return (
    <RootStack.Navigator initialRouteName="Login">
      <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="SignUp" component={RegistrationScreen} options={{ headerShown: false }} />
      <RootStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ title: 'Welcome to Skyline', headerShown: false }}
      />
      <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <RootStack.Screen
        name="Chat"
        component={GameTabs}
        options={({ route }) => ({
          title: `${route.params?.teams.home.name} vs ${route.params?.teams.away.name}`,
          headerStyle: { backgroundColor: '#0D1728' }, // Match the background color of the top tabs
          headerTintColor: '#FFFFFF', // Set the text color to white
        })}
      />
    </RootStack.Navigator>
  );
}
