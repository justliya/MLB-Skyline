import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from '../screens/Auth/LoginScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import RegistrationScreen from '../screens/Auth/RegistrationScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ScheduleScreen from '../screens/Home/ScheduleScreen';
import StatsScreen from '../screens/Home/StatsScreen';
import ChatScreen from '../screens/Home/ChatScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// --- Navigation Types ---
export type RootStackParamList = {
  Login: undefined;
  Welcome: { userId: string; username: string };
  SignUp: undefined;
  Main: NavigatorScreenParams<BottomTabParamList> & { userId: string; username: string };
};

export type BottomTabParamList = {
  Home: NavigatorScreenParams<MaterialTopTabParamList>;
  Chat: { userId: string; username: string };
  Profile: { userId: string; username: string };
};

export type MaterialTopTabParamList = {
  Main: undefined; // HomeScreen is the default for the MaterialTopTabs
  Schedule: undefined;
  Stats: undefined;
};

// Combining Navigation Props
export type MainScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<MaterialTopTabParamList, 'Main'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'Home'>,
    StackScreenProps<RootStackParamList, 'Main'>
  >
>;

export type ProfileScreenProps = BottomTabScreenProps<BottomTabParamList, 'Profile'>;

// --- Navigators ---
const RootStack = createStackNavigator<RootStackParamList>();
const BottomTab = createBottomTabNavigator<BottomTabParamList>();
const MaterialTopTab = createMaterialTopTabNavigator<MaterialTopTabParamList>();

// --- MaterialTopTabs Component ---
function HomeTabs() {
  return (
    <MaterialTopTab.Navigator initialRouteName="Main">
      <MaterialTopTab.Screen name="Main" component={HomeScreen} />
      <MaterialTopTab.Screen name="Schedule" component={ScheduleScreen} />
      <MaterialTopTab.Screen name="Stats" component={StatsScreen} />
    </MaterialTopTab.Navigator>
  );
}

// --- BottomTabs Component ---
function MainTabs({ route }: StackScreenProps<RootStackParamList, 'Main'>) {
  const { userId, username } = route.params;

  return (
    <BottomTab.Navigator initialRouteName="Home">
      <BottomTab.Screen
        name="Home"
        component={HomeTabs}
        options={{ headerShown: false }}
        initialParams={{ userId, username }} // Pass user info to HomeTabs
      />
      <BottomTab.Screen
        name="Chat"
        component={ChatScreen}
        initialParams={{ userId, username }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId, username }}
      />
    </BottomTab.Navigator>
  );
}

// --- RootStack Component ---
export default function AppNavigator() {
  return (

        <RootStack.Navigator initialRouteName="Login">
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="SignUp" component={RegistrationScreen} />
          <RootStack.Screen
            name="Welcome"
            component={WelcomeScreen}
            initialParams={{ userId: '', username: '' }}
          />
          <RootStack.Screen
            name="Main"
            component={MainTabs}
            initialParams={{ userId: '', username: '' }}
          />
        </RootStack.Navigator>
      );
}
