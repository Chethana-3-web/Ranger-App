/**
 * alertService.js – Firestore integration for collar alerts (mobile).
 *
 * Reads from:  collar_alerts   collection
 * Writes to:   collar_alerts   (status updates)
 *              collar_responses (ranger responses)
 *
 * Falls back to mockAlerts if Firestore is unreachable (offline).
 */

import {
  collection, onSnapshot, query, orderBy, where,
  doc, updateDoc, addDoc, serverTimestamp, deleteDoc,
} from 'firebase/firestore';
import { db } from '../../../core/config/firebase';
import { MOCK_ALERTS } from '../data/mockAlerts';

// ── Subscribe to live alerts list ─────────────────────────────────────────────

/**
 * Subscribe to collar_alerts collection.
 * Falls back to mock data on error (offline).
 *
 * @param {(result: { data: object[], error: string|null, loading: boolean }) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToAlerts(callback) {
  callback({ data: [], error: null, loading: true });

  const q = query(
    collection(db, 'collar_alerts'),
    orderBy('generatedAt', 'desc'),
  );

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback({ data: data.length > 0 ? data : MOCK_ALERTS, error: null, loading: false });
    },
    (err) => {
      console.warn('[alertService] Firestore error, using mock data:', err.message);
      callback({ data: MOCK_ALERTS, error: err.message, loading: false });
    },
  );

  return unsub;
}

// ── Subscribe to a single alert (live) ───────────────────────────────────────

/**
 * Subscribe to a single collar_alert document by ID.
 * This ensures the detail screen always reflects the latest DB state.
 *
 * Falls back to the passed-in fallback object if Firestore is unreachable.
 *
 * @param {string} alertId
 * @param {object} fallback  – the alert object from the list (used offline)
 * @param {(alert: object) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToAlert(alertId, fallback, callback) {
  // If the ID looks like a mock ID (no real Firestore doc), use fallback directly
  const unsub = onSnapshot(
    doc(db, 'collar_alerts', alertId),
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        // Doc not in Firestore yet — use mock fallback
        callback(fallback);
      }
    },
    (err) => {
      console.warn('[alertService] subscribeToAlert error, using fallback:', err.message);
      callback(fallback);
    },
  );
  return unsub;
}

// ── Acknowledge an alert ───────────────────────────────────────────────────────

/**
 * Mark an alert as acknowledged by a ranger.
 *
 * @param {string} alertId
 * @param {string} rangerId
 * @returns {Promise<void>}
 */
export async function acknowledgeAlert(alertId, rangerId) {
  await updateDoc(doc(db, 'collar_alerts', alertId), {
    acknowledgedBy: rangerId,
    acknowledgedAt: serverTimestamp(),
    status: 'Acknowledged',
  });
}

// ── Submit a response ─────────────────────────────────────────────────────────

/**
 * Submit a ranger response and update alert status.
 *
 * @param {{
 *   alertId: string,
 *   rangerId: string,
 *   outcome: 'Resolved' | 'Monitoring' | 'Reassigned',
 *   notes: string,
 * }} params
 * @returns {Promise<void>}
 */
export async function submitAlertResponse({ alertId, rangerId, outcome, notes, photoUri = null }) {
  const statusMap = {
    Resolved:   'Resolved',
    Monitoring: 'Active/Monitoring',
    Reassigned: 'Active/Reassigned',
  };

  await updateDoc(doc(db, 'collar_alerts', alertId), {
    status:     statusMap[outcome] ?? 'Resolved',
    resolvedBy: rangerId,
    resolvedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'collar_responses'), {
    alertId,
    rangerId,
    outcome,
    notes,
    photoUri,
    submittedAt: serverTimestamp(),
  });
}


// ── Subscribe to responses for a ranger ──────────────────────────────────────

/**
 * Subscribe to all collar_responses submitted by a specific ranger.
 *
 * @param {string} rangerId
 * @param {(result: { data: object[], error: string|null }) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToRangerResponses(rangerId, callback) {
  const q = query(
    collection(db, 'collar_responses'),
    where('rangerId', '==', rangerId),
  );

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const tA = a.submittedAt?.toMillis?.() ?? new Date(a.submittedAt).getTime();
          const tB = b.submittedAt?.toMillis?.() ?? new Date(b.submittedAt).getTime();
          return tB - tA;
        });
      callback({ data, error: null });
    },
    (err) => {
      console.warn('[alertService] subscribeToRangerResponses error:', err.message);
      callback({ data: [], error: err.message });
    },
  );

  return unsub;
}

// ── Update a response ─────────────────────────────────────────────────────────

/**
 * Edit an existing collar_response document.
 * Also updates the parent alert status if outcome changed.
 *
 * @param {{
 *   responseId: string,
 *   alertId: string,
 *   outcome: string,
 *   notes: string,
 * }} params
 * @returns {Promise<void>}
 */
export async function updateAlertResponse({ responseId, alertId, outcome, notes, photoUri = null }) {
  const statusMap = {
    Resolved:   'Resolved',
    Monitoring: 'Active/Monitoring',
    Reassigned: 'Active/Reassigned',
  };

  await updateDoc(doc(db, 'collar_responses', responseId), {
    outcome,
    notes,
    photoUri,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'collar_alerts', alertId), {
    status:    statusMap[outcome] ?? 'Resolved',
    updatedAt: serverTimestamp(),
  });
}

// ── Delete a response ─────────────────────────────────────────────────────────

/**
 * Permanently delete a collar_response document.
 *
 * @param {string} responseId
 * @returns {Promise<void>}
 */
export async function deleteAlertResponse(responseId) {
  await deleteDoc(doc(db, 'collar_responses', responseId));
}

// ── Fetch animal profile from Firestore ───────────────────────────────────────

/**
 * Subscribe to a single animal profile by animalId.
 * Returns null if animal doesn't exist in Firestore.
 *
 * @param {string} animalId
 * @param {(animal: object|null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToAnimalProfile(animalId, callback) {
  if (!animalId) { callback(null); return () => {}; }
  const unsub = onSnapshot(
    doc(db, 'animal_profiles', animalId),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    (err)  => { console.warn('[alertService] animal profile error:', err.message); callback(null); },
  );
  return unsub;
}
