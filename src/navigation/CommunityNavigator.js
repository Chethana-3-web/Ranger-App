import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import COLORS from '../core/constants/colors';

import CommunityHomeScreen from '../screens/community/CommunityHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Log Incident feature screens (reused for community report)
import IncidentTypeScreen from '../features/log-incident/ui/screens/IncidentTypeScreen';
import AddPhotoScreen from '../features/log-incident/ui/screens/AddPhotoScreen';
import LocationCaptureScreen from '../features/log-incident/ui/screens/LocationCaptureScreen';
import ManualLocationScreen from '../features/log-incident/ui/screens/ManualLocationScreen';
import DetailsScreen from '../features/log-incident/ui/screens/DetailsScreen';
import SavedScreen from '../features/log-incident/ui/screens/SavedScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const CommunityReportFlow = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="IncidentType" component={IncidentTypeScreen} />
    <Stack.Screen name="AddPhoto" component={AddPhotoScreen} />
    <Stack.Screen name="LocationCapture" component={LocationCaptureScreen} />
    <Stack.Screen name="ManualLocation" component={ManualLocationScreen} />
    <Stack.Screen name="Details" component={DetailsScreen} />
    <Stack.Screen name="Saved" component={SavedScreen} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CommunityHome" component={CommunityHomeScreen} />
    <Stack.Screen name="CommunityReportFlow" component={CommunityReportFlow} />
  </Stack.Navigator>
);

const CommunityNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.NAV_ACTIVE,
        tabBarInactiveTintColor: COLORS.NAV_INACTIVE,
        tabBarStyle: {
          backgroundColor: COLORS.NAV_BG,
          borderTopColor: COLORS.BORDER,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          const iconName = focused
            ? TAB_ICONS[route.name]?.active
            : TAB_ICONS[route.name]?.inactive;
          return <Ionicons name={iconName ?? 'circle-outline'} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default CommunityNavigator;
