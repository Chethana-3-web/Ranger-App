/**
 * Ranger App – Application Root
 *
 * Smart Wildlife Conservation and Anti-Poaching Monitoring System
 * Sri Lanka Department of Wildlife Conservation
 * SE3070 – Case Studies in Software Engineering 2026 Semester 2
 *
 * Sets up:
 * - Global providers (GestureHandler, SafeArea, Navigation)
 * - SessionProvider for seeded ranger/patrol
 * - DI Container with all services
 * - SimulatorPanel (dev-only)
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

import { SessionProvider } from '../core/session/SessionContext';
import RootNavigator from '../navigation/RootNavigator';
import SimulatorPanel from '../core/simulator/SimulatorPanel';
import { createContainer } from '../core/di/container';
import { AsyncStorageKeyValueStore } from '../core/services/storage/AsyncStorageKeyValueStore';
import { initStorageService } from '../core/services/storageService';
import { NetInfoConnectivityMonitor } from '../core/services/connectivity/NetInfoConnectivityMonitor';
import { DefaultClock } from '../core/services/clock';
import { DefaultIdGenerator } from '../core/services/idGenerator';

/**
 * Initialize the DI container with all services.
 *
 * @returns {import('../core/di/container').DIContainer}
 */
function initDIContainer() {
  const container = createContainer();

  // Singletons
  const kv = AsyncStorageKeyValueStore();
  initStorageService(kv);

  container.singleton('keyValueStore', kv);
  container.singleton('clock', DefaultClock);
  container.singleton('idGenerator', DefaultIdGenerator);
  container.singleton('connectivityMonitor', NetInfoConnectivityMonitor());

  return container;
}

// Global DI container (attached to global for easy access in dev)
const diContainer = initDIContainer();
if (typeof global !== 'undefined') {
  global.__diContainer = diContainer;
}

const App = () => {
  const [simulatorPanelVisible, setSimulatorPanelVisible] = useState(false);

  // Setup connectivity sync on mount
  useEffect(() => {
    // Placeholder: connect to connectivity monitor and sync on online
    // This will be wired up when syncService is integrated
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
            <RootNavigator onLongPressHeader={() => setSimulatorPanelVisible(true)} />
          </NavigationContainer>
        </SessionProvider>

        {/* Dev-only simulator panel */}
        {__DEV__ && (
          <SimulatorPanel
            visible={simulatorPanelVisible}
            onClose={() => setSimulatorPanelVisible(false)}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
