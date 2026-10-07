/**
 * Ranger App – Main Navigator
 *
 * Bottom tab navigation for the ranger.
 * Follows the same pattern as BinGo's MainNavigator:
 *   - Bottom tabs with Ionicons
 *   - Stack navigators nested inside each tab
 *   - useSafeAreaInsets for bottom padding
 *
 * Tabs:
 *   Home       – patrol overview / dashboard
 *   Incidents  – log new incident + incident list
 *   Alerts     – collar alerts & camera trap notifications (placeholder)
 *   Profile    – ranger info
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import COLORS from '../core/constants/colors';

// Core screens
import HomeScreen            from '../screens/HomeScreen';
import IncidentListScreen    from '../screens/IncidentListScreen';
import ProfileScreen         from '../screens/ProfileScreen';

// Collar alerts feature screens
import AlertListScreen     from '../features/collar-alerts/screens/AlertListScreen';
import AlertDetailScreen   from '../features/collar-alerts/screens/AlertDetailScreen';
import AlertLocationScreen from '../features/collar-alerts/screens/AlertLocationScreen';
import AlertRespondScreen  from '../features/collar-alerts/screens/AlertRespondScreen';
import AlertSavedScreen    from '../features/collar-alerts/screens/AlertSavedScreen';
import ResponseListScreen  from '../features/collar-alerts/screens/ResponseListScreen';
import ResponseEditScreen  from '../features/collar-alerts/screens/ResponseEditScreen';

// Log Incident feature screens
import IncidentTypeScreen    from '../features/log-incident/ui/screens/IncidentTypeScreen';
import AddPhotoScreen        from '../features/log-incident/ui/screens/AddPhotoScreen';
import LocationCaptureScreen from '../features/log-incident/ui/screens/LocationCaptureScreen';
import ManualLocationScreen  from '../features/log-incident/ui/screens/ManualLocationScreen';
import DetailsScreen         from '../features/log-incident/ui/screens/DetailsScreen';
import SavedScreen           from '../features/log-incident/ui/screens/SavedScreen';
import SyncStatusScreen      from '../features/log-incident/ui/screens/SyncStatusScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Tab icon names (Ionicons) ────────────────────────────────────────────────
const TAB_ICONS = {
  Home:      { active: 'home',          inactive: 'home-outline' },
  Incidents: { active: 'clipboard',     inactive: 'clipboard-outline' },
  Alerts:    { active: 'notifications', inactive: 'notifications-outline' },
  Profile:   { active: 'person',        inactive: 'person-outline' },
};

// ── Log Incident sub-stack ────────────────────────────────────────────────────

const LogIncidentFlow = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="IncidentType"    component={IncidentTypeScreen} />
    <Stack.Screen name="AddPhoto"        component={AddPhotoScreen} />
    <Stack.Screen name="LocationCapture" component={LocationCaptureScreen} />
    <Stack.Screen name="ManualLocation"  component={ManualLocationScreen} />
    <Stack.Screen name="Details"         component={DetailsScreen} />
    <Stack.Screen name="Saved"           component={SavedScreen} />
  </Stack.Navigator>
);

// ── Alerts tab stack ──────────────────────────────────────────────────────────

const AlertStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AlertList"     component={AlertListScreen} />
    <Stack.Screen name="AlertDetail"   component={AlertDetailScreen} />
    <Stack.Screen name="AlertLocation" component={AlertLocationScreen} />
    <Stack.Screen name="AlertRespond"  component={AlertRespondScreen} />
    <Stack.Screen name="AlertSaved"    component={AlertSavedScreen} />
    <Stack.Screen name="ResponseList"  component={ResponseListScreen} />
    <Stack.Screen name="ResponseEdit"  component={ResponseEditScreen} />
  </Stack.Navigator>
);

// ── Incidents tab stack ───────────────────────────────────────────────────────

const IncidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="IncidentList"    component={IncidentListScreen} />
    <Stack.Screen name="LogIncidentFlow" component={LogIncidentFlow} />
    <Stack.Screen name="SyncStatus"      component={SyncStatusScreen} />
  </Stack.Navigator>
);

// ── Main Tab Navigator ────────────────────────────────────────────────────────

const MainNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.NAV_ACTIVE,
        tabBarInactiveTintColor: COLORS.NAV_INACTIVE,
        tabBarStyle: {
          backgroundColor: COLORS.NAV_BG,
          borderTopColor:  COLORS.BORDER,
          borderTopWidth:  1,
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
      <Tab.Screen name="Home"      component={HomeScreen}     options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Incidents" component={IncidentStack}  options={{ tabBarLabel: 'Incidents' }} />
      <Tab.Screen name="Alerts"    component={AlertStack}    options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}  options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
