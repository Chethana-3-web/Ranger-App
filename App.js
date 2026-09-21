/**
 * Ranger App – Application Root
 *
 * Smart Wildlife Conservation and Anti-Poaching Monitoring System
 * Sri Lanka Department of Wildlife Conservation
 * SE3070 – Case Studies in Software Engineering 2026 Semester 2
 *
 * Sets up global providers and navigation container.
 * Feature code lives in src/ – not in this file.
 *
 * Follows the same provider-wrapper pattern as BinGo (bingo/mobile/App.js):
 *   GestureHandlerRootView > SafeAreaProvider > SessionProvider > NavigationContainer
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

import { SessionProvider } from './src/context/SessionContext';
import RootNavigator from './src/navigation/RootNavigator';
import { subscribeToConnectivitySync } from './src/services/syncService';

const App = () => {
  // Subscribe to connectivity changes and auto-sync on reconnect
  useEffect(() => {
    const unsubscribe = subscribeToConnectivitySync();
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#1B4332" />
            <RootNavigator />
          </NavigationContainer>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
