import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import theme from '../../core/ui/theme';
import { PrimaryButton } from '../../core/ui/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard({ navigation }) {
  const { getPendingOfficers, verifyOfficer, logout, user } = useAuth();
  const [pendingOfficers, setPendingOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const officers = await getPendingOfficers();
      setPendingOfficers(officers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (officerId, officerName) => {
    // Optimistic UI update: instantly remove from the list so there's no delay
    setPendingOfficers(prev => prev.filter(o => o.id !== officerId));
    
    try {
      await verifyOfficer(officerId);
      Alert.alert("Verified", `${officerName} has been verified and can now log in.`);
    } catch (e) {
      Alert.alert("Error", "Failed to verify officer.");
      loadPending(); // Reload original list if it failed
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.district}>{item.district} - {item.address}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <View style={styles.idContainer}>
        <Text style={styles.idLabel}>ID Photo:</Text>
        {item.idPhotoUri ? (
          <Image source={{ uri: item.idPhotoUri }} style={styles.idImage} />
        ) : (
          <Text style={styles.noId}>No ID uploaded</Text>
        )}
      </View>
      <PrimaryButton 
        label="Verify Ranger" 
        onPress={() => handleVerify(item.id, item.fullName)} 
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Admin Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Pending Ranger Verifications</Text>
        
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : pendingOfficers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={60} color={theme.colors.success} />
            <Text style={styles.emptyText}>No pending rangers to verify.</Text>
          </View>
        ) : (
          <FlatList
            data={pendingOfficers}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.heading2,
    color: theme.colors.surface,
  },
  logoutBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.heading3,
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  cardInfo: {
    marginBottom: theme.spacing.sm,
  },
  name: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  district: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  phone: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  idContainer: {
    marginBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  idLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  idImage: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#000',
    resizeMode: 'contain',
  },
  noId: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    fontStyle: 'italic',
  }
});
