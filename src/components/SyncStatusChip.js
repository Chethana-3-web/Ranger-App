/**
 * Ranger App – Sync Status Chip
 *
 * Small pill badge showing the sync state of an incident record.
 *
 * Props:
 *   status {'PENDING'|'SYNCED'|'FAILED'} – incident syncStatus
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', bg: COLORS.STATUS_PENDING,  text: '#fff' },
  SYNCED:  { label: 'Synced',  bg: COLORS.STATUS_SYNCED,   text: '#fff' },
  FAILED:  { label: 'Failed',  bg: COLORS.STATUS_FAILED,   text: '#fff' },
};

const SyncStatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <View style={[styles.chip, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

export default SyncStatusChip;
