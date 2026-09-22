/**
 * Ranger App – SecondaryButton
 *
 * Secondary action button (outline style).
 */

import React from 'react';
import { Pressable, Text } from 'react-native';
import theme from './theme';

/**
 * @param {{
 *   label: string,
 *   onPress: () => void,
 *   disabled?: boolean,
 * }} props
 * @returns {React.ReactNode}
 */
export function SecondaryButton({ label, onPress, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        borderWidth: 2,
        borderColor: disabled ? theme.colors.border : theme.colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          color: disabled ? theme.colors.textSecondary : theme.colors.primary,
          fontSize: 16,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default SecondaryButton;
