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
import { SafeAreaView} from 'react-native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import RegistrationScreen from '../screens/Auth/RegistrationScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ChartScreen from '../screens/Home/ChartScreen';
import StatsScreen from '../screens/Home/StatsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ChatScreen from '../screens/Home/ChatScreen';
import { Icon } from '@rneui/themed';



// --- Navigation Types ---
export type RootStackParamList = {
  Login: undefined;
  Welcome: { userId: string, username: string } | undefined;
  SignUp: undefined;
  Main: undefined
  Chat: { game: string, hometeam: string, visteam: string, statsapi_game_pk: [number, { [teamCode: string]: number }] } | undefined;
};

export type BottomTabParamList = {
  Home: NavigatorScreenParams<MaterialTopTabParamList>;
  Profile: undefined;
};

export type MaterialTopTabParamList = {
  Main: { game: string, hometeam: string, visteam: string, statsapi_game_pk: [number, { [teamCode: string]: number }] } | undefined;
  Chat: {game: string, hometeam: string, visteam: string,  statsapi_game_pk: [number, { [teamCode: string]: number }] } | undefined;
  Chart: {game: string, hometeam: string, visteam: string, statsapi_game_pk: [number, { [teamCode: string]: number }] } | undefined;
  Stats: {game: string, hometeam: string, visteam: string, statsapi_game_pk: [number, { [teamCode: string]: number }] } | undefined;
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
  const { game, hometeam, visteam, statsapi_game_pk } = route.params ?? {}; // Ensure valid game data
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
        <MaterialTopTab.Screen name="Main" component={ChatScreen} initialParams={{ game, hometeam, visteam, statsapi_game_pk }} />
        <MaterialTopTab.Screen name="Chart" component={ChartScreen} initialParams={{ game, hometeam, visteam, statsapi_game_pk }} />
        <MaterialTopTab.Screen name="Stats" component={StatsScreen} initialParams={{ game, hometeam, visteam, statsapi_game_pk }} />
      </MaterialTopTab.Navigator>
    </SafeAreaView>
  );
}


const homeIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="home" type="feather" color={color} size={size} />
);

const profileIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="user" type="feather" color={color} size={size} />
);
// --- BottomTabs Component ---
function MainTabs() {


  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // Hides the bottom tab header
        tabBarStyle: { backgroundColor: '#0D1728', height: 65}, // Customizes bottom tab bar
        tabBarLabelStyle: { color: '#FFF', fontSize: 12 },
        tabBarActiveTintColor: '#FF6A3C',
      }}
    >
      <BottomTab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: homeIcon }} />
      <BottomTab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: profileIcon }} />
    </BottomTab.Navigator>
  );
}

// --- RootStack Component ---
export default function AppNavigator() {

  return (
    <RootStack.Navigator initialRouteName="Login">
      <RootStack.Screen name="Login" component={LoginScreen}options={{ headerShown: false }} />
      <RootStack.Screen name="SignUp" component={RegistrationScreen}  options={{ headerShown: false }}/>
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
          title: `${route.params?.hometeam} vs  ${route.params?.visteam}`,
          headerStyle: { backgroundColor: '#0D1728' }, // Match the background color of the top tabs
          headerTintColor: '#FFFFFF', // Set the text color to white
        })}
      />
    </RootStack.Navigator>
  );
}