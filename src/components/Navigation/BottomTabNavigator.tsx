
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccountScreen from '../Account/AccountScreen';
import HomeScreen from '../Home/HomeScreen';
import LiveScreen from '../Live/LiveScreen';
import TriviaScreen from '../Trivia/TriviaScreen';
import TradeScreen from '../Trade/TradeScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 10 },
      }}
    >
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Trivia" component={TriviaScreen} />
      <Tab.Screen name="Trade/Chat" component={TradeScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

