import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from '../screens/LandingScreen';
import SplitResultScreen from '../screens/SplitResultScreen';
import FinalSplitScreen from '../screens/FinalSplitScreen';

export type RootStackParamList = {
  Landing: undefined;
  SplitResult: { imageUri: string };
  FinalSplit: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName="Landing"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ title: 'Big Red Bill' }}
        />
        <Stack.Screen
          name="SplitResult"
          component={SplitResultScreen}
          options={{ title: 'Split Bill' }}
        />
        <Stack.Screen
          name="FinalSplit"
          component={FinalSplitScreen}
          options={{ title: 'Split Results' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 