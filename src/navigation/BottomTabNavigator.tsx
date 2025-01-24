/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccountScreen from '../screens/Account/AccountScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import LiveScreen from '../screens/Live/LiveScreen';
import Icon from 'react-native-vector-icons/Octicons';

// Define type for Tab Navigator Routes
type TabParamList = {
  Home: undefined;
  Stats: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          // Map route names to icons
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Stats':
              iconName = 'graph'; // Changed for relevance
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stats" component={LiveScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
