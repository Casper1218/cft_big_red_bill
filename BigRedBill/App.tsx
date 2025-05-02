import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { BillSplitProvider } from './src/context/BillSplitContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <BillSplitProvider>
        <AppNavigator />
      </BillSplitProvider>
    </SafeAreaProvider>
  );
} 