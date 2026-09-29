/**
 * incidentService.js — Firestore incident integration for the dashboard.
 *
 * The mobile app writes to the 'incidents' collection via:
 *   FirebaseRemoteGateway → REST PATCH /incidents/{id}
 *
 * Each document has the shape of the mobile app's Incident domain object:
 * {
 *   id, type, description,
 *   location: { latitude, longitude, accuracy, source, capturedAt },
 *   photoUri, recordedAt, rangerId, patrolId, parkId,
 *   status, syncAttempts, lastError, syncedAt, uploadedAt
 * }
 *
 * The dashboard reads those documents and maps them to the shape used by
 * the map layer (adds a `label` field from the INCIDENT_TYPE_LABELS map
 * and normalises the nested location into top-level lat/lng).
 */

import {
  collection, onSnapshot, query, orderBy,
  where, getDocs,
} from 'firebase/firestore';
import { db } from './firebase.js';

/** Human-readable labels matching the mobile app's IncidentType enum */
const INCIDENT_TYPE_LABELS = {
  SNARE:    'Snare / Trap',
  CARCASS:  'Animal Carcass',
  TRACKS:   'Animal Tracks',
  CAMPSITE: 'Illegal Campsite',
  OTHER:    'Other',
};

/**
 * Map a raw Firestore incident document to the dashboard's incident shape.
 * Normalises nested location into top-level latitude/longitude for Leaflet.
 *
 * @param {object} raw - plain JS object from Firestore
 * @returns {object}
 */
function normaliseIncident(raw) {
  // Location is stored as a nested object: { latitude, longitude, ... }
  const lat = raw.location?.latitude  ?? raw.latitude  ?? null;
  const lng = raw.location?.longitude ?? raw.longitude ?? null;

  return {
    ...raw,
    latitude:  lat,
    longitude: lng,
    label: INCIDENT_TYPE_LABELS[raw.type] ?? raw.type ?? 'Incident',
    // Provide a safe fallback severity (mobile app doesn't store severity yet)
    severity: raw.severity ?? 'Unknown',
  };
}

/**
 * Subscribe to live incidents from Firestore.
 * Calls `callback` immediately with the current list, then on every change.
 *
 * @param {(incidents: object[]) => void} callback
 * @returns {() => void} unsubscribe function — call on component unmount
 */
export function subscribeToIncidents(callback) {
  const q = query(
    collection(db, 'incidents'),
    orderBy('recordedAt', 'desc'),
  );

  const unsub = onSnapshot(
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

  return unsub;
}

/**
 * One-time fetch of incidents for a specific park.
 * Useful if you want to avoid a persistent listener.
 *
 * @param {string} parkId
 * @returns {Promise<object[]>}
 */
export async function fetchIncidentsByPark(parkId) {
  const q = query(
    collection(db, 'incidents'),
    where('parkId', '==', parkId),
    orderBy('recordedAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => normaliseIncident(doc.data()));
}
