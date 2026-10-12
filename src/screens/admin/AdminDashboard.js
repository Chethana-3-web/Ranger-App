import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import theme from '../../core/ui/theme';
import apiConfig from '../../core/config/appConfig';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const dashboardUrl = apiConfig.DASHBOARD_URL || apiConfig.LOCAL_DASHBOARD_URL;

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.location.href = dashboardUrl;
    }
  }, [dashboardUrl]);

  const handleOpenDashboard = () => {
    Linking.openURL(dashboardUrl).catch(err => {
      console.warn('Failed to open dashboard URL:', err);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Admin</Text>
      <Text style={styles.subtitle}>
        The Admin Dashboard is available as a standalone Web Application.
      </Text>
      
      <View style={styles.buttonContainer}>
        {Platform.OS !== 'web' && (
          <TouchableOpacity style={styles.dashboardButton} onPress={handleOpenDashboard}>
            <Text style={styles.dashboardButtonText}>Open Web Dashboard</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.heading1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  dashboardButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dashboardButtonText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});
