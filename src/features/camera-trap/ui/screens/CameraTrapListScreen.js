/**
 * Camera Trap List Screen
 * 
 * Displays all camera traps with pending images for review.
 * Only accessible by Park Manager or Researcher roles.
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import { ScreenContainer } from '../../../../core/ui/ScreenContainer';
import { AppHeader } from '../../../../core/ui/AppHeader';
import { Card } from '../../../../core/ui/Card';
import COLORS from '../../../../core/constants/colors';

// Mock camera trap data for testing
const MOCK_CAMERA_TRAPS = [
  {
    id: 'CT-001',
    name: 'North Trail Camera',
    location: { lat: 6.4281, lng: 81.3295, name: 'North Trail Intersection' },
    pendingImageCount: 8,
    status: 'active',
    lastImageAt: '2026-09-28T14:30:00.000Z',
  },
  {
    id: 'CT-002',
    name: 'Waterhole Camera',
    location: { lat: 6.4290, lng: 81.3310, name: 'Main Waterhole' },
    pendingImageCount: 12,
    status: 'active',
    lastImageAt: '2026-09-28T16:45:00.000Z',
  },
  {
    id: 'CT-003',
    name: 'South Border Camera',
    location: { lat: 6.4260, lng: 81.3280, name: 'South Border Fence' },
    pendingImageCount: 5,
    status: 'active',
    lastImageAt: '2026-09-27T22:15:00.000Z',
  },
];

export default function CameraTrapListScreen({ navigation }) {
  const { user } = useAuth();

  // Check if user has permission
  if (!user) {
    return (
      <ScreenContainer>
        <AppHeader title="Camera Traps" showBackButton={false} />
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>Login Required</Text>
          <Text style={styles.accessDeniedText}>
            Please login to access Camera Trap Review
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (user.role !== 'park_manager' && user.role !== 'researcher') {
    return (
      <ScreenContainer>
        <AppHeader title="Camera Traps" showBackButton={false} />
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            Camera Trap Review is only accessible to Park Managers and Researchers.
          </Text>
          <Text style={styles.currentRoleText}>Your role: {user.role}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleCameraTrapPress = (cameraTrap) => {
    // TODO: Navigate to CameraTrapImagesScreen
    console.log('Selected camera trap:', cameraTrap.id);
    alert(`Camera Trap: ${cameraTrap.name}\nPending: ${cameraTrap.pendingImageCount} images`);
  };

  const renderCameraTrap = ({ item }) => (
    <TouchableOpacity
      style={styles.cameraTrapCard}
      onPress={() => handleCameraTrapPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cameraTrapName}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'active' ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cameraTrapId}>ID: {item.id}</Text>
        <Text style={styles.locationText}>📍 {item.location.name}</Text>
        
        <View style={styles.pendingContainer}>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingCount}>{item.pendingImageCount}</Text>
          </View>
          <Text style={styles.pendingText}>pending images</Text>
        </View>

        <Text style={styles.lastImageText}>
          Last image: {new Date(item.lastImageAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <AppHeader title="Camera Traps" showBackButton={false} />
      
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>Welcome, {user.fullName}</Text>
          <Text style={styles.roleText}>Role: {user.role}</Text>
        </View>

        <FlatList
          data={MOCK_CAMERA_TRAPS}
          renderItem={renderCameraTrap}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerSection: {
    padding: 16,
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  listContent: {
    padding: 16,
  },
  cameraTrapCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraTrapName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: COLORS.STATUS_SYNCED + '20',
  },
  statusInactive: {
    backgroundColor: COLORS.STATUS_PENDING + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  cardBody: {
    gap: 8,
  },
  cameraTrapId: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'monospace',
  },
  locationText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pendingBadge: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pendingCount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_INVERSE,
  },
  pendingText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  lastImageText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.ERROR,
    marginBottom: 12,
  },
  accessDeniedText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  currentRoleText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    marginTop: 8,
  },
});
