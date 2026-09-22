/**
 * Ranger App – Log Incident Screen (legacy entry point)
 *
 * This is a thin redirect kept for backward-compat with any
 * deep links that may reference the old route name "LogIncident".
 * The real multi-step flow lives in src/features/log-incident/ui/.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { PrimaryButton } from '../core/ui/PrimaryButton';
import theme from '../core/ui/theme';

const LogIncidentScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.text}>Redirecting to incident flow…</Text>
        <PrimaryButton
          label="Start"
          onPress={() => navigation.navigate('LogIncidentFlow')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  body: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.md },
  text: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center' },
});

export default LogIncidentScreen;
