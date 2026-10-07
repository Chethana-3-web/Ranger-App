/**
 * Ranger App – Application Root
 *
 * Smart Wildlife Conservation and Anti-Poaching Monitoring System
 * Sri Lanka Department of Wildlife Conservation
 * SE3070 – Case Studies in Software Engineering 2026 Semester 2
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from '../context/AuthContext';
import { SessionProvider } from '../core/session/SessionContext';
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
import { seedCollarAlerts } from '../features/collar-alerts/services/seedAlerts';
import NewAlertBanner from '../features/collar-alerts/components/NewAlertBanner';

// ── DI container ──────────────────────────────────────────────────────────────

function buildContainer() {
  const container = createContainer();
  const kv = AsyncStorageKeyValueStore();
  initStorageService(kv);
  const connectivityMonitor = NetInfoConnectivityMonitor();
  container.singleton('keyValueStore',       kv);
  container.singleton('clock',               DefaultClock);
  container.singleton('idGenerator',         DefaultIdGenerator);
  container.singleton('connectivityMonitor', connectivityMonitor);
  registerLogIncidentFeature(container, kv, connectivityMonitor);
  return container;
}

const diContainer = buildContainer();
setDIContainer(diContainer);
setServicesContainer(diContainer);

// Seed mock alerts into Firestore once on first dev launch
if (__DEV__) {
  seedCollarAlerts().catch((e) => console.warn('[seed] collar alerts:', e.message));
}

// ── App ───────────────────────────────────────────────────────────────────────

const App = () => {
  const [simulatorPanelVisible, setSimulatorPanelVisible] = useState(false);

  useEffect(() => {}, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SessionProvider>
            <NavigationContainer>
              <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
              <RootNavigator onLongPressHeader={() => setSimulatorPanelVisible(true)} />
            </NavigationContainer>
          </SessionProvider>
        </AuthProvider>

        {/* Global alert banner — shows on any screen */}
        <NewAlertBanner />

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
