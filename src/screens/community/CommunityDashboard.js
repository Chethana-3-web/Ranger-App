import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../core/ui/ScreenContainer';
import { PrimaryButton } from '../../core/ui/PrimaryButton';
import { SecondaryButton } from '../../core/ui/SecondaryButton';
import theme from '../../core/ui/theme';
import { useAuth } from '../../context/AuthContext';

export default function CommunityDashboard({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user?.fullName || user?.name || 'Community Member'}</Text>
        <Text style={styles.subtitle}>Help protect wildlife and your community.</Text>
        
        <View style={styles.actions}>
          <PrimaryButton 
            label="Submit Community Report" 
            onPress={() => console.log('Placeholder: Submit Report')} 
          />
          <View style={styles.spacer} />
          
          <SecondaryButton 
            label="My Reports" 
            onPress={() => console.log('Placeholder: My Reports')} 
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
  title: { ...theme.typography.heading1, color: theme.colors.primary, marginBottom: theme.spacing.sm, textAlign: 'center' },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.xxl, textAlign: 'center' },
  actions: { width: '100%' },
  spacer: { height: theme.spacing.md }
});
