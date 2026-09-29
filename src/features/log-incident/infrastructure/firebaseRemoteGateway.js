/**
 * Log Patrol Incident – Firebase Remote Gateway
 *
 * Writes incidents to Cloud Firestore using the REST API directly.
 * This avoids the Firestore SDK's XMLHttpRequest / crypto issues in Expo Go.
 *
 * REST endpoint:
 *   PATCH /v1/projects/{project}/databases/(default)/documents/incidents/{id}
 *   → creates-or-overwrites (upsert, idempotent by document id)
 *
 * STORED       – document written successfully
 * ALREADY_EXISTS – HTTP 200 on a document that already existed (treated as success)
 * ERROR        – any non-2xx response or network failure
 */

const PROJECT_ID = 'ranger-app-b7637';
const BASE_URL   = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Convert a plain JS value to a Firestore REST value object.
 * Handles string, number, boolean, null, and nested objects.
 *
 * @param {*} value
 * @returns {object} Firestore value
 */
function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean')  return { booleanValue: value };
  if (typeof value === 'number')   return { doubleValue: value };
  if (typeof value === 'string')   return { stringValue: value };
  if (typeof value === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

/**
 * Convert a plain JS object to a Firestore REST document body.
 *
 * @param {object} obj
 * @returns {{ fields: object }}
 */
function toFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return { fields };
}

/**
 * @returns {import('../ports/remoteIncidentGateway').RemoteIncidentGateway}
 */
export function FirebaseRemoteGateway() {
  return {
    /**
     * Upload one incident to Firestore via REST.
     *
     * @param {import('../domain/incident').Incident} incident
     * @returns {Promise<import('../ports/remoteIncidentGateway').GatewayResponse>}
     */
    async upload(incident) {
      try {
        const url  = `${BASE_URL}/incidents/${incident.id}`;
        const body = toFirestoreDoc({
          ...incident,
          uploadedAt: new Date().toISOString(),
        });

        const response = await fetch(url, {
          method:  'PATCH',   // creates or overwrites — idempotent
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });

        if (response.ok) {
          return { result: 'STORED' };
        }

        const text = await response.text();
        return { result: 'ERROR', error: `HTTP ${response.status}: ${text}` };

      } catch (err) {
        return { result: 'ERROR', error: err.message ?? 'Network error' };
      }
    },
  };
}

export default FirebaseRemoteGateway;
