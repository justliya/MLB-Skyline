import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PredictionTips from './src/components/PredictionTips';
import Glossary from './src/components/Glossary';
import ChatRoom from './src/components/ChatRoom';
import QuizScreen from './src/components/QuizScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PredictionTips">
        <Stack.Screen name="PredictionTips" component={PredictionTips} />
        <Stack.Screen name="Glossary" component={Glossary} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}