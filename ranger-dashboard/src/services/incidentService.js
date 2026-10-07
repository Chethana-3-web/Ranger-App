/**
 * incidentService.js — Firestore incident integration for the dashboard.
 *
 * The mobile app writes to the 'incidents' collection via:
 *   FirebaseRemoteGateway → REST PATCH /incidents/{id}
 *
 * Each Firestore document has the shape of the mobile app's Incident object:
 * {
 *   id, type, description,
 *   location: { latitude, longitude, accuracy, source, capturedAt },
 *   photoUri, recordedAt, rangerId, patrolId, parkId,
 *   status, syncAttempts, lastError, syncedAt, uploadedAt
 * }
 */

import {
  collection, onSnapshot, query, orderBy, where, getDocs,
} from 'firebase/firestore';
import { db } from './firebase.js';

/** Human-readable labels — exported so pages can import directly */
export const INCIDENT_TYPE_LABELS = {
  EMERGENCY: 'Emergency Incident',
  SNARE:     'Snare / Trap',
  CARCASS:   'Animal Carcass',
  TRACKS:    'Animal Tracks',
  CAMPSITE:  'Illegal Campsite',
  OTHER:     'Other',
};

/**
 * Normalise a raw Firestore incident document.
 * - Flattens nested location to top-level lat/lng for Leaflet
 * - Maps PENDING_SYNC → 'Received' (in Firestore = it arrived)
 */
function normaliseIncident(raw) {
  const lat = raw.location?.latitude  ?? raw.latitude  ?? null;
  const lng = raw.location?.longitude ?? raw.longitude ?? null;

  const STATUS_MAP = {
    PENDING_SYNC: 'Received',
    SYNCED:       'Synced',
    FAILED:       'Failed',
  };

  return {
    ...raw,
    latitude:     lat,
    longitude:    lng,
    label:        INCIDENT_TYPE_LABELS[raw.type] ?? raw.type ?? 'Incident',
    severity:     raw.severity ?? 'Unknown',
    status:       STATUS_MAP[raw.status] ?? raw.status ?? 'Received',
    mobileStatus: raw.status,
  };
}

/** Subscribe to live incidents. Returns unsubscribe fn. */
export function subscribeToIncidents(callback) {
  const q = query(collection(db, 'incidents'), orderBy('recordedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const incidents = snapshot.docs.map((doc) => normaliseIncident(doc.data()));
      callback({ data: incidents, error: null, loading: false });
    },
    (error) => {
      console.error('[incidentService] Firestore error:', error);
      callback({ data: [], error: error.message, loading: false });
    },
  );
}

/** One-time fetch by park. */
export async function fetchIncidentsByPark(parkId) {
  const q = query(
    collection(db, 'incidents'),
    where('parkId', '==', parkId),
    orderBy('recordedAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => normaliseIncident(doc.data()));
}

/** Subscribe to live community reports. Returns unsubscribe fn. */
export function subscribeToCommunityReports(callback) {
  const q = query(collection(db, 'community_reports'));
  return onSnapshot(
    q,
    (snapshot) => {
      const reports = snapshot.docs
        .map((doc) => normaliseIncident(doc.data()))
        .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
      callback({ data: reports, error: null, loading: false });
    },
    (error) => {
      console.error('[incidentService] Firestore error:', error);
      callback({ data: [], error: error.message, loading: false });
    },
  );
}
