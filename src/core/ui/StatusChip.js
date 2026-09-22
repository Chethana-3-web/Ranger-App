/**
 * Ranger App – StatusChip
 *
 * Small badge showing a status value with appropriate color.
 */

import React from 'react';
import { View, Text } from 'react-native';
import theme from './theme';

/**
 * @param {{
 *   status: 'pending' | 'synced' | 'failed' | 'offline',
 *   label?: string,
 * }} props
 * @returns {React.ReactNode}
 */
export function StatusChip({ status, label }) {
  const statusColors = {
    pending:  { bg: theme.status.pending, text: '#000' },
    synced:   { bg: theme.status.synced, text: '#fff' },
    failed:   { bg: theme.status.failed, text: '#fff' },
    offline:  { bg: theme.status.offline, text: '#000' },
  };

  const colors = statusColors[status] || statusColors.pending;
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderRadius: theme.borderRadius.full,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

export default StatusChip;
