/**
 * Camera Trap Dashboard (Temporary Placeholder)
 * 
 * Entry screen for Park Managers and Researchers.
 * This is a placeholder until the full Camera Trap feature is implemented.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../core/ui/ScreenContainer';
import { PrimaryButton } from '../core/ui/PrimaryButton';
import { SecondaryButton } from '../core/ui/SecondaryButton';
import { useAuth } from '../context/AuthContext';
import theme from '../core/ui/theme';
import COLORS from '../core/constants/colors';

export default function CameraTrapDashboard({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.fullName || 'User'}</Text>
          <Text style={styles.role}>
            {user?.role === 'park_manager' ? 'Park Manager' : 'Researcher'}
          </Text>
          <Text style={styles.subtitle}>Camera Trap Review System</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>✅ Login Successful!</Text>
            <Text style={styles.infoText}>
              You are logged in as a {user?.role === 'park_manager' ? 'Park Manager' : 'Researcher'}.
            </Text>
            <Text style={styles.infoText}>
              Park: {user?.parkId || 'Not assigned'}
            </Text>
          </View>

          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>🎯 Camera Trap Feature</Text>
            <Text style={styles.placeholderText}>
              The Camera Trap Review screens will be implemented here.
            </Text>
            <Text style={styles.placeholderText}>
              Upcoming features:
            </Text>
            <Text style={styles.featureItem}>• View Camera Traps</Text>
            <Text style={styles.featureItem}>• Review Images</Text>
            <Text style={styles.featureItem}>• Classify Wildlife</Text>
            <Text style={styles.featureItem}>• Flag Suspicious Activity</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <SecondaryButton
            label="View Profile"
            onPress={() => navigation.navigate('Profile')}
          />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Logout"
            onPress={handleLogout}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  greeting: {
    ...theme.typography.heading1,
    color: COLORS.PRIMARY,
    marginBottom: theme.spacing.xs,
  },
  role: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRIMARY_LIGHT,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: COLORS.SUCCESS + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.SUCCESS,
    padding: theme.spacing.lg,
    borderRadius: 8,
    marginBottom: theme.spacing.xl,
  },
  infoTitle: {
    ...theme.typography.body,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  placeholder: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: theme.spacing.lg,
  },
  placeholderTitle: {
    ...theme.typography.body,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: theme.spacing.md,
  },
  placeholderText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  featureItem: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
  spacer: {
    height: theme.spacing.md,
  },
});
