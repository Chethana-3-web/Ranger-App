import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import COLORS from '../../core/constants/colors';

const CommunityHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>WildWatch Community</Text>
          <Text style={styles.headerSub}>Welcome, {user?.fullName || 'Villager'}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="people" size={28} color="#fff" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Protect Our Wildlife</Text>
          <Text style={styles.welcomeText}>
            As a community member, your reports help rangers keep our wildlife safe. Report any illegal activities or wildlife sightings you encounter.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CommunityReportFlow')}
          activeOpacity={0.8}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="megaphone" size={32} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Submit Community Report</Text>
            <Text style={styles.actionDesc}>Report snares, traps, or suspicious activities anonymously and safely.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    backgroundColor: COLORS.HEADER_BG,
    paddingHorizontal: 20,
    paddingTop: 48,
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
  scroll: { padding: 16 },
  welcomeCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: COLORS.TEXT_PRIMARY,
    marginBottom: 12, marginLeft: 4,
  },
  actionCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.PRIMARY + '15',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 18,
  }
});

export default CommunityHomeScreen;
