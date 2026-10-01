import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import theme from '../../core/ui/theme';
import OfflineBanner from '../../core/ui/OfflineBanner';

const CommunityDashboard = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const QUICK_ACTIONS = [
    {
      id:          'report',
      label:       'Submit Community Report',
      icon:        'add-circle',
      description: 'Report wildlife sightings or suspicious activities',
      color:       theme.colors.error,
      onPress:     () => navigation.navigate('SubmitReport'),
    },
    {
      id:          'my-reports',
      label:       'My Reports',
      icon:        'list',
      description: 'View the status of your submitted reports',
      color:       theme.colors.primary,
      onPress:     () => navigation.navigate('MyReports'),
    },
    {
      id:          'profile',
      label:       'My Profile',
      icon:        'person',
      description: 'Manage your community profile',
      color:       theme.colors.info,
      onPress:     () => navigation.navigate('Profile'),
    },
    {
      id:          'logout',
      label:       'Logout',
      icon:        'log-out',
      description: 'Sign out of your account',
      color:       theme.colors.textSecondary,
      onPress:     logout,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Dark green header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Portal</Text>
          <Text style={styles.headerSub}>
            Welcome, {user?.fullName || user?.name || 'Community Member'}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="people" size={28} color="#fff" />
        </View>
      </View>

      <OfflineBanner />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.tilesGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.tile}
              onPress={action.onPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View style={[styles.tileIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={styles.tileLabel}>{action.label}</Text>
              <Text style={styles.tileDesc}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  headerBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  scroll: { padding: 16 },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: theme.colors.text,
    marginBottom: 12, marginLeft: 4,
  },
  tilesGrid: { gap: 12 },
  tile: {
    backgroundColor: theme.colors.surface, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  tileIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  tileLabel: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  tileDesc:  { fontSize: 13, color: theme.colors.textSecondary },
});

export default CommunityDashboard;
