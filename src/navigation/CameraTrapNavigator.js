import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import COLORS from '../core/constants/colors';

import CameraTrapDashboard from '../screens/CameraTrapDashboard';

// Camera Trap feature screens
import CameraTrapListScreen from '../features/camera-trap/ui/screens/CameraTrapListScreen';
import CameraTrapImagesScreen from '../features/camera-trap/ui/screens/CameraTrapImagesScreen';
import ImageReviewScreen from '../features/camera-trap/ui/screens/ImageReviewScreen';
import ClassifyWildlifeScreen from '../features/camera-trap/ui/screens/ClassifyWildlifeScreen';
import SuspiciousActivityScreen from '../features/camera-trap/ui/screens/SuspiciousActivityScreen';
import ReviewStatusScreen from '../features/camera-trap/ui/screens/ReviewStatusScreen';
import ManagerProfileScreen from '../features/camera-trap/ui/screens/ManagerProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  CameraTraps: { active: 'camera', inactive: 'camera-outline' },
  ManagerProfile: { active: 'person', inactive: 'person-outline' },
};

const CameraTrapStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CameraTrapHome" component={CameraTrapDashboard} />
    <Stack.Screen name="CameraTrapList" component={CameraTrapListScreen} />
    <Stack.Screen name="CameraTrapImages" component={CameraTrapImagesScreen} />
    <Stack.Screen name="ImageReview" component={ImageReviewScreen} />
    <Stack.Screen name="ClassifyWildlife" component={ClassifyWildlifeScreen} />
    <Stack.Screen name="SuspiciousActivity" component={SuspiciousActivityScreen} />
    <Stack.Screen name="ReviewStatus" component={ReviewStatusScreen} />
  </Stack.Navigator>
);

const CameraTrapNavigator = () => {
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
      <Tab.Screen name="CameraTraps" component={CameraTrapStack} options={{ tabBarLabel: 'Camera Traps' }} />
      <Tab.Screen name="ManagerProfile" component={ManagerProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default CameraTrapNavigator;
