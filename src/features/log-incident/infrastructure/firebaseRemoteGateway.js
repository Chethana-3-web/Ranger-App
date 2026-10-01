/**
 * Log Patrol Incident – Firebase Remote Gateway
 *
 * Implements the RemoteIncidentGateway port using Cloud Firestore.
 * Writes each incident as a document in the "incidents" collection,
 * keyed by the client-generated UUID (idempotent by design).
 *
 * STORED       – first upload of this incident
 * ALREADY_EXISTS – document with this id already exists (idempotent replay)
 * ERROR        – Firestore threw; message returned for retry logic
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

/**
 * @returns {import('../ports/remoteIncidentGateway').RemoteIncidentGateway}
 */
export function FirebaseRemoteGateway() {
  return {
    /**
     * Upload one incident to Firestore.
     *
     * @param {import('../domain/incident').Incident} incident
     * @returns {Promise<import('../ports/remoteIncidentGateway').GatewayResponse>}
     */
    async upload(incident) {
      try {
        const ref = doc(db, 'incidents', incident.id);

        // Check if it already exists (idempotent)
        const snap = await getDoc(ref);
        if (snap.exists()) {
          return { result: 'ALREADY_EXISTS' };
        }

        await setDoc(ref, {
          ...incident,
          // Firestore timestamp for server-side ordering
          uploadedAt: new Date().toISOString(),
        });

        return { result: 'STORED' };
      } catch (err) {
        return { result: 'ERROR', error: err.message ?? 'Firestore error' };
      }
    },
  };
}

export default FirebaseRemoteGateway;
