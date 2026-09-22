/**
 * Log Patrol Incident – Incident Repository Port
 *
 * Abstract contract for persisting and querying Incident records.
 * Implementations: AsyncStorageIncidentRepository (real), InMemoryIncidentRepository (tests).
 *
 * @typedef {Object} IncidentRepository
 * @property {(incident: import('../domain/incident').Incident) => Promise<void>} save
 * @property {(id: string) => Promise<import('../domain/incident').Incident|null>} findById
 * @property {(status: string) => Promise<import('../domain/incident').Incident[]>} findByStatus
 * @property {() => Promise<import('../domain/incident').Incident[]>} findAll
 * @property {(incident: import('../domain/incident').Incident) => Promise<void>} update
 */

export default {};
