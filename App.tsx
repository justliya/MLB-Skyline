import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './src/screens/Auth/LoginScreen';
import WelcomeScreen from './src/screens/Auth/WelcomeScreen';
import RegistrationScreen from './src/screens/Auth/RegistrationScreen';
import BottomTabNavigator from './src/navigation/navbar/BottomTabNavigator';
import { ChatProvider } from './src/context/ChatContext'; // Import ChatProvider

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <ChatProvider> {/* Move ChatProvider inside NavigationContainer */}
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
            options={{ title: 'Welcome', headerShown: false}}
          />
          {/* Registration Screen */}
          <Stack.Screen
            name="SignUp"
            component={RegistrationScreen}
            options={{ title: 'Sign Up', headerShown: false }}
          />
          {/* Main App: Bottom Tab Navigator */}
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </ChatProvider>
    </NavigationContainer>
  );
};

export default App;
