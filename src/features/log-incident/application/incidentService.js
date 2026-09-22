/**
 * Log Patrol Incident – Incident Service
 *
 * Application-layer use cases for logging and managing incidents.
 * Depends ONLY on ports and domain — never on Expo or AsyncStorage directly.
 *
 * Public API:
 *   logIncident(params)         – validate, create, persist, attempt immediate sync
 *   saveDraft(draft, repo)      – autosave draft after each step
 *   findDraft(repo)             – load existing draft (E1 recovery)
 *   discardDraft(repo)          – delete draft
 *   getTypesForPark(park)       – enabled IncidentType entries for park
 */

import { validate } from './incidentValidator';
import { createIncident, markSynced, recordFailedAttempt } from '../domain/incident';
import { getEnabledTypesForPark } from '../domain/incidentType';
import { StorageError } from '../../../core/domain/errors';

/**
 * @typedef {Object} LogIncidentParams
 * @property {string}      type
 * @property {string}      description
 * @property {import('../../../core/domain/location').RangerLocation} location
 * @property {string|null} [photoUri]
 * @property {string}      rangerId
 * @property {string}      patrolId
 * @property {string}      parkId
 * @property {{ enabledIncidentTypes: string[] }} park
 * @property {import('../ports/incidentRepository').IncidentRepository} incidentRepo
 * @property {import('../ports/remoteIncidentGateway').RemoteIncidentGateway} gateway
 * @property {import('../../../core/services/connectivity/ConnectivityMonitor').ConnectivityMonitor} connectivityMonitor
 * @property {{ now: () => number, iso: () => string }} clock
 * @property {{ generate: () => Promise<string> }} idGenerator
 */

/**
 * Log a new patrol incident.
 *
 * Validates the fields, creates the incident in PENDING_SYNC state,
 * persists it locally, then attempts an immediate sync if online.
 *
 * @param {LogIncidentParams} params
 * @returns {Promise<import('../domain/incident').Incident>} the final incident (may be SYNCED already)
 * @throws {ValidationError} if fields are invalid (E3)
 * @throws {StorageError} if local persistence fails (E4)
 */
export async function logIncident(params) {
  const {
    type, description, location, photoUri = null,
    rangerId, patrolId, parkId, park,
    incidentRepo, gateway, connectivityMonitor,
    clock, idGenerator,
  } = params;

  // E3 – validate; throws ValidationError on failure
  validate({ type, description, location, photoUri }, park);

  // Generate a stable client-side ID
  const id = await idGenerator.generate();
  const recordedAt = clock.iso();

  let incident = createIncident({
    id, type, description: description.trim(),
    location, photoUri, recordedAt,
    rangerId, patrolId, parkId,
  });

  // E4 – persist locally first; throw StorageError on failure
  try {
    await incidentRepo.save(incident);
  } catch (err) {
    throw new StorageError('Failed to save incident locally.', err);
  }

  // Immediate sync attempt if online
  if (connectivityMonitor.isOnline()) {
    incident = await _attemptSync(incident, gateway, incidentRepo, clock);
  }

  return incident;
}

/**
 * Attempt a single sync upload and update the repository with the result.
 * Internal helper — not exported.
 *
 * @param {import('../domain/incident').Incident} incident
 * @param {import('../ports/remoteIncidentGateway').RemoteIncidentGateway} gateway
 * @param {import('../ports/incidentRepository').IncidentRepository} repo
 * @param {{ iso: () => string }} clock
 * @returns {Promise<import('../domain/incident').Incident>}
 */
async function _attemptSync(incident, gateway, repo, clock) {
  try {
    const response = await gateway.upload(incident);

    if (response.result === 'STORED' || response.result === 'ALREADY_EXISTS') {
      const synced = markSynced(incident, clock.iso());
      await repo.update(synced);
      return synced;
    }

    // Gateway returned ERROR
    const failed = recordFailedAttempt(incident, response.error ?? 'Unknown error', clock);
    await repo.update(failed);
    return failed;

  } catch (err) {
    const failed = recordFailedAttempt(incident, err.message ?? 'Sync error', clock);
    await repo.update(failed);
    return failed;
  }
}

/**
 * Autosave a draft to the draft repository.
 *
 * @param {import('../domain/draft').Draft} draft
 * @param {import('../ports/draftRepository').DraftRepository} draftRepo
 * @returns {Promise<void>}
 */
export async function saveDraft(draft, draftRepo) {
  await draftRepo.save(draft);
}

/**
 * Find an existing in-progress draft (for E1 crash recovery).
 *
 * @param {import('../ports/draftRepository').DraftRepository} draftRepo
 * @returns {Promise<import('../domain/draft').Draft|null>}
 */
export async function findDraft(draftRepo) {
  return draftRepo.find();
}

/**
 * Discard the current draft.
 *
 * @param {import('../ports/draftRepository').DraftRepository} draftRepo
 * @returns {Promise<void>}
 */
export async function discardDraft(draftRepo) {
  await draftRepo.delete();
}

/**
 * Get the incident types enabled for a specific park.
 *
 * @param {{ enabledIncidentTypes: string[] }} park
 * @returns {import('../domain/incidentType').IncidentTypeEntry[]}
 */
export function getTypesForPark(park) {
  return getEnabledTypesForPark(park);
}

export default { logIncident, saveDraft, findDraft, discardDraft, getTypesForPark };
