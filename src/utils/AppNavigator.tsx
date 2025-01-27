/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Octicons';
import { SafeAreaView} from 'react-native';
import HomeScreen from '../screens/Home/HomeScreen';
import Schedule from '../screens/Home/Schedule';
import Stats from '../screens/Home/Stats';
import AccountScreen from '../screens/Account/AccountScreen';
import LiveScreen from '../screens/Live/LiveScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import RegistrationScreen from '../screens/Auth/RegistrationScreen';
import { Chat, OverlayProvider, MessageList, AITypingIndicatorView } from 'stream-chat-react-native';
import { StreamChat } from "stream-chat";



const BottomTab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();
const client = StreamChat.getInstance('92fs92tdpkgd');
const isMessageAIGenerated = (message) => !!message.ai_generated;
// Main Bottom Tab Navigator
const AppNavigator = () => {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Prevent any additional headers from being shown
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Live':
              iconName = 'broadcast';
              break;
            case 'Account':
              iconName = 'person';
              break;
            default:
              iconName = 'question';
          }
          return <Icon name={iconName} size={size || 24} color={color} />;
        },
      })}
    >
      <BottomTab.Screen name="Home" component={HomeTabNavigator} />
      <BottomTab.Screen name="Live" component={LiveScreen} />
      <BottomTab.Screen name="Account" component={AccountScreen} />
    </BottomTab.Navigator>
  );
};





// Home Top Tab Navigator
const HomeTabNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D1728' }}>
      <TopTab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#0D1728' },
          tabBarIndicatorStyle: { backgroundColor: '#FFFFFF', height: 2 },
          tabBarLabelStyle: { fontSize: 14, color: '#CCCCCC' },
        }}
      >
        <TopTab.Screen name="Highlights" component={HomeScreen} />
        <TopTab.Screen name="Schedule" component={Schedule} />
        <TopTab.Screen name="Stats" component={Stats} />
      </TopTab.Navigator>
    </SafeAreaView>
  );
};



const Authentication = () => {
  return (
    <OverlayProvider>
      <Chat client={client} isMessageAIGenerated={isMessageAIGenerated}>
      <MessageList />
      <AITypingIndicatorView />
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        {/* Welcome Screen */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ title: 'Welcome', headerShown: false }}
        />
        {/* Main App: Bottom Tab Navigator */}
        <Stack.Screen
          name="SignUp"
          component={RegistrationScreen}
          options={{ headerShown: false }}
        />

        {/* Main App: Bottom Tab Navigator */}
        <Stack.Screen
          name="Main"
          component={AppNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      </Chat>
      </OverlayProvider>
  );
};


export default Authentication;




