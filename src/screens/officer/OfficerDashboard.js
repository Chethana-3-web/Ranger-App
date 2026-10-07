import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../core/ui/ScreenContainer';
import { PrimaryButton } from '../../core/ui/PrimaryButton';
import { SecondaryButton } from '../../core/ui/SecondaryButton';
import theme from '../../core/ui/theme';
import { useAuth } from '../../context/AuthContext';

export default function OfficerDashboard({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Community Liaison Officer Dashboard</Text>
        <Text style={styles.title}>Welcome, {user?.fullName || user?.name || 'Officer'}</Text>
        
        <View style={styles.actions}>
          <PrimaryButton 
            label="Community Reports" 
            onPress={() => console.log('Placeholder: View Reports')} 
          />
          <View style={styles.spacer} />
          
          <SecondaryButton 
            label="My Profile" 
            onPress={() => navigation.navigate('Profile')} 
          />
          <View style={styles.spacer} />
          
          <SecondaryButton 
            label="Logout" 
            onPress={logout} 
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  headerTitle: { ...theme.typography.subtitle, color: theme.colors.textSecondary, marginBottom: theme.spacing.md, textAlign: 'center' },
  title: { ...theme.typography.heading1, color: theme.colors.primary, marginBottom: theme.spacing.xxl, textAlign: 'center' },
  actions: { width: '100%' },
  spacer: { height: theme.spacing.md }
});
