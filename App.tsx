/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import './gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/hooks/AuthProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';



const App = () => {
  return (

    <AuthProvider>
    <NavigationContainer>
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      </GestureHandlerRootView>
    </SafeAreaProvider>
    </NavigationContainer>
  </AuthProvider>

  );
};

export default App;
