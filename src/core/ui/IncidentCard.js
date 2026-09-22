/**
 * Ranger App – Incident Card
 *
 * Renders a summary card for a single incident record in the incident list.
 *
 * Props:
 *   incident {import('../services/incidentService').IncidentRecord}
 *   onPress  {function} – optional tap handler
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SyncStatusChip from './SyncStatusChip';
import COLORS from '../constants/colors';

const TYPE_ICONS = {
  SNARE:     'warning',
  CARCASS:   'skull-outline',
  CAMP:      'bonfire-outline',
  FOOTPRINT: 'footsteps-outline',
  OTHER:     'help-circle-outline',
};

const TYPE_LABELS = {
  SNARE:     'Snare / Trap',
  CARCASS:   'Animal Carcass',
  CAMP:      'Illegal Camp',
  FOOTPRINT: 'At-risk Species Footprint',
  OTHER:     'Other',
};

const IncidentCard = ({ incident, onPress }) => {
  const iconName = TYPE_ICONS[incident.type] ?? TYPE_ICONS.OTHER;
  const typeLabel = TYPE_LABELS[incident.type] ?? incident.type;
  const date = new Date(incident.loggedAt).toLocaleString();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Incident: ${typeLabel}`}
    >
      <View style={styles.row}>
        {/* Icon */}
        <View style={styles.iconBg}>
          <Ionicons name={iconName} size={22} color={COLORS.PRIMARY} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.typeLabel}>{typeLabel}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {incident.description || 'No description'}
          </Text>
          <Text style={styles.meta}>
            {incident.location.source} · {date}
          </Text>
        </View>

        {/* Photo thumbnail */}
        {incident.photoUri ? (
          <Image source={{ uri: incident.photoUri }} style={styles.thumb} />
        ) : null}
      </View>

      {/* Status chip */}
      <View style={styles.chipRow}>
        <SyncStatusChip status={incident.syncStatus} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY_TINT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  typeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  meta: {
    fontSize: 11,
    color: COLORS.TEXT_DISABLED,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  chipRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
});

export default IncidentCard;
