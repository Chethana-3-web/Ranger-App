import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import COLORS from '../../core/constants/colors';

const CommunityDashboard = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const QUICK_ACTIONS = [
    {
      id:          'report',
      label:       'Submit Community Report',
      icon:        'megaphone-outline',
      description: 'Report wildlife sighting or incident',
      color:       COLORS.ERROR,
      onPress:     () => navigation.navigate('SubmitReport'),
    },
    {
      id:          'list',
      label:       'My Reports',
      icon:        'list',
      description: 'View your submitted reports',
      color:       COLORS.PRIMARY,
      onPress:     () => navigation.navigate('MyReports'),
    },
    {
      id:          'profile',
      label:       'My Profile',
      icon:        'person-outline',
      description: 'Update your personal details',
      color:       COLORS.ACCENT,
      onPress:     () => navigation.navigate('Profile'),
    },
    {
      id:          'logout',
      label:       'Logout',
      icon:        'log-out-outline',
      description: 'Sign out of your account',
      color:       COLORS.TEXT_SECONDARY,
      onPress:     handleLogout,
    },
  ];

  const userName = user?.fullName || user?.name || 'Community Member';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Dark green header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Portal</Text>
          <Text style={styles.headerSub}>
            {userName}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="leaf" size={28} color="#fff" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Welcome!</Text>
          <Text style={styles.infoSubtitle}>Help protect wildlife and your community.</Text>
        </View>

        {/* Quick action tiles */}
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
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    backgroundColor: COLORS.HEADER_BG,
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
  infoCard: {
    backgroundColor: COLORS.SURFACE, borderRadius: 14, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  infoSubtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: COLORS.TEXT_PRIMARY,
    marginBottom: 12, marginLeft: 4,
  },
  tilesGrid: { gap: 12 },
  tile: {
    backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  tileIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  tileLabel: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  tileDesc:  { fontSize: 13, color: COLORS.TEXT_SECONDARY },
});

export default CommunityDashboard;
