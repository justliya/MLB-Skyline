import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/utils/NavigationUtils'; // Import the navigationRef
import Authentication from './src/utils/AppNavigator'; // Centralized navigator logic

const App = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Authentication />
    </NavigationContainer>
  );
};

export default App;
