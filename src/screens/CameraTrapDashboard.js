/**
 * Camera Trap Dashboard
 *
 * Entry screen for Park Managers.
 * Shows a summary of camera traps and the entry point to Camera Trap Review.
 */

import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../core/ui/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import theme from '../core/ui/theme';
import COLORS from '../core/constants/colors';
import { getParkById } from '../core/config/parks';
import { loadCameraTrapsWithPendingCounts } from '../features/camera-trap/ui/cameraTrapServices';

const REVIEW_STEPS = [
  { icon: 'images-outline', label: 'Pick a camera trap and open an image' },
  { icon: 'paw-outline', label: 'Classify the wildlife: species and count' },
  { icon: 'warning-outline', label: 'Flag suspicious human activity' },
];

export default function CameraTrapDashboard({ navigation }) {
  const { user } = useAuth();
  const [cameraTraps, setCameraTraps] = useState(null);

  // Reload on focus so pending counts reflect reviews just saved
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadCameraTrapsWithPendingCounts().then((data) => {
        if (active) setCameraTraps(data);
      });
      return () => { active = false; };
    }, [])
  );

  const parkLabel = user?.parkName || getParkById(user?.parkId)?.name || user?.parkId;

  const cameraCount = cameraTraps ? cameraTraps.length : '–';
  const pendingCount = cameraTraps
    ? cameraTraps.reduce((sum, ct) => sum + ct.pendingImageCount, 0)
    : '–';

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greetingLabel}>Welcome back</Text>
          <Text style={styles.greeting} numberOfLines={2}>{user?.fullName || 'User'}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.chip}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.TEXT_INVERSE} />
              <Text style={styles.chipText}>Park Manager</Text>
            </View>
            {parkLabel ? (
              <View style={styles.chip}>
                <Ionicons name="location" size={14} color={COLORS.TEXT_INVERSE} />
                <Text style={styles.chipText}>{parkLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="camera-outline" size={22} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>{cameraCount}</Text>
            <Text style={styles.statLabel}>Camera traps</Text>
          </View>
          <View style={styles.statSpacer} />
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={22} color={COLORS.ACCENT} />
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending images</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Camera Trap Review</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CameraTrapList')}
          activeOpacity={0.7}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="camera" size={24} color={COLORS.TEXT_INVERSE} />
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionTitle}>View Camera Traps</Text>
            <Text style={styles.actionSubtitle}>Review the pending images of each camera</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>How review works</Text>
        <View style={styles.card}>
          {REVIEW_STEPS.map((feature, index) => (
            <View
              key={feature.label}
              style={[styles.featureRow, index > 0 && styles.featureRowDivider]}
            >
              <Ionicons name={feature.icon} size={20} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
  greetingLabel: {
    ...theme.typography.bodySmall,
    color: COLORS.TEXT_INVERSE,
    opacity: 0.8,
  },
  greeting: {
    ...theme.typography.heading2,
    color: COLORS.TEXT_INVERSE,
    marginTop: theme.spacing.xs,
  },
  headerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: COLORS.TEXT_INVERSE,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.sm,
  },
  statSpacer: {
    width: theme.spacing.md,
  },
  statValue: {
    ...theme.typography.heading1,
    color: COLORS.TEXT_PRIMARY,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    ...theme.typography.bodySmall,
    color: COLORS.TEXT_SECONDARY,
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBody: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  actionTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  actionSubtitle: {
    ...theme.typography.bodySmall,
    color: COLORS.TEXT_SECONDARY,
  },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadow.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  featureRowDivider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
  },
  featureLabel: {
    ...theme.typography.body,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: theme.spacing.md,
  },
});
