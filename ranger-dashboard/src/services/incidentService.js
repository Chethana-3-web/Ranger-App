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
  EMERGENCY:'EMERGENCY INCIDENT',
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
 * Status logic:
 *   The mobile app writes status: "PENDING_SYNC" when the incident is first
 *   created, then marks it "SYNCED" only in AsyncStorage (local) — it never
 *   writes the updated status back to Firestore. So every document that EXISTS
 *   in Firestore was successfully uploaded → we treat it as "Received" on the
 *   dashboard side rather than showing the raw "PENDING_SYNC" string.
 *
 * @param {object} raw - plain JS object from Firestore
 * @returns {object}
 */
function normaliseIncident(raw) {
  const lat = raw.location?.latitude  ?? raw.latitude  ?? null;
  const lng = raw.location?.longitude ?? raw.longitude ?? null;

  // Any document present in Firestore was successfully uploaded from the mobile
  // app. Map the raw mobile status to a dashboard-friendly display label.
  const STATUS_MAP = {
    PENDING_SYNC: 'Received',   // in Firestore = it arrived
    SYNCED:       'Synced',
    FAILED:       'Failed',
  };
  const displayStatus = STATUS_MAP[raw.status] ?? raw.status ?? 'Received';

  return {
    ...raw,
    latitude:      lat,
    longitude:     lng,
    label:         INCIDENT_TYPE_LABELS[raw.type] ?? raw.type ?? 'Incident',
    severity:      raw.severity ?? 'Unknown',
    // Replace raw mobile status with dashboard-friendly label
    status:        displayStatus,
    // Keep the raw value available if needed
    mobileStatus:  raw.status,
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

/**
 * Subscribe to live community reports from Firestore.
 */
export function subscribeToCommunityReports(callback) {
  const q = query(
    collection(db, 'community_reports')
  );

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      let reports = snapshot.docs.map((doc) => normaliseIncident(doc.data()));
      // Sort client-side to avoid requiring a composite index in Firestore
      reports.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
      callback({ data: reports, error: null, loading: false });
    },
    (error) => {
      console.error('[incidentService] Firestore error:', error);
      callback({ data: [], error: error.message, loading: false });
    },
  );

  return unsub;
}
