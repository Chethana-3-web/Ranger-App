/**
 * Ranger App – TextField
 *
 * Text input with error text and character counter.
 */

import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import theme from './theme';

/**
 * @param {{
 *   label?: string,
 *   placeholder?: string,
 *   value: string,
 *   onChangeText: (text: string) => void,
 *   error?: string,
 *   maxLength?: number,
 *   multiline?: boolean,
 *   editable?: boolean,
 * }} props
 * @returns {React.ReactNode}
 */
export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  maxLength,
  multiline = false,
  editable = true,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {label && (
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: theme.spacing.xs,
          }}
        >
          {label}
        </Text>
      )}

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          fontSize: 16,
          color: theme.colors.text,
          minHeight: multiline ? 100 : 40,
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline={multiline}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.spacing.xs,
        }}
      >
        {error && (
          <Text
            style={{
              color: theme.colors.error,
              fontSize: 12,
              flex: 1,
            }}
          >
            {error}
          </Text>
        )}

        {maxLength && (
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: 12,
              textAlign: 'right',
            }}
          >
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

export default TextField;
