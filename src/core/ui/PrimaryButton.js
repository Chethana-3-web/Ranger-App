/**
 * Ranger App – PrimaryButton
 *
 * Main call-to-action button.
 */

import React from 'react';
import { Pressable, Text } from 'react-native';
import theme from './theme';

/**
 * @param {{
 *   label: string,
 *   onPress: () => void,
 *   disabled?: boolean,
 *   loading?: boolean,
 * }} props
 * @returns {React.ReactNode}
 */
export function PrimaryButton({ label, onPress, disabled = false, loading = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: disabled ? theme.colors.border : pressed ? theme.colors.primary : theme.colors.primaryLight,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          color: theme.colors.surface,
          fontSize: 16,
          fontWeight: '600',
        }}
      >
        {loading ? 'Loading...' : label}
      </Text>
    </Pressable>
  );
}

export default PrimaryButton;
