/**
 * Review Status Chip
 *
 * Small badge showing an image's review status.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../../../core/constants/colors';
import { ReviewStatus } from '../../domain/reviewStatus';

const STATUS_STYLES = {
  [ReviewStatus.PENDING]:    { bg: COLORS.STATUS_PENDING, text: '#000', label: 'Pending' },
  [ReviewStatus.CLASSIFIED]: { bg: COLORS.STATUS_SYNCED,  text: '#fff', label: 'Classified' },
  [ReviewStatus.UNCLEAR]:    { bg: '#9E9E9E',             text: '#fff', label: 'Unclear' },
  [ReviewStatus.FLAGGED]:    { bg: COLORS.STATUS_FAILED,  text: '#fff', label: 'Flagged' },
};

export default function ReviewStatusChip({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES[ReviewStatus.PENDING];

  return (
    <View style={[styles.chip, { backgroundColor: style.bg }]}>
      <Text style={[styles.label, { color: style.text }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
