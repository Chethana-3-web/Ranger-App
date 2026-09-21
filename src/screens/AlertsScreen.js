/**
 * Ranger App – Alerts Screen (Placeholder)
 *
 * Placeholder screen for collar alert and camera-trap notifications.
 * Full implementation will be added by the teammate responsible for
 * the Collar Alerts feature (src/features/collar-alerts/).
 *
 * Shows a clear placeholder so the app compiles and navigates correctly.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AppHeader from '../components/AppHeader';
import COLORS from '../constants/colors';

const AlertsScreen = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader title="Collar Alerts" subtitle="Animal tracking & camera traps" />
      <View style={styles.center}>
        <Ionicons name="notifications-outline" size={64} color={COLORS.BORDER} />
        <Text style={styles.title}>Collar Alerts</Text>
        <Text style={styles.desc}>
          Animal GPS collar alerts and camera-trap notifications will appear here.
          {'\n\n'}
          Feature coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: COLORS.TEXT_DISABLED,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AlertsScreen;
