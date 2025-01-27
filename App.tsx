
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatProvider } from './src/context/ChatContext';
import ChatScreen from './src/screens/Home/ChatScreen';
import HomeScreen from './src/screens/Home/HomeScreen';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <ChatProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ChatProvider>
  );
};

export default App;
