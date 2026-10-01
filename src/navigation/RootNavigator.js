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
import ProfileScreen from '../screens/profile/ProfileScreen';

import SubmitReportScreen from '../features/community-report/screens/SubmitReportScreen';
import LocationSelectionScreen from '../features/community-report/screens/LocationSelectionScreen';
import AddEvidenceScreen from '../features/community-report/screens/AddEvidenceScreen';
import ReviewReportScreen from '../features/community-report/screens/ReviewReportScreen';
import SubmissionSuccessScreen from '../features/community-report/screens/SubmissionSuccessScreen';
import MyReportsScreen from '../features/community-report/screens/MyReportsScreen';
import ReportDetailsScreen from '../features/community-report/screens/ReportDetailsScreen';
import OfficerReportsScreen from '../features/community-report/screens/officer/OfficerReportsScreen';
import OfficerReportDetailsScreen from '../features/community-report/screens/officer/OfficerReportDetailsScreen';

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
          {user.role === 'officer' ? (
            <>
              <Stack.Screen name="OfficerDashboard" component={OfficerDashboard} />
              <Stack.Screen name="OfficerReports" component={OfficerReportsScreen} />
              <Stack.Screen name="OfficerReportDetails" component={OfficerReportDetailsScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="CommunityDashboard" component={CommunityDashboard} />
              <Stack.Screen name="SubmitReport" component={SubmitReportScreen} />
              <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
              <Stack.Screen name="AddEvidence" component={AddEvidenceScreen} />
              <Stack.Screen name="ReviewReport" component={ReviewReportScreen} />
              <Stack.Screen name="SubmissionSuccess" component={SubmissionSuccessScreen} />
              <Stack.Screen name="MyReports" component={MyReportsScreen} />
              <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
            </>
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
