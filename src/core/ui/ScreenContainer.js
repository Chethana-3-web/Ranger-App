/**
 * Ranger App – ScreenContainer
 *
 * Standard wrapper for all screen content.
 * Handles safe area, background color, and layout consistency.
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from './theme';

/**
 * @param {{
 *   children: React.ReactNode,
 *   scrollable?: boolean,
 *   backgroundColor?: string,
 *   padded?: boolean,
 * }} props
 * @returns {React.ReactNode}
 */
export function ScreenContainer({
  children,
  scrollable = false,
  backgroundColor = theme.colors.background,
  padded = true,
}) {
  const content = (
    <View
      style={{
        flex: 1,
        backgroundColor,
        paddingHorizontal: padded ? theme.spacing.md : 0,
        paddingVertical: padded ? theme.spacing.md : 0,
      }}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      {scrollable ? <ScrollView>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

export default ScreenContainer;
