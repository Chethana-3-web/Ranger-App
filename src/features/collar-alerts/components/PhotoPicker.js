/**
 * PhotoPicker – optional photo attachment for alert responses.
 * Uses expo-image-picker. Camera or gallery.
 */

import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../core/constants/colors';

/**
 * @param {{
 *   photoUri: string|null,
 *   onPhotoChange: (uri: string|null) => void,
 * }} props
 */
export default function PhotoPicker({ photoUri, onPhotoChange }) {
  const requestAndPick = async (useCamera) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera access is needed to take a photo.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Gallery access is needed to pick a photo.');
        return;
      }
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onPhotoChange(result.assets[0].uri);
    }
  };

  const handleAdd = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera',        onPress: () => requestAndPick(true) },
      { text: 'Photo Library', onPress: () => requestAndPick(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemove = () => {
    Alert.alert('Remove photo?', '', [
      { text: 'Remove', style: 'destructive', onPress: () => onPhotoChange(null) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.sectionTitle}>Photo Evidence</Text>
        <Text style={styles.optional}>Optional</Text>
      </View>

      {photoUri ? (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
            <Ionicons name="close-circle" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={28} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.addBtnText}>Tap to add a photo</Text>
          <Text style={styles.addBtnSub}>Camera or gallery</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5 },
  optional:     { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontStyle: 'italic' },

  addBtn: {
    borderWidth: 1.5, borderColor: COLORS.BORDER, borderStyle: 'dashed',
    borderRadius: 10, padding: 20,
    alignItems: 'center', gap: 6,
    backgroundColor: COLORS.BACKGROUND,
  },
  addBtnText: { fontSize: 14, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },
  addBtnSub:  { fontSize: 12, color: COLORS.TEXT_SECONDARY },

  previewWrapper: { position: 'relative', borderRadius: 10, overflow: 'hidden' },
  preview:        { width: '100%', height: 200, borderRadius: 10 },
  removeBtn:      {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 13,
  },
});
