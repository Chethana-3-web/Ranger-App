/**
 * Ranger App – Log Patrol Incident Screen
 *
 * Rangers use this screen to record an incident encountered on patrol:
 *   1. Select incident type (picker driven by the park's enabledIncidentTypes)
 *   2. Capture or use existing GPS location (falls back to manual entry)
 *   3. Add a short description (max 500 chars)
 *   4. Optionally attach a photo
 *   5. Save – persisted locally, queued for sync
 *
 * Works fully offline – no network required to log an incident.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { useSession } from '../context/SessionContext';
import { logIncident } from '../services/incidentService';
import { getCurrentLocation, buildManualLocation } from '../services/locationService';
import { getParkById } from '../config/parks';
import AppHeader from '../components/AppHeader';
import OfflineBanner from '../components/OfflineBanner';
import COLORS from '../constants/colors';

const INCIDENT_TYPE_META = {
  SNARE:     { label: 'Snare / Trap',              icon: 'warning',           color: COLORS.INCIDENT_SNARE },
  CARCASS:   { label: 'Animal Carcass',             icon: 'skull-outline',     color: COLORS.INCIDENT_CARCASS },
  CAMP:      { label: 'Illegal Camp',               icon: 'bonfire-outline',   color: COLORS.INCIDENT_CAMP },
  FOOTPRINT: { label: 'At-risk Species Footprint',  icon: 'footsteps-outline', color: COLORS.INCIDENT_FOOTPRINT },
  OTHER:     { label: 'Other',                      icon: 'help-circle-outline', color: COLORS.INCIDENT_OTHER },
};

const MAX_DESC_LENGTH = 500;

const LogIncidentScreen = () => {
  const navigation   = useNavigation();
  const { ranger, patrol } = useSession();
  const park         = getParkById(ranger.parkId);
  const enabledTypes = park?.enabledIncidentTypes ?? Object.keys(INCIDENT_TYPE_META);

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState(null);
  const [description,  setDescription]  = useState('');
  const [location,     setLocation]     = useState(null);
  const [photoUri,     setPhotoUri]     = useState(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [gpsLoading,  setGpsLoading]  = useState(false);
  const [saving,      setSaving]      = useState(false);

  // ── GPS ────────────────────────────────────────────────────────────────────
  const handleGetGps = useCallback(async () => {
    setGpsLoading(true);
    const loc = await getCurrentLocation();
    setGpsLoading(false);
    if (loc) {
      setLocation(loc);
    } else {
      Alert.alert(
        'GPS Unavailable',
        'Could not get GPS fix. Please enter coordinates manually or try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enter Manually',
            onPress: () => showManualLocationPrompt(),
          },
        ]
      );
    }
  }, []);

  const showManualLocationPrompt = () => {
    // In a full implementation this would open a map picker.
    // For the prototype we use a simplified inline prompt via Alert.
    Alert.prompt(
      'Enter Latitude',
      'e.g. 6.3728',
      (lat) => {
        Alert.prompt('Enter Longitude', 'e.g. 81.5198', (lng) => {
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lng);
          if (!isNaN(latNum) && !isNaN(lngNum)) {
            setLocation(buildManualLocation(latNum, lngNum));
          } else {
            Alert.alert('Invalid', 'Please enter valid numeric coordinates.');
          }
        });
      }
    );
  };

  // ── Photo ──────────────────────────────────────────────────────────────────
  const handlePickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to capture incident photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    if (!selectedType) {
      Alert.alert('Required', 'Please select an incident type.');
      return false;
    }
    if (!location) {
      Alert.alert('Required', 'Please capture or enter a location.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please add a description.');
      return false;
    }
    return true;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await logIncident({
        patrolId:    patrol.id,
        rangerId:    ranger.id,
        parkId:      ranger.parkId,
        type:        selectedType,
        description: description.trim(),
        location,
        photoUri,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save incident. Please try again.');
      console.error('[LogIncidentScreen] save error:', err);
    } finally {
      setSaving(false);
    }
  }, [selectedType, description, location, photoUri, patrol, ranger, navigation]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Log Incident"
        subtitle={patrol.id}
        onBack={() => navigation.goBack()}
      />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Incident Type ─────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Incident Type *</Text>
        <View style={styles.typeGrid}>
          {enabledTypes.map((key) => {
            const meta    = INCIDENT_TYPE_META[key];
            const active  = selectedType === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.typeChip,
                  active && { backgroundColor: meta.color, borderColor: meta.color },
                ]}
                onPress={() => setSelectedType(key)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityLabel={meta.label}
                accessibilityState={{ selected: active }}
              >
                <Ionicons
                  name={meta.icon}
                  size={18}
                  color={active ? '#fff' : meta.color}
                />
                <Text style={[styles.typeChipLabel, active && { color: '#fff' }]}>
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Location ──────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Location *</Text>
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={handleGetGps}
          disabled={gpsLoading}
          accessibilityRole="button"
          accessibilityLabel="Get GPS location"
        >
          {gpsLoading ? (
            <ActivityIndicator color={COLORS.PRIMARY} />
          ) : (
            <Ionicons name="location" size={20} color={COLORS.PRIMARY} />
          )}
          <Text style={styles.locationBtnText}>
            {gpsLoading
              ? 'Getting GPS…'
              : location
              ? `${location.source}: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
              : 'Tap to get GPS location'}
          </Text>
          {location && <Ionicons name="checkmark-circle" size={18} color={COLORS.SUCCESS} />}
        </TouchableOpacity>

        {/* ── Description ────────────────────────────────────────────────── */}
        <View style={styles.descHeader}>
          <Text style={styles.sectionLabel}>Description *</Text>
          <Text style={[
            styles.charCount,
            description.length > MAX_DESC_LENGTH * 0.9 && { color: COLORS.WARNING },
          ]}>
            {description.length}/{MAX_DESC_LENGTH}
          </Text>
        </View>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={5}
          maxLength={MAX_DESC_LENGTH}
          placeholder="Describe what you found: condition, size, any identifying features…"
          placeholderTextColor={COLORS.TEXT_DISABLED}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
          accessibilityLabel="Incident description"
        />

        {/* ── Photo ─────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Photo (optional)</Text>
        {photoUri ? (
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <TouchableOpacity
              style={styles.removePhotoBtn}
              onPress={() => setPhotoUri(null)}
              accessibilityLabel="Remove photo"
            >
              <Ionicons name="close-circle" size={24} color={COLORS.ERROR} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={handlePickPhoto}
            accessibilityRole="button"
            accessibilityLabel="Take a photo"
          >
            <Ionicons name="camera-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.photoBtnText}>Take a Photo</Text>
          </TouchableOpacity>
        )}

        {/* ── Save button ───────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save incident"
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Incident</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { padding: 16, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // ── Type picker ─────────────────────────────────────────────────────────
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.SURFACE,
  },
  typeChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },

  // ── Location ─────────────────────────────────────────────────────────────
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 14,
  },
  locationBtnText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },

  // ── Description ──────────────────────────────────────────────────────────
  descHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.TEXT_DISABLED,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 12,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 120,
  },

  // ── Photo ─────────────────────────────────────────────────────────────────
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    padding: 16,
    justifyContent: 'center',
  },
  photoBtnText: { fontSize: 14, color: COLORS.PRIMARY, fontWeight: '600' },
  photoPreviewContainer: { position: 'relative', alignSelf: 'flex-start' },
  photoPreview: { width: 160, height: 120, borderRadius: 10 },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },

  // ── Save button ───────────────────────────────────────────────────────────
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 28,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default LogIncidentScreen;
