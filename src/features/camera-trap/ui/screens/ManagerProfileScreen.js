/**
 * Manager Profile Screen
 *
 * Displays the logged-in Park Manager's profile and the logout action.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../../context/AuthContext';
import { getParkById } from '../../../../core/config/parks';
import AppHeader from '../../../../core/ui/AppHeader';
import COLORS from '../../../../core/constants/colors';
import theme from '../../../../core/ui/theme';

export default function ManagerProfileScreen() {
  const { user, logout } = useAuth();
  const park = getParkById(user?.parkId);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of the application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.name}>{user?.fullName || 'User'}</Text>
          <Text style={styles.role}>Park Manager</Text>
        </View>

        <InfoRow icon="person-outline"  label="Full Name"  value={user?.fullName || 'Not provided'} />
        <InfoRow icon="mail-outline"    label="Email"      value={user?.email || 'Not provided'} />
        <InfoRow icon="id-card-outline" label="Manager ID" value={user?.id || 'N/A'} />
        <InfoRow icon="map-outline"     label="Park"       value={user?.parkName || park?.name || user?.parkId || 'Not assigned'} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.TEXT_INVERSE} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

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
  screen: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 28, paddingTop: 12 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.PRIMARY + '1A',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  role: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 4 },
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
  infoLabel: { fontSize: 11, color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_PRIMARY, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ERROR,
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    gap: 8,
  },
  logoutText: {
    color: COLORS.TEXT_INVERSE,
    fontSize: 16,
    fontWeight: '700',
  },
});
