/**
 * Ranger App – Application Root
 *
 * Smart Wildlife Conservation and Anti-Poaching Monitoring System
 * Sri Lanka Department of Wildlife Conservation
 * SE3070 – Case Studies in Software Engineering 2026 Semester 2
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from '../context/AuthContext';
import RootNavigator from '../navigation/RootNavigator';
import SimulatorPanel from '../core/simulator/SimulatorPanel';
import { createContainer } from '../core/di/container';
import { AsyncStorageKeyValueStore } from '../core/services/storage/AsyncStorageKeyValueStore';
import { initStorageService } from '../core/services/storageService';
import { NetInfoConnectivityMonitor } from '../core/services/connectivity/NetInfoConnectivityMonitor';
import { DefaultClock } from '../core/services/clock';
import { DefaultIdGenerator } from '../core/services/idGenerator';
import { registerLogIncidentFeature } from '../features/log-incident/index';
import { setDIContainer } from '../features/log-incident/ui/hooks/useDraftRepo';
import { setServicesContainer } from '../features/log-incident/ui/hooks/useIncidentServices';

/**
 * Build and populate the DI container once at startup.
 *
 * @returns {import('../core/di/container').DIContainer}
 */
function buildContainer() {
  const container = createContainer();

  const kv = AsyncStorageKeyValueStore();
  initStorageService(kv);

  const connectivityMonitor = NetInfoConnectivityMonitor();

  container.singleton('keyValueStore',        kv);
  container.singleton('clock',                DefaultClock);
  container.singleton('idGenerator',          DefaultIdGenerator);
  container.singleton('connectivityMonitor',  connectivityMonitor);

  // Register Log Incident feature and start its SyncManager
  registerLogIncidentFeature(container, kv, connectivityMonitor);

  return container;
}

const diContainer = buildContainer();

// Make the container accessible to UI hooks
setDIContainer(diContainer);
setServicesContainer(diContainer);

const App = () => {
  const [simulatorPanelVisible, setSimulatorPanelVisible] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
            <RootNavigator onLongPressHeader={() => setSimulatorPanelVisible(true)} />
          </NavigationContainer>
        </AuthProvider>

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
