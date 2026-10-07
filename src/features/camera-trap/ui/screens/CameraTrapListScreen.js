/**
 * Camera Trap List Screen
 * 
 * Displays all camera traps with pending images for review.
 * Only accessible by the Park Manager role.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../../context/AuthContext';
import AppHeader from '../../../../core/ui/AppHeader';
import COLORS from '../../../../core/constants/colors';
import { canReviewCameraTraps } from '../../domain/permissions';
import { loadCameraTrapsWithPendingCounts } from '../cameraTrapServices';

export default function CameraTrapListScreen({ navigation }) {
  const { user } = useAuth();
  const [cameraTraps, setCameraTraps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reload on focus so pending counts reflect reviews just saved
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadCameraTrapsWithPendingCounts().then((data) => {
        if (active) {
          setCameraTraps(data);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, [])
  );

  // Check if user has permission
  if (!user) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Camera Traps" onBack={() => navigation.goBack()} />
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>Login Required</Text>
          <Text style={styles.accessDeniedText}>
            Please login to access Camera Trap Review
          </Text>
        </View>
      </View>
    );
  }

  if (!canReviewCameraTraps(user)) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Camera Traps" onBack={() => navigation.goBack()} />
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            Camera Trap Review is only accessible to Park Managers.
          </Text>
          <Text style={styles.currentRoleText}>Your role: {user.role}</Text>
        </View>
      </View>
    );
  }

  const handleCameraTrapPress = (cameraTrap) => {
    navigation.navigate('CameraTrapImages', {
      cameraTrapId: cameraTrap.id,
      cameraTrapName: cameraTrap.name,
    });
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
    <View style={styles.screen}>
      <AppHeader title="Camera Traps" onBack={() => navigation.goBack()} />

      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>Welcome, {user.fullName}</Text>
          <Text style={styles.roleText}>Role: {user.role}</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color={COLORS.PRIMARY} />
        ) : (
          <FlatList
            data={cameraTraps}
            renderItem={renderCameraTrap}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
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
  loader: {
    marginTop: 32,
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
