/**
 * Ranger App – Simulator Panel
 *
 * Dev-only UI for fault injection (shown only when __DEV__).
 * Long-press on the Home header to open.
 *
 * Not in tests; only rendered in development.
 */

import React, { useState } from 'react';
import { View, ScrollView, Text, Switch, Pressable } from 'react-native';
import simulatorStore from './simulatorStore';

/**
 * Simulator control panel (dev-only).
 *
 * Usage: <SimulatorPanel visible={showPanel} onClose={...} />
 *
 * @param {{ visible: boolean, onClose: () => void }} props
 * @returns {React.ReactNode}
 */
export function SimulatorPanel({ visible, onClose }) {
  const [gpsAvailable, setGpsAvailable] = useState(simulatorStore.get('gpsAvailable'));
  const [cameraAvailable, setCameraAvailable] = useState(simulatorStore.get('cameraAvailable'));
  const [networkOverride, setNetworkOverride] = useState(simulatorStore.get('networkOverride'));
  const [serverUp, setServerUp] = useState(simulatorStore.get('serverUp'));

  if (!visible) {
    return null;
  }

  const handleGpsChange = (value) => {
    setGpsAvailable(value);
    simulatorStore.set('gpsAvailable', value);
  };

  const handleCameraChange = (value) => {
    setCameraAvailable(value);
    simulatorStore.set('cameraAvailable', value);
  };

  const handleNetworkChange = (value) => {
    setNetworkOverride(value);
    simulatorStore.set('networkOverride', value);
  };

  const handleServerChange = (value) => {
    setServerUp(value);
    simulatorStore.set('serverUp', value);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', padding: 16 }}>
      <ScrollView>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Simulator Panel
        </Text>

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fff' }}>GPS Available</Text>
            <Switch value={gpsAvailable} onValueChange={handleGpsChange} />
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fff' }}>Camera Available</Text>
            <Switch value={cameraAvailable} onValueChange={handleCameraChange} />
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: '#fff', marginBottom: 8 }}>Network Override</Text>
          {['auto', 'offline', 'online'].map((option) => (
            <Pressable
              key={option}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 4,
                backgroundColor: networkOverride === option ? '#2E7D32' : '#424242',
                marginBottom: 4,
              }}
              onPress={() => handleNetworkChange(option)}
            >
              <Text style={{ color: '#fff', textTransform: 'capitalize' }}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fff' }}>Server Up</Text>
            <Switch value={serverUp} onValueChange={handleServerChange} />
          </View>
        </View>

        <Pressable
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 4,
            backgroundColor: '#c62828',
            marginTop: 16,
          }}
          onPress={onClose}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Close</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export default SimulatorPanel;
