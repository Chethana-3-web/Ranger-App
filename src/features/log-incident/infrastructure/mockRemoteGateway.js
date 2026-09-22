/**
 * Log Patrol Incident – Mock Remote Gateway
 *
 * Simulates the server for demo/test purposes.
 * - Keeps uploaded incidents in memory (by id).
 * - Returns ALREADY_EXISTS if the same id is uploaded twice (idempotent).
 * - Obeys simulatorStore.serverUp flag: returns ERROR when server is "down".
 *
 * Implements the RemoteIncidentGateway port.
 */

import simulatorStore from '../../../core/simulator/simulatorStore';

/**
 * @returns {import('../ports/remoteIncidentGateway').RemoteIncidentGateway}
 */
export function MockRemoteGateway() {
  const uploaded = new Map();

  return {
    /**
     * @param {import('../domain/incident').Incident} incident
     * @returns {Promise<import('../ports/remoteIncidentGateway').GatewayResponse>}
     */
    async upload(incident) {
      // Simulate server down via simulator flag
      if (!simulatorStore.get('serverUp')) {
        return { result: 'ERROR', error: 'Server unavailable (simulated)' };
      }

      // Idempotent: already uploaded
      if (uploaded.has(incident.id)) {
        return { result: 'ALREADY_EXISTS' };
      }

      // Simulate network latency
      await new Promise((r) => setTimeout(r, 200));

      uploaded.set(incident.id, incident);
      return { result: 'STORED' };
    },

    /** Test helper: inspect uploaded incidents */
    getUploaded() {
      return [...uploaded.values()];
    },

    /** Test helper: clear all uploaded incidents */
    reset() {
      uploaded.clear();
    },
  };
}

export default MockRemoteGateway;
