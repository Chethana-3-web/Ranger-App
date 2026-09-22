/**
 * Log Patrol Incident – Remote Incident Gateway Port
 *
 * Abstract contract for uploading an incident to the remote server.
 * Both STORED and ALREADY_EXISTS results count as success (idempotent by id).
 * Implementations: MockRemoteGateway (prototype), real HTTP gateway (future).
 *
 * @typedef {'STORED'|'ALREADY_EXISTS'|'ERROR'} GatewayResult
 *
 * @typedef {Object} GatewayResponse
 * @property {GatewayResult} result
 * @property {string} [error]   – error message when result is 'ERROR'
 *
 * @typedef {Object} RemoteIncidentGateway
 * @property {(incident: import('../domain/incident').Incident) => Promise<GatewayResponse>} upload
 */

export default {};
