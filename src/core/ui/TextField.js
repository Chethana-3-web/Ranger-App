import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from './theme';

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  maxLength,
  multiline = false,
  editable = true,
  isPassword = false,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

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

      <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surface,
      }}>
        <TextInput
          style={{
            flex: 1,
            padding: theme.spacing.md,
            fontSize: 16,
            color: theme.colors.text,
            minHeight: multiline ? 100 : 48,
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          multiline={multiline}
          editable={editable}
          secureTextEntry={isSecure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setIsSecure(!isSecure)} 
            style={{ paddingHorizontal: theme.spacing.md, justifyContent: 'center' }}
          >
            <Ionicons 
              name={isSecure ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>

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
