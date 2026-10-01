/**
 * Option List
 *
 * Single-choice list of selectable options.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../../core/constants/colors';

/**
 * @param {{
 *   options: Array<{ value: string, label: string }>,
 *   value: string|null,
 *   onChange: (value: string) => void,
 * }} props
 */
export default function OptionList({ options, value, onChange }) {
  return (
    <View>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selected ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
            />
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '0D',
  },
  optionLabel: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 10,
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
});
