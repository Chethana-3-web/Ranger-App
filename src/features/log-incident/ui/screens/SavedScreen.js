/**
 * Log Incident – Saved Screen
 *
 * Terminal screen shown after a successful save.
 * - "Incident saved successfully." if already SYNCED
 * - "Incident saved locally. Will sync when connected." if PENDING_SYNC
 * "Done" navigates back to Home and resets the incident flow stack.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';

import { SyncStatus } from '../../domain/syncStatus';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import theme from '../../../../core/ui/theme';

const SavedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { incident } = route.params ?? {};

  const isSynced = incident?.status === SyncStatus.SYNCED;

  const handleDone = () => {
    // Reset back to Home, clearing the incident flow stack
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={isSynced ? 'cloud-done' : 'save'}
            size={72}
            color={isSynced ? theme.colors.success : theme.colors.primary}
          />
        </View>

        <Text style={styles.title}>
          {isSynced ? 'Incident Saved & Synced' : 'Incident Saved'}
        </Text>

        <Text style={styles.message}>
          {isSynced
            ? 'Incident saved successfully.'
            : 'Incident saved locally. Will sync when connected.'}
        </Text>

        {incident && (
          <View style={styles.detail}>
            <Row icon="id-card-outline" label="Incident ID" value={incident.id.slice(0, 8) + '…'} />
            <Row icon="alert-circle-outline" label="Type" value={incident.type} />
            <Row icon="time-outline" label="Recorded" value={new Date(incident.recordedAt).toLocaleString()} />
            <Row
              icon={isSynced ? 'cloud-done-outline' : 'cloud-upload-outline'}
              label="Sync"
              value={isSynced ? 'Synced' : 'Pending sync'}
            />
          </View>
        )}

        <PrimaryButton label="Done" onPress={handleDone} />
      </View>
    </SafeAreaView>
  );
};

const Row = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={16} color={theme.colors.textSecondary} />
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: theme.colors.background },
  body:    { flex: 1, justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.lg },
  iconWrap: { alignItems: 'center' },
  title: {
    fontSize: 26, fontWeight: '800', color: theme.colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 16, color: theme.colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },
  detail: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { flex: 1, fontSize: 13, color: theme.colors.textSecondary },
  rowValue: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
});

export default SavedScreen;
