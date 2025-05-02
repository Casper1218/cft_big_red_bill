import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { BillSplitProvider } from './src/context/BillSplitContext';
import { RawBillDataProvider } from './src/context/RawBillDataContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <RawBillDataProvider>
        <BillSplitProvider>
          <AppNavigator />
        </BillSplitProvider>
      </RawBillDataProvider>
    </SafeAreaProvider>
  );
} 