/**
 * Ranger App – Alerts Screen (Placeholder)
 *
 * Full implementation added by the teammate responsible for collar-alerts feature.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AppHeader from '../core/ui/AppHeader';
import COLORS from '../core/constants/colors';

const AlertsScreen = () => (
  <SafeAreaView style={styles.safe} edges={['bottom']}>
    <AppHeader title="Collar Alerts" subtitle="Animal tracking & camera traps" />
    <View style={styles.center}>
      <Ionicons name="notifications-outline" size={64} color={COLORS.BORDER} />
      <Text style={styles.title}>Collar Alerts</Text>
      <Text style={styles.desc}>
        GPS collar alerts and camera-trap notifications will appear here.
        {'\n\n'}Feature coming soon.
      </Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 14 },
  title:  { fontSize: 20, fontWeight: '700', color: COLORS.TEXT_SECONDARY, textAlign: 'center' },
  desc:   { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center', lineHeight: 22 },
});

export default AlertsScreen;
