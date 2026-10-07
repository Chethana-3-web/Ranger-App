/**
 * seedAlerts.js – One-time seed of mock collar alerts into Firestore.
 *
 * Call seedCollarAlerts() once (e.g. from a dev button or on first launch).
 * Uses the mock alert IDs as document IDs so it's idempotent — safe to call
 * multiple times without creating duplicates.
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../core/config/firebase';
import { MOCK_ALERTS } from '../data/mockAlerts';

/**
 * Seeds MOCK_ALERTS into the collar_alerts Firestore collection.
 * Skips any document that already exists.
 *
 * @returns {Promise<{ seeded: number, skipped: number }>}
 */
export async function seedCollarAlerts() {
  let seeded = 0;
  let skipped = 0;

  for (const alert of MOCK_ALERTS) {
    const ref = doc(db, 'collar_alerts', alert.id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      skipped++;
      continue;
    }

    await setDoc(ref, {
      ...alert,
      // Firestore-friendly timestamp string (not serverTimestamp — we want
      // the fixed mock date so ordering is deterministic)
      seededAt: new Date().toISOString(),
    });
    seeded++;
  }

  console.log(`[seedAlerts] seeded=${seeded} skipped=${skipped}`);
  return { seeded, skipped };
}
