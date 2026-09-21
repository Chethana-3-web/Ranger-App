/**
 * Ranger App – Incident List Screen
 *
 * Displays all incidents logged during the current patrol.
 * Pull-to-refresh triggers a sync attempt.
 * FAB navigates to LogIncidentScreen.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useSession } from '../context/SessionContext';
import { getIncidentsByPatrol } from '../services/incidentService';
import { syncPendingIncidents } from '../services/syncService';
import IncidentCard from '../components/IncidentCard';
import OfflineBanner from '../components/OfflineBanner';
import AppHeader from '../components/AppHeader';
import COLORS from '../constants/colors';

const IncidentListScreen = () => {
  const navigation     = useNavigation();
  const { patrol }     = useSession();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getIncidentsByPatrol(patrol.id);
    // Most recent first
    setIncidents([...data].reverse());
    setLoading(false);
  }, [patrol.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncPendingIncidents();
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderItem = ({ item }) => (
    <IncidentCard incident={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={56} color={COLORS.BORDER} />
      <Text style={styles.emptyTitle}>No incidents yet</Text>
      <Text style={styles.emptyDesc}>
        Tap the + button below to log your first incident on this patrol.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader title="Patrol Incidents" subtitle={`Patrol ${patrol.id}`} />
      <OfflineBanner />

      {loading && incidents.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={COLORS.PRIMARY} />
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('LogIncident')}
        accessibilityRole="button"
        accessibilityLabel="Log new incident"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  list:   { padding: 16, paddingBottom: 80 },
  loader: { flex: 1, marginTop: 60 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.TEXT_DISABLED,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default IncidentListScreen;
