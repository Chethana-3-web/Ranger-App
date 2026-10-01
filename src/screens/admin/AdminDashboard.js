import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import theme from '../../core/ui/theme';

export default function AdminDashboard() {
  const { logout } = useAuth();

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.location.href = 'http://localhost:5173';
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Admin</Text>
      <Text style={styles.subtitle}>
        The Admin Dashboard has been moved to the standalone Web Application.
      </Text>
      
      <View style={styles.buttonContainer}>
        {Platform.OS !== 'web' && (
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            Please access http://localhost:5173 on your computer to view the dashboard.
          </Text>
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
