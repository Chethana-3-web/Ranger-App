/**
 * Ranger App – Root Navigator
 *
 * Top-level navigation container.
 * Since there is no authentication flow, this goes directly to the
 * MainNavigator (bottom tabs).
 *
 * Mirrors the BinGo RootNavigator pattern without the auth split.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = ({ onLongPressHeader: _onLongPressHeader }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
