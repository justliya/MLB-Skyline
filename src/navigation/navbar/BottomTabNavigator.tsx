
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccountScreen from '../../screens/Account/AccountScreen';
import HomeScreen from '../../screens/Home/HomeScreen';
import LiveScreen from '../../screens/Live/LiveScreen';

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
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

