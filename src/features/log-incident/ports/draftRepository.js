/**
 * Log Patrol Incident – Draft Repository Port
 *
 * Abstract contract for persisting the in-progress draft (E1 crash recovery).
 * Only one draft exists at a time.
 * Implementations: AsyncStorageDraftRepository (real), InMemoryDraftRepository (tests).
 *
 * @typedef {Object} DraftRepository
 * @property {(draft: import('../domain/draft').Draft) => Promise<void>} save
 * @property {() => Promise<import('../domain/draft').Draft|null>} find
 * @property {() => Promise<void>} delete
 */

export default {};
