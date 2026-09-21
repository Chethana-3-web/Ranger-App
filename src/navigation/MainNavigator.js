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

import COLORS from '../constants/colors';

// Screens
import HomeScreen            from '../screens/HomeScreen';
import LogIncidentScreen     from '../screens/LogIncidentScreen';
import IncidentListScreen    from '../screens/IncidentListScreen';
import AlertsScreen          from '../screens/AlertsScreen';
import ProfileScreen         from '../screens/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Tab icon names (Ionicons) ────────────────────────────────────────────────
const TAB_ICONS = {
  Home:      { active: 'home',          inactive: 'home-outline' },
  Incidents: { active: 'clipboard',     inactive: 'clipboard-outline' },
  Alerts:    { active: 'notifications', inactive: 'notifications-outline' },
  Profile:   { active: 'person',        inactive: 'person-outline' },
};

// ── Stacks ────────────────────────────────────────────────────────────────────

const IncidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="IncidentList" component={IncidentListScreen} />
    <Stack.Screen name="LogIncident"  component={LogIncidentScreen} />
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
      <Tab.Screen name="Alerts"    component={AlertsScreen}   options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}  options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
