import React from 'react';
import './gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/hooks/AuthProvider';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (

    <AuthProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  </AuthProvider>

  );
};

export default App;
