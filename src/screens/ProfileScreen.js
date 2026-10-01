/**
 * Ranger App – Profile Screen
 *
 * Displays the seeded ranger's profile and active patrol info.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../core/config/firebase';
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
  const isCommunity = user?.role === 'community';

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setEditName(user?.fullName || '');
    setEditPhone(user?.phone || '');
    setIsEditing(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const updatedUser = { ...user, fullName: editName.trim(), phone: editPhone.trim() };
      
      // Update Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { fullName: editName.trim(), phone: editPhone.trim() });
      
      // Update AsyncStorage
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      
      // Unfortunately we can't easily update AuthContext state here without a setUser function exposed, 
      // but reloading or relogging would work. We'll just alert for now.
      Alert.alert('Success', 'Profile updated successfully! Please restart the app to see changes globally.');
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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
        <SafeAreaView style={styles.safe} edges={isCommunity ? ['top'] : ['bottom']}>
      {isCommunity ? (
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>WildWatch Community</Text>
            <Text style={styles.headerSub}>My Profile</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
        </View>
      ) : (
        <AppHeader title="Profile" />
      )}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.rangerName}>{user?.fullName || ranger.name}</Text>
          <Text style={styles.rangerRole}>{user?.role || ranger.role}</Text>
        </View>

                {isCommunity ? (
          <>
            <InfoRow icon="person-outline" label="Full Name" value={user?.fullName} />
            <InfoRow icon="call-outline" label="Phone" value={user?.phone || 'Not provided'} />
            <InfoRow icon="mail-outline" label="Email" value={user?.email} />
            
            <TouchableOpacity style={[styles.logoutButton, {backgroundColor: COLORS.PRIMARY, marginTop: 16}]} onPress={openEdit}>
              <Ionicons name="pencil" size={20} color="#FFF" />
              <Text style={styles.logoutText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <InfoRow icon="id-card-outline"          label="Ranger ID"       value={ranger.id} />
            <InfoRow icon="map-outline"              label="Park"            value={park?.name ?? ranger.parkId} />
            <InfoRow icon="shield-outline"           label="Patrol ID"       value={patrol?.id || 'N/A'} />
            <InfoRow icon="time-outline"             label="Patrol Started"  value={patrol?.startedAt ? new Date(patrol.startedAt).toLocaleString() : 'N/A'} />
            <InfoRow icon="checkmark-circle-outline" label="Status"          value={patrol?.status || 'N/A'} />
            
            <Text style={styles.note}>
              Ranger accounts are managed by the park operations dashboard.
              Contact your park manager to update profile details.
            </Text>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
                    </ScrollView>
      <Modal visible={isEditing} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Enter full name" />
            
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} placeholder="Enter phone number" keyboardType="phone-pad" />
            
            <View style={{flexDirection: 'row', gap: 12, marginTop: 20}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: COLORS.SURFACE}]} onPress={() => setIsEditing(false)}>
                <Text style={{color: COLORS.TEXT_PRIMARY, fontWeight: 'bold'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: COLORS.PRIMARY}]} onPress={saveProfile} disabled={saving}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  header: {
    backgroundColor: COLORS.HEADER_BG || '#15803d',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  headerBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
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
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: COLORS.TEXT_PRIMARY },
  label: { fontSize: 13, fontWeight: 'bold', color: COLORS.TEXT_SECONDARY, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.TEXT_PRIMARY },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
});

export default ProfileScreen;




