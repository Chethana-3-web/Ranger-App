$content = Get-Content -Raw "src/screens/ProfileScreen.js"

$imports = @"
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../core/config/firebase';
"@
$content = $content -replace "import React from 'react';\r?\nimport \{ View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity \} from 'react-native';", $imports

$state = @"
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
"@
$content = $content -replace "(?s)  const \{ ranger, patrol \} = useSession\(\);.*?const park = getParkById\(ranger\.parkId\);", $state

$communityView = @"
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
"@
$content = $content -replace "(?s)<InfoRow icon=`"id-card-outline`".*?update profile details\.\r?\n\s*</Text>", $communityView

$modalStyles = @"
        <Modal visible={isEditing} transparent animationType="slide">
          <View style={styles.modalOverlay}>
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
          </View>
        </Modal>
      </ScrollView>
"@
$content = $content -replace "</ScrollView>", $modalStyles

$styles = @"
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: COLORS.TEXT_PRIMARY },
  label: { fontSize: 13, fontWeight: 'bold', color: COLORS.TEXT_SECONDARY, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.TEXT_PRIMARY },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
});
"@
$content = $content -replace "\}\);\s*\z", $styles

Set-Content -Path "src/screens/ProfileScreen.js" -Value $content
