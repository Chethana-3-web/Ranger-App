import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, FlatList } from 'react-native';
import { ScreenContainer } from '../../core/ui/ScreenContainer';
import { TextField } from '../../core/ui/TextField';
import { PrimaryButton } from '../../core/ui/PrimaryButton';
import { SecondaryButton } from '../../core/ui/SecondaryButton';
import theme from '../../core/ui/theme';
import { useAuth } from '../../context/AuthContext';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 
  'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export default function ProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isDistrictModalVisible, setDistrictModalVisible] = useState(false);

  const handleSave = async () => {
    try {
      await updateProfile({ fullName, phone, district, address });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (e) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
    setDistrict(user?.district || '');
    setAddress(user?.address || '');
    setIsEditing(false);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.content}>
        {!isEditing ? (
          <View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{user?.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>{user?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>District</Text>
              <Text style={styles.value}>{user?.district || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address / Village</Text>
              <Text style={styles.value}>{user?.address || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{user?.role}</Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <PrimaryButton label="Edit Profile" onPress={() => setIsEditing(true)} />
            </View>
          </View>
        ) : (
          <View>
            <TextField label="Full Name" value={fullName} onChangeText={setFullName} />
            <View style={styles.spacer} />
            
            <TextField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <View style={styles.spacer} />
            
            <Text style={styles.inputLabel}>District</Text>
            <TouchableOpacity 
              style={styles.dropdownSelector} 
              onPress={() => setDistrictModalVisible(true)}
            >
              <Text style={district ? styles.dropdownText : styles.placeholderText}>
                {district || 'Select a District'}
              </Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            
            <TextField label="Address / Village" value={address} onChangeText={setAddress} />
            <View style={styles.spacer} />
            
            <PrimaryButton label="Save Changes" onPress={handleSave} />
            <View style={styles.spacer} />
            <SecondaryButton label="Cancel" onPress={handleCancel} />
          </View>
        )}
      </View>

      <Modal visible={isDistrictModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select District</Text>
            <FlatList
              data={DISTRICTS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setDistrict(item);
                    setDistrictModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <SecondaryButton label="Cancel" onPress={() => setDistrictModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: theme.spacing.xl, alignItems: 'center' },
  title: { ...theme.typography.heading1, color: theme.colors.primary },
  content: { paddingHorizontal: theme.spacing.xl, paddingBottom: 40 },
  infoRow: { marginBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: theme.spacing.sm },
  label: { ...theme.typography.subtitle, color: theme.colors.textSecondary, marginBottom: 4 },
  value: { ...theme.typography.body, color: theme.colors.text },
  buttonContainer: { marginTop: theme.spacing.xl },
  spacer: { height: theme.spacing.md },
  inputLabel: { ...theme.typography.subtitle, marginBottom: theme.spacing.xs, color: theme.colors.text },
  dropdownSelector: { height: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surface, justifyContent: 'center', paddingHorizontal: theme.spacing.md },
  dropdownText: { ...theme.typography.body, color: theme.colors.text },
  placeholderText: { ...theme.typography.body, color: theme.colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 8, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 16 },
});
