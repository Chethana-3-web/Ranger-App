/**
 * Ranger App – Card
 *
 * Reusable card container with shadow and padding.
 */

import React from 'react';
import { View } from 'react-native';
import theme from './theme';

/**
 * @param {{
 *   children: React.ReactNode,
 *   onPress?: () => void,
 *   style?: object,
 * }} props
 * @returns {React.ReactNode}
 */
export function Card({ children, onPress, style }) {
  if (onPress) {
    return (
      <View
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            marginVertical: theme.spacing.sm,
            ...theme.shadow.md,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          marginVertical: theme.spacing.sm,
          ...theme.shadow.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default Card;
