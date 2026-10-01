import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import theme from '../core/ui/theme';

import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import CommunityDashboard from '../screens/community/CommunityDashboard';
import OfficerDashboard from '../screens/officer/OfficerDashboard';
import CameraTrapDashboard from '../screens/CameraTrapDashboard';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import CommunityNavigator from './CommunityNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading, onboardingCompleted } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingCompleted ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : user == null ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          {user.role === 'admin' ? (
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          ) : user.role === 'officer' ? (
            <Stack.Screen name="OfficerDashboard" component={MainNavigator} />
          ) : user.role === 'park_manager' || user.role === 'researcher' ? (
            <Stack.Screen name="CameraTrapDashboard" component={CameraTrapDashboard} />
          ) : (
            <Stack.Screen name="CommunityDashboard" component={CommunityNavigator} />
          )}
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ headerShown: true, headerTitle: 'Profile', headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}
