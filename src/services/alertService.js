/**
 * alertService.js ΓÇö Firestore alert integration for the web dashboard.
 * Reads collar_alerts and collar_responses collections.
 * Falls back to mockData if Firestore is unreachable.
 */

import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, serverTimestamp, where, deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { WILDLIFE_ALERTS, WILDLIFE } from '../data/mockData.js';

// ΓöÇΓöÇ Subscribe to all collar alerts ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export function subscribeToCollarAlerts(callback) {
  callback({ data: [], error: null, loading: true });

  const q = query(collection(db, 'collar_alerts'), orderBy('generatedAt', 'desc'));

  return onSnapshot(q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback({ data: data.length > 0 ? data : WILDLIFE_ALERTS, error: null, loading: false });
    },
    (err) => {
      console.warn('[alertService] using mock data:', err.message);
      callback({ data: WILDLIFE_ALERTS, error: err.message, loading: false });
    },
  );
}

// ΓöÇΓöÇ Subscribe to responses for a specific alert ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export function subscribeToAlertResponses(alertId, callback) {
  const q = query(
    collection(db, 'collar_responses'),
    where('alertId', '==', alertId),
  );

  return onSnapshot(q,
    (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const tA = a.submittedAt?.toMillis?.() ?? 0;
          const tB = b.submittedAt?.toMillis?.() ?? 0;
          return tB - tA;
        });
      callback({ data, error: null });
    },
    (err) => callback({ data: [], error: err.message }),
  );
}

// ΓöÇΓöÇ Update alert status ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export async function updateAlertStatus(alertId, status) {
  await updateDoc(doc(db, 'collar_alerts', alertId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ΓöÇΓöÇ Helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export function getAnimalById(animalId) {
  return WILDLIFE.find((w) => w.id === animalId) ?? null;
}

// ΓöÇΓöÇ Delete an alert ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export async function deleteCollarAlert(alertId) {
  await deleteDoc(doc(db, 'collar_alerts', alertId));
}
