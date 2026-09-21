/**
 * Ranger App – App Header Component
 *
 * Sticky top header used across all main screens.
 * Mirrors the BinGo DashboardHeader pattern adapted for rangers.
 *
 * Props:
 *   title       {string}    – main heading (required)
 *   subtitle    {string}    – secondary label (optional)
 *   onBack      {function}  – show back arrow if provided
 *   accentColor {string}    – header background override (default COLORS.HEADER_BG)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const AppHeader = ({ title, subtitle, onBack, accentColor = COLORS.HEADER_BG }) => {
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: accentColor }]}>
      <View style={styles.row}>
        {/* Back button */}
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Right spacer to keep title centred */}
        <View style={styles.backPlaceholder} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: { width: 40 },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 1,
    textAlign: 'center',
  },
});

export default AppHeader;
