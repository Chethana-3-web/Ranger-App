/**
 * Ranger App – Profile Screen
 *
 * Displays the seeded ranger's profile and active patrol info.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useSession } from '../core/session/SessionContext';
import { useAuth } from '../context/AuthContext';
import { getParkById } from '../core/config/parks';
import AppHeader from '../core/ui/AppHeader';
import COLORS from '../core/constants/colors';
import theme from '../core/ui/theme';

const ProfileScreen = () => {
  const { ranger, patrol } = useSession();
  const { user, logout } = useAuth();
  const park = getParkById(ranger.parkId);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of the application?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.rangerName}>{user?.fullName || ranger.name}</Text>
          <Text style={styles.rangerRole}>{user?.role || ranger.role}</Text>
        </View>

        <InfoRow icon="id-card-outline"          label="Ranger ID"       value={ranger.id} />
        <InfoRow icon="map-outline"              label="Park"            value={park?.name ?? ranger.parkId} />
        <InfoRow icon="shield-outline"           label="Patrol ID"       value={patrol.id} />
        <InfoRow icon="time-outline"             label="Patrol Started"  value={new Date(patrol.startedAt).toLocaleString()} />
        <InfoRow icon="checkmark-circle-outline" label="Status"          value={patrol.status} />

        <Text style={styles.note}>
          Ranger accounts are managed by the park operations dashboard.
          Contact your park manager to update profile details.
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 28, paddingTop: 12 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.PRIMARY + '1A',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  rangerName: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  rangerRole: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 4, textTransform: 'capitalize' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.SURFACE, borderRadius: 10, padding: 14, marginBottom: 10,
    ...theme.shadow.sm,
  },
  infoIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.PRIMARY + '1A',
    justifyContent: 'center', alignItems: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel:  { fontSize: 11, color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue:  { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_PRIMARY, marginTop: 2 },
  note: { fontSize: 12, color: COLORS.TEXT_SECONDARY, textAlign: 'center', marginTop: 20, lineHeight: 18, paddingHorizontal: 16 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ERROR || '#d32f2f',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    gap: 8,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});

export default ProfileScreen;
