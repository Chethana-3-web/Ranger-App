/**
 * Ranger App – Profile Screen
 *
 * Displays the seeded ranger's profile and current patrol info.
 * No edits in this prototype – rangers are provisioned by the park manager.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useSession } from '../context/SessionContext';
import { getParkById } from '../config/parks';
import AppHeader from '../components/AppHeader';
import COLORS from '../constants/colors';

const ProfileScreen = () => {
  const { ranger, patrol } = useSession();
  const park = getParkById(ranger.parkId);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.rangerName}>{ranger.name}</Text>
          <Text style={styles.rangerRole}>{ranger.role}</Text>
        </View>

        {/* Info cards */}
        <InfoRow icon="id-card-outline"  label="Ranger ID"  value={ranger.id} />
        <InfoRow icon="map-outline"       label="Park"       value={park?.name ?? ranger.parkId} />
        <InfoRow icon="shield-outline"    label="Patrol ID"  value={patrol.id} />
        <InfoRow icon="time-outline"      label="Patrol Started"
          value={new Date(patrol.startedAt).toLocaleString()} />
        <InfoRow icon="checkmark-circle-outline" label="Status" value={patrol.status} />

        <Text style={styles.note}>
          Ranger accounts are managed by the park operations dashboard.
          Contact your park manager to update profile details.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={20} color={COLORS.PRIMARY} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll:  { padding: 20 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.PRIMARY_TINT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rangerName: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  rangerRole: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 4, textTransform: 'capitalize' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_TINT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_PRIMARY, marginTop: 2 },
  note: {
    fontSize: 12,
    color: COLORS.TEXT_DISABLED,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});

export default ProfileScreen;
