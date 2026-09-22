/**
 * Ranger App – ConfirmDialog
 *
 * Modal confirmation dialog.
 */

import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import theme from './theme';

/**
 * @param {{
 *   visible: boolean,
 *   title: string,
 *   message: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 *   confirmColor?: string,
 * }} props
 * @returns {React.ReactNode}
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmColor = theme.colors.primary,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
            width: '80%',
            maxWidth: 400,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: theme.spacing.md,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.lg,
              lineHeight: 24,
            }}
          >
            {message}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: theme.spacing.md,
            }}
          >
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => ({
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => ({
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                backgroundColor: confirmColor,
                borderRadius: theme.borderRadius.md,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: theme.colors.surface, fontWeight: '600' }}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default ConfirmDialog;
