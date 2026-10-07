/**
 * ResponseListScreen
 * Shows all alert responses submitted by the logged-in ranger.
 * Tap a response to edit it.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import AppHeader from '../../../core/ui/AppHeader';
import OfflineBanner from '../../../core/ui/OfflineBanner';
import { subscribeToRangerResponses } from '../services/alertService';
import { useSession } from '../../../core/session/SessionContext';
import COLORS from '../../../core/constants/colors';
import theme from '../../../core/ui/theme';

const OUTCOME_COLOR = {
  Resolved:   '#2E7D32',
  Monitoring: '#F57F17',
  Reassigned: '#1565C0',
};

const OUTCOME_ICON = {
  Resolved:   'checkmark-circle-outline',
  Monitoring: 'eye-outline',
  Reassigned: 'people-outline',
};

function ResponseCard({ item, onPress }) {
  const color = OUTCOME_COLOR[item.outcome] ?? '#555';
  const icon  = OUTCOME_ICON[item.outcome]  ?? 'document-outline';

  const submittedAt = item.submittedAt?.toDate
    ? item.submittedAt.toDate().toLocaleString()
    : item.submittedAt
    ? new Date(item.submittedAt).toLocaleString()
    : '—';

  const updatedAt = item.updatedAt?.toDate
    ? item.updatedAt.toDate().toLocaleString()
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={[styles.outcomeBadge, { backgroundColor: color + '18', borderColor: color }]}>
          <Ionicons name={icon} size={14} color={color} />
          <Text style={[styles.outcomeText, { color }]}>{item.outcome}</Text>
        </View>
        <Ionicons name="create-outline" size={18} color={COLORS.TEXT_SECONDARY} />
      </View>

      <Text style={styles.alertId}>Alert: {item.alertId}</Text>
      <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>

      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={styles.thumb} resizeMode="cover" />
      ) : null}

      <View style={styles.meta}>
        <Text style={styles.metaText}>Submitted: {submittedAt}</Text>
        {updatedAt && <Text style={styles.metaText}>Edited: {updatedAt}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function ResponseListScreen() {
  const navigation    = useNavigation();
  const { ranger }    = useSession();
  const [responses, setResponses] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const unsub = subscribeToRangerResponses(ranger.id, ({ data, error: err }) => {
      setResponses(data);
      setError(err);
      setLoading(false);
    });
    return unsub;
  }, [ranger.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="My Responses"
        subtitle="Tap a response to edit"
        onBack={() => navigation.goBack()}
      />
      <OfflineBanner />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={responses}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <ResponseCard
              item={item}
              onPress={() => navigation.navigate('ResponseEdit', { response: item })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-outline" size={56} color={COLORS.BORDER} />
              <Text style={styles.emptyText}>No responses submitted yet</Text>
              {error && <Text style={styles.errorText}>Could not load from server</Text>}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.BACKGROUND },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 10 },
  list:      { padding: 16, paddingBottom: 40 },
  emptyText: { fontSize: 15, color: COLORS.TEXT_SECONDARY },
  errorText: { fontSize: 12, color: COLORS.ERROR },

  card: {
    backgroundColor: COLORS.SURFACE, borderRadius: 12,
    padding: 14, marginBottom: 12, ...theme.shadow.sm,
  },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  outcomeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  outcomeText:  { fontSize: 12, fontWeight: '700' },
  alertId:      { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginBottom: 4 },
  notes:        { fontSize: 14, color: COLORS.TEXT_PRIMARY, lineHeight: 20, marginBottom: 8 },
  thumb:        { width: '100%', height: 140, borderRadius: 8, marginBottom: 8 },
  meta:         { gap: 2 },
  metaText:     { fontSize: 11, color: COLORS.TEXT_SECONDARY },
});
